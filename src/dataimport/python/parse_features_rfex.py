#!/usr/bin/python
"""
Processing features from in data_matrix and gexp interesting. Sample values and identifiers will also be extracted. 
The required dataset label indicates the set of schemas. 
"""
import db_util
import sys
import os
import time
import compute_quantiles

features_hash = {}
gene_interesting_hash = {}
dataset_label = ""
feature_table = ""
sample_table = ""

if (not os.path.exists("./results")):
	os.system("mkdir results")

def populate_sample_meta(sampleList, config):
	"""
	sampleList needs to be a list of patients
	"""
	global dataset_label
	labelTokens = dataset_label.split("_")
	cancer_type = ""
	clabel = ""
	for label in labelTokens:
		for ct in db_util.getCancerTypes(config):
			if (label == ct):
				cancer_type = cancer_type + label + "_"	
	cancer_type = cancer_type[0:-1]
	clabel = dataset_label[len(cancer_type)+1:len(dataset_label)]			
	samColIndex = 0
	for sam in sampleList:
		#REPLACE INTO `tcga`.`SampleMeta` (sample_key,cancer_type,dataset_label,matrix_col_offset,meta_json) VALUES ('a' /*not nullable*/,'s' /*not nullable*/,'s' /*not nullable*/,0,'s');		
		insertSampleSql = "replace into sample_meta (sample_key,cancer_type,dataset_label,matrix_col_offset,meta_json) values ('%s', '%s', '%s', '%i', '%s');" %(sam, cancer_type,clabel,samColIndex,"{age:X,status:someStatus,comments:some comments}")
		db_util.executeInsert(config, insertSampleSql)
		samColIndex += 1
	print "Done populating sample list for " + dataset_label

def process_feature_annotations(annotation_path):
	print "\nProcessing annotations %s \n" %(annotation_path) 
	annotation_hash = {}
	if (annotation_path == "" or (not os.path.isfile(annotation_path))):
		print "annotations path %s not defined or not a file " %(annotation_path)
		return annotation_hash
	anno_file = open(annotation_path, "r")
        #line 1 is headers
	lc = 0
	feature_types = {}
	for l in anno_file.readlines():
		if (lc == 0):
			lc += 1
			continue
		tk = l.strip().split("\t")		
		if (len(tk) >= 4 and len(tk[3]) < 3):
			tk[3] = "chr" + tk[3]		
		annotation_hash[tk[0]] = l[0:1] + "\t" + "\t".join(tk[1:]) + "\t" + str(lc)
		#else:
		#for clinical and other unmapped features
		#	annotation_hash[tk[0]] = l[0:1] + "\t" + "\t".join(tk[1:])
		if (feature_types.get(tk[1]) == None):			
			feature_types[tk[1]] = 1;
		lc += 1
	anno_file.close()
	return (annotation_hash, feature_types)

