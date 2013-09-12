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
            
    def set_cookie(self, name, value):
        """Function to set an http cookie"""
        self.response.headers.add_header('Set-Cookie', '%s=%s; Path=/' % (name, value))

class Lookup(BaseHandler):
    def __init__(self, request=None, response=None):
        BaseHandler.__init__(self, request, response)
    
    def get(self):
        """Performs lookup on dictionary, augmenting with user's data"""
        user = users.get_current_user()
        if user:
            if self.request.get('keys'):
                try:
                    filtered = []
                    data = self.dictionary.filter(self.request.get('keys'), self.request.get('require'))

                    
                    for k in data:
                        filtered.append({'word': data[k], 'stroke': k})
                        
                    
                except Exception, e:
                    self.error_msg += Exceptions.format_exception(e)
                
                if self.error_msg is not '':
                    self.set_cookie('error', str(self.error_msg))
                    self.response.out.write(str(self.error_msg))
                else:
                    self.response.out.write(json.dumps(filtered))
        else:
            self.redirect(users.create_login_url(self.request.uri))

def check_user(handler):
    """Returns user profile information"""
    user = users.get_current_user()
    disciple = None
    if user:
        disciple = Disciple.get_current(user)        
    else:
        self.redirect(users.create_login_url(handler.request.uri))
        
    return disciple
            

class Profile(BaseHandler):
    def __init__(self, request=None, response=None):
        BaseHandler.__init__(self, request, response)
    
    def check_user(self):
        """Returns user profile information"""
        user = users.get_current_user()
        disciple = None
        if user:
            disciple = Disciple.get_current(user)        
        else:
            self.redirect(users.create_login_url(self.request.uri))
            
        return disciple
                
    def get(self):
        self.error(404)

            
    def post(self):
        """OBSOLETE Updates user profile information"""
        
        user = users.get_current_user()
        if user:
            disciple = Disciple.get_current(user)
            
            item_saving = self.request.get('item')
            
            if item_saving == 'key':
                # stage = self.request.get('stage')
                
                disciple = Disciple.get_current(user)
                disciple.tutor_max_lesson = int(self.request.get('current_lesson'))
                
            else:
                self.error(404)
            
            disciple.put()

    
class History(Profile):
    """Manages user filter history"""
    def __init__(self, request=None, response=None):
        Profile.__init__(self, request, response)
        
    def get(self):
        disciple = check_user(self)
        if disciple:
            self.response.out.write(disciple.filter_history_json)

    def post(self):
        disciple = check_user(self)
        if disciple:
            disciple.update_filter_history(self.request.body)
            disciple.put()
            
            
class Mastery(Profile):
    """Manages the word mastery list"""
    def __init__(self, request=None, response=None):
        Profile.__init__(self, request, response)
        
    def get(self):
        disciple = check_user(self)
        if disciple:
            self.response.out.write(disciple.word_mastery_json)

    def post(self):
        disciple = check_user(self)
        if disciple:
            disciple.update_mastery(json.loads(self.request.get('update_mastery')))
            
            disciple.put()

class Debug(BaseHandler):
    def __init__(self, request=None, response=None):
        BaseHandler.__init__(self, request, response)
    
    def get(self):
        data = self.dictionary.debug_list_missing_words()
        self.response.out.write(json.dumps(data))

# ## ROUTER

app = webapp2.WSGIApplication([
                               ('/disciple/profile/?', Profile),
                               ('/disciple/profile/mastery/?', Mastery),
                               ('/disciple/profile/history/?', History),
                               ('/disciple/dictionary', Lookup),
                               ('/disciple/debug/dictionary', Debug)
                               ],
                              debug=True)
