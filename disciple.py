import os
import webapp2
import json

from google.appengine.api import users

from models.disciple import Disciple

from dictionary import Dictionary

from helpers import Exceptions

# ## HANDLERS

class BaseHandler(webapp2.RequestHandler):
    def __init__(self, request=None, response=None):
        self.initialize(request, response)
        self.error_msg = ''
        try:
            self.dictionary = Dictionary.create_default()
        except Exception, e:
            self.error_msg += Exceptions.print_exception(e)

class Lookup(BaseHandler):
    def __init__(self, request=None, response=None):
        BaseHandler.__init__(self, request, response)
            
    def set_cookie(self, name, value):
        """Function to set an http cookie"""
        self.response.headers.add_header('Set-Cookie', '%s=%s; Path=/' % (name, value))
    
    """Performs lookup on dictionary"""
    def get(self):
        user = users.get_current_user()
        if user:
            if self.request.get('keys'):
                try:
                    filtered = []
                    data = self.dictionary.filter(self.request.get('keys'), self.request.get('require'))
                    
                    for k in data:
                        filtered.append({'value': data[k], 'stroke': k, 'mastery': 0})
                        
                    
                except Exception, e:
                    self.error_msg += Exceptions.format_exception(e)
                
                if self.error_msg is not '':
                    self.set_cookie('error', str(self.error_msg))
                    self.response.out.write(str(self.error_msg))
                else:
                    self.response.out.write(json.dumps(filtered))
        else:
            self.redirect(users.create_login_url(self.request.uri))  
            

class Debug(BaseHandler):
    def __init__(self, request=None, response=None):
        BaseHandler.__init__(self, request, response)
    
    def get(self):
        data = self.dictionary.debug_list_missing_words()
        self.response.out.write(json.dumps(data))

# ## ROUTER

app = webapp2.WSGIApplication([
                               ('/disciple/dictionary', Lookup),
                               ('/disciple/debug/dictionary', Debug)
                               ],
                              debug=True)