def process_feature_matrix(dataset_label, matrix_file, persist_sample_meta, config, annotations="", quantileFeatures=""):	
	global features_hash
	print ("processing feature set: matrix file %s annotation file %s"%(matrix_file, annotations))
	out_hash = {}
	features_hash = {}
	mydb = db_util.getDBSchema(config) 
	myuser = db_util.getDBUser(config) 
	mypw = db_util.getDBPassword(config)
	myhost = db_util.getDBHost(config)
	myport = db_util.getDBPort(config)
	if (not os.path.isfile(matrix_file)):
	        print "ERROR\n" + matrix_file + " does not exist; unrecoverable ERROR"
		sys.exit(-1)
	feature_matrix_file = open(matrix_file, "r")
	feature_table = mydb + "." + dataset_label + "_features"
	sample_table = mydb + "." + dataset_label + "_patients"
	fshout = open('./results/' + dataset_label + '_load_features.sh','w')
	outfile = open('./results/' + dataset_label + '_features_out.tsv','w')
	sampleOutfile = open('./results/' + dataset_label + '_sample_values_out.tsv','w')
	featureId = 0
	annotation_hash, ftypes = process_feature_annotations(annotations)
	sub_afm_out = {}
	#for k in ftypes.keys():		
	#	sub_afm_out[k] = open('./results/' + dataset_label + '_' + k + '.afm','w')
	#if (len(sub_afm_out) == 0):
	#implies that annotations are not used, define out files for feature types from config
	for q in quantileFeatures.split(","):
		sub_afm_out[q] = open('./results/' + dataset_label + '_' + q + '.afm','w')
	
	for line in feature_matrix_file:
		line = line.strip()	
		tokens = line.split('\t')
		afmid = ""
		if (featureId == 0):                
                	sampleIds = ":".join(tokens[0:len(tokens)-1])
			if (persist_sample_meta == 1):
				populate_sample_meta(sampleIds.split(":"), config)				
			sampleOutfile.write(sampleIds + "\n");
			featureId += 1
			continue
		if (not features_hash.get(tokens[0]) and len(tokens[0]) > 1):
			valuesArray = []
			alias = tokens[0]
			afmid = alias
			if (len(alias.split(":")) < 3):
				#afmid = alias
				annotated_feature = annotation_hash.get(alias)
				if (annotated_feature == None):
					print "ERROR: AFM feature %s is not in annotation" %(alias)
					sys.exit(-1)
				#put features in sub afm files for quantile calculation
				ftype = annotated_feature.split("\t")[1]
				if (sub_afm_out.get(ftype) != None):
					sub_afm_out[ftype].write(line + "\n")				
				alias = annotated_feature.replace("\t", ":")
				featureId = int(alias.split(":")[-1])	
			alias = alias.replace('|', '_')
			features_hash[tokens[0]] = featureId
			data = alias.split(':')
			if (len(data) < 7):
				if (data[1] == 'CLIN' or data[1] == 'SAMP'):
					alias = ":".join(data[0:3]) + "::::"
					data = alias.split(':')
				else: 
					print "Skipping %s feature matrix annotation string missing required token lengths Category:Type:Name:Chr:Start:Stop:Strand" %(alias)
					continue
			if len(data[3]) > 3:
				data[3] = data[3][3:]
			if (len(data) == 7):
				alias = alias + ":"
				data.append("")
			patient_values = ":".join(tokens[1:len(tokens)-1])
			for val in tokens[1:(len(tokens)-1)]:
				if (db_util.is_numeric(val)):
					valuesArray.append(float(val))
				else:
					valuesArray.append(0.0)
			patient_value_mean = sum(valuesArray)/len(valuesArray)
			#outfile.write(str(featureId) + "\t" + alias + "\t" + "\t".join(data) + "\t" + patient_values + "\t" + str(patient_value_mean) + "\n")
			out_hash[afmid] = str(featureId) + "\t" + alias + "\t" + "\t".join(data) + "\t" + patient_values + "\t" + str(patient_value_mean)
		else:
			print "duplicated feature in feature set:" + tokens[0]
		featureId += 1
	quantiles_out = {} 
	for ftype in sub_afm_out.keys():
                        sub_afm_out[ftype].close()
			q_out = "./results/" + dataset_label + "_" + ftype + "_qo.tsv"
			#get quantile from timo and add back to alias string and then write
			compute_quantiles.compute_quantiles(sub_afm_out[ftype].name, q_out)
			quantiles_out[ftype] = open(q_out, "r")
			#featureId\tval\tQX
			qdic = {}
			for ql in quantiles_out[ftype].readlines():
				qtk = ql.strip().split("\t")
				afmkey = qtk[0]
				fv = qtk[1]
				fq = qtk[2]
				qdic[afmkey] = fv + "\t" + fq  
				fline = out_hash.get(afmkey)
				if (fline != None):
					out_hash[afmkey] = fline + "\t" + fv + "\t" + fq
				#need to confirm and make sure that the new two columns in schema is defined with initial value of NULL
				#else:
				#	out_hash[afmkey] = fline + "\t" + "\t"		
	for val in out_hash.values():
		outfile.write(val + "\n")					
		
	feature_matrix_file.close()
	outfile.close()
	sampleOutfile.close()
	fshout.write("#!/bin/bash\n")
	fshout.write("mysql -h %s --port %s --user=%s --password=%s --database=%s<<EOFMYSQL\n" %(myhost, myport, myuser, mypw, mydb))
	fshout.write("load data local infile '" + outfile.name + "' replace INTO TABLE " + feature_table + " fields terminated by '\\t' LINES TERMINATED BY '\\n';\n")
	fshout.write("load data local infile '" + sampleOutfile.name + "' replace INTO TABLE " + sample_table + " fields terminated by '\\t' LINES TERMINATED BY '\\n';\n")
	fshout.write("\ncommit;\nEOFMYSQL")
	fshout.close()
	print "processing done, running bulk load on %i features  %s" %(len(features_hash), time.ctime())
	if (persist_sample_meta == 1):
		os.system("sh " + fshout.name)
	return annotation_hash

def getFeatures():
	return features_hash

def getFeatureId(featureStr):
        return features_hash.get(featureStr)

def getGeneInterestScore(featureStr):
	global gene_interesting_hash
	return gene_interesting_hash.get(featureStr)
 
