Ext.ns('org.systemsbiology.pages.apis.notes');

org.systemsbiology.pages.apis.notes.Editor = Ext.extend(Object, {
    htmlEditor: null,

    constructor: function(config) {
        Ext.apply(this, config);

        org.systemsbiology.pages.apis.notes.Editor.superclass.constructor.call(this);

        Ext.Ajax.request({
            method: "get",
            url: this.notesUrl,
            success: function(o) {
                this.htmlEditor = new Ext.form.HtmlEditor({
                    defaultValue: o.responseText,
                    width: 800,
                    height: 300
                });

                var saveBtn = new Ext.Button({ text: "Save" });
                saveBtn.on("click", this.SaveNotes, this);

                var win = new Ext.Window({
                    contentEl: this.contentEl,
                    layout:'fit',
                    width:600,
                    height:400,
                    closeAction:'hide',
                    border: true, frame:true, plain: false,
                    minimizable: true, maximizable: true, animCollapse: true,
                    autoScroll:true,
                    bodyBorder:true,
                    modal: false, floating: true,
                    shadow: true,
                    title: "Notes",
                    titleCollapse: true,
                    items: [ this.htmlEditor ],
                    fbar: [ saveBtn ]
                });
                win.show();
            },
            scope: this
        });
    },

    SaveNotes: function() {
        if (this.htmlEditor) {
            Ext.Ajax.request({
                url: this.notesUrl,
                method: "POST",
                params: {
                    content: this.htmlEditor.getValue()
                }
            });
        }
    }
});
