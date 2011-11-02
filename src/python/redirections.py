from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

from google.appengine.api import urlfetch

import proxy_config

def make_proxy_handler(host):
    class Handler(webapp.RequestHandler):
        def get(self):
            query_string = self.request.query_string
            
            target_url = host + self.request.path
            if (len(query_string) > 0):
                target_url = target_url + "?" + query_string
            
            result = urlfetch.fetch(target_url)            
            if result.status_code == 200:
                self.response.headers["Content-Type"] = result.headers["content-type"]
                if "Connection" in result.headers:
                    self.response.headers["Connection"] = result.headers["Connection"]
                self.response.out.write(result.content)
            else:
                self.response.set_status(result.status_code)
                self.response.out.write(result.content)
        
        def post(self):
            target_url = host + self.request.path
            
            body = self.request.body
            result = urlfetch.fetch(url,
                                    payload=body,
                                    method=urlfetch.POST)
            
            if result.status_code == 200:
                self.response.headers["Content-Type"] = result.headers["content-type"]
                if "Connection" in result.headers:
                    self.response.headers["Connection"] = result.headers["Connection"]
                self.response.out.write(result.content)
            else:
                self.response.set_status(result.status_code)
                self.response.out.write(result.content)
    
    return Handler

def main():
    url_mapping = []
    for url_pattern, target in proxy_config.mappings.items():
        url_mapping.append(tuple([url_pattern, make_proxy_handler(target["host"])]))
    
    application = webapp.WSGIApplication(url_mapping,
                                         debug=True)
    util.run_wsgi_app(application)

if __name__ == '__main__':
    main()