def process_gexp_interest_score(interest_score_file, configfile):
	"""
	Requires valid full path gexp_interest file, extend this to accept other feature specific values, but schema needs to be defined
	"""
	global features_hash, dataset_label
	config = db_util.getConfig(configfile)
        mydb = db_util.getDBSchema(config) #config.get("mysql_jdbc_configs", "db")
        myuser = db_util.getDBUser(config) #config.get("mysql_jdbc_configs", "username")
        mypw = db_util.getDBPassword(config) #config.get("mysql_jdbc_configs", "password")
        myhost = db_util.getDBHost(config) #config.get("mysql_jdbc_configs", "host")
        myport = db_util.getDBPort(config)
        print "Begin processing feature specific values %s" %(time.ctime())
	gexp_interesting_file = open(interest_score_file)
        gexp_sh = open('./results/load_gexp_interesting_' + dataset_label + '.sh','w')
        gexp_sql = open('./results/gexp_interesting_score_' + dataset_label + '.sql','w')
	for line in gexp_interesting_file:
                tokens = line.strip().split("\t")
                gene_interesting_hash[tokens[0]] = tokens[1]
                gexp_sql.write("update %s set gene_interesting_score = %s where id = %i;\n" %(feature_table, tokens[1], features_hash.get(tokens[0])))
        gexp_sql.write("commit;\n")
        gexp_interesting_file.close()
        gexp_sql.close()
        gexp_sh.write("#!/bin/bash\n")
        gexp_sh.write('mysql -h ' + myhost + ' --port ' + myport + ' -u' + myuser + ' -p'+ mypw + ' < ' + gexp_sql.name + '\n')
        gexp_sh.write("\necho done updating gexp_interesting")
        gexp_sh.close()
	print "finished feature matrix bulk upload  %s" %(time.ctime())
	return gexp_sh

def process_pathway_associations(gsea_file_path, configfile):
	global features_hash, dataset_label
	config = db_util.getConfig(configfile)
        mydb = db_util.getDBSchema(config) #config.get("mysql_jdbc_configs", "db")
        myuser = db_util.getDBUser(config) #config.get("mysql_jdbc_configs", "username")
        mypw = db_util.getDBPassword(config) #config.get("mysql_jdbc_configs", "password")
        myhost = db_util.getDBHost(config) #config.get("mysql_jdbc_configs", "host")
        myport = db_util.getDBPort(config)

	gsea_file = open(gsea_file_path, 'r')
	pathway_hash = {}
	feature_pathways_table = mydb + "." + dataset_label + "_feature_pathways" 
	gsea_sh = open('./results/load_gsea_' + dataset_label + '.sh','w')   
	gsea_tsv_out = open('./results/gsea_processed_' + dataset_label + '.tsv','w')     
	for line in gsea_file:
		tokens = line.strip().split('\t')
		pathway = tokens[0].split(":")[2]
		feature = tokens[1]
		pvalue = tokens[2]
		pathway_type = ""
		pathway_name = ""
		if (not pathway_hash.get(tokens[0])):
			pathway_hash[tokens[0]] = tokens[0]
		if (pathway.find("KEGG") != -1):
			pathway_type = "KEGG"
			pathway_name = pathway.replace("KEGG_", "")
		elif (pathway.find("WIKIPW") != -1):
			pathway_type = "WIKIPW"
			pathway_name = pathway.replace("_WIKIPW", "")
		elif (pathway.find("BIOCARTA") != -1):
			pathway_type = "BIOCARTA"
			pathway_name = pathway.replace("BIOCARTA", "")
		else:
			pathway_type = ""
			pathway_name = pathway
		gsea_tsv_out.write(str(features_hash.get(feature)) + "\t" + feature + "\t" + pathway_name + "\t" + pathway_type + "\t" + pvalue + "\n")
	gsea_file.close()
	gsea_tsv_out.close()
	gsea_sh.write("#!/bin/bash\n")
	gsea_sh.write("mysql -h % --port %s --user=%s --password=%s --database=%s<<EOFMYSQL\n" %(myhost, myport, myuser, mypw, mydb))
	gsea_sh.write("load data local infile '" + gsea_tsv_out.name + "' replace INTO TABLE " + feature_pathways_table + " fields terminated by '\\t' LINES TERMINATED BY '\\n';")
	gsea_sh.write("\ncommit;")
	gsea_sh.write("\nEOFMYSQL")
	gsea_sh.close()	
	print "done loading pathway associations %s" %(time.ctime())
	return gsea_sh

def subprocessAssociationIndex(assoc_file_path, assoc_type, association_index_out):
	global features_hash
	assoc_file = open(assoc_file_path,'r')
	for line in assoc_file:
		tokens = line.strip().split("\t")
		feature = tokens[0]
		score = tokens[1]
		association_index_out.write(str(features_hash.get(feature)) + "\t" + feature + "\t" + assoc_type + "\t" + score + "\n")
	assoc_file.close()
	return

def processGeneAssociation(datapath, configfile):
	"""
	-rwxr-xr-- 1 terkkila cncrreg    624887 May 31 00:20 GEXP_CLIN_association_index.tsv*
	-rwxr-xr-- 1 terkkila cncrreg    642188 May 31 00:16 GEXP_CNVR_association_index.tsv*
	-rwxr-xr-- 1 terkkila cncrreg    625082 May 31 00:18 GEXP_GNAB_association_index.tsv*
	-rwxr-xr-- 1 terkkila cncrreg    645677 May 31 00:14 GEXP_METH_association_index.tsv*
	-rwxr-xr-- 1 terkkila cncrreg    626148 May 31 00:17 GEXP_MIRN_association_index.tsv*
	-rwxr-xr-- 1 terkkila cncrreg    629823 May 31 00:21 GEXP_SAMP_association_index.tsv*
	"""
	global features_hash, dataset_label
	config = db_util.getConfig(configfile)
        mydb = db_util.getDBSchema(config) #config.get("mysql_jdbc_configs", "db")
        myuser = db_util.getDBUser(config) #config.get("mysql_jdbc_configs", "username")
        mypw = db_util.getDBPassword(config) #config.get("mysql_jdbc_configs", "password")
        myhost = db_util.getDBHost(config) #config.get("mysql_jdbc_configs", "host")
        myport = db_util.getDBPort(config)

	association_index_table = mydb + "." + dataset_label + "_association_index"
	association_index_out = open('./results/association_index_processed_' + dataset_label + '.tsv','w')
	association_index_sh = open('./results/load_association_index_' + dataset_label + '.sh','w')
	
	if (os.path.exists(path + "/GEXP_CLIN_association_index.tsv")):
		subprocessAssociationIndex(path + "/GEXP_CLIN_association_index.tsv", "GEXP_CLIN", association_index_out)
	if (os.path.exists(path + "/GEXP_CNVR_association_index.tsv")):
		subprocessAssociationIndex(path + "/GEXP_CNVR_association_index.tsv", "GEXP_CNVR", association_index_out) 
	if (os.path.exists(path + "/GEXP_GNAB_association_index.tsv")):
		subprocessAssociationIndex(path + "/GEXP_GNAB_association_index.tsv", "GEXP_GNAB", association_index_out)
	if (os.path.exists(path + "/GEXP_METH_association_index.tsv")):
		subprocessAssociationIndex(path + "/GEXP_METH_association_index.tsv", "GEXP_METH", association_index_out)
	if (os.path.exists(path + "/GEXP_MIRN_association_index.tsv")):
		subprocessAssociationIndex(path + "/GEXP_MIRN_association_index.tsv", "GEXP_MIRN", association_index_out)
	if (os.path.exists(path + "/GEXP_SAMP_association_index.tsv")):
		subprocessAssociationIndex(path + "/GEXP_SAMP_association_index.tsv", "GEXP_SAMP", association_index_out)
	
	association_index_out.close()
	association_index_sh.write("#!/bin/bash\n")
        association_index_sh.write("mysql -h %s --port %s --user=%s --password=%s --database=%s<<EOFMYSQL\n" %(myhost, myport, myuser, mypw, mydb))
        association_index_sh.write("load data local infile '" + association_index_out.name + "' replace INTO TABLE " + association_index_table + " fields terminated by '\\t' LINES TERMINATED BY '\\n';")
        association_index_sh.write("\ncommit;")
        association_index_sh.write("\nEOFMYSQL")
        association_index_sh.close()
	os.system("sh " + association_index_sh.name)

if __name__ == "__main__":
	global datast_label
	print "Parsing features kicked off %s" %time.ctime()
	if (len(sys.argv) < 3):
        	print 'Usage is py2.6 parse_features_rfex.py data_matrix.tsv dataset_label'
        	sys.exit(1)
	dataset_label = sys.argv[2]
	print "\nin parse_features_rfex : dataset_label = <%s>\n" % dataset_label
	configfile = sys.argv[3]
	config = db_util.getConfig(configfile)
	annotations = ""
	if (len(sys.argv) >= 5):
		annotations = sys.argv[4]
	quantileFeatures = ""
	if (len(sys.argv) >= 6):
		quantileFeatures = sys.argv[5]
	process_feature_matrix(dataset_label, sys.argv[1], 1, config, annotations, quantileFeatures)	
	#os.system("sh " + sh.name)
	path = sys.argv[2].rsplit("/", 1)[0] 
	if (os.path.exists(path + "/GEXP_interestingness.tsv")):
		sh = process_gexp_interest_score(path + "/GEXP_interestingness.tsv", configfile)	
		os.system("sh " + sh.name)
	if (os.path.exists(path + "/gsea_associations.tsv")):
		sh = process_pathway_associations(path + "/gsea_associations.tsv", configfile)
		os.system("sh " + sh.name)
	processGeneAssociation(path,configfile)		
	print "Done with processing feature relating loads %s " %(time.ctime())

