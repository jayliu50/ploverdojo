import hashlib
import hmac
import jinja2
import os
import re
import webapp2
import json

from google.appengine.api import users

from models.disciple import Disciple

from dictionary import Dictionary

from helpers import Exceptions

template_directory = os.path.join(os.path.dirname(__file__), 'templates')
jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(template_directory), autoescape=True)

hmac_message = os.path.join(os.path.dirname(__file__), 'secret/message')
f = open(hmac_message, 'r')
SECRET = f.read().strip()
f.close()

# todo: lessons/keyboard.json is obsolete. refactor to pull assets/tutorLessons.json in quiz.js
l = open(os.path.join(os.path.dirname(__file__), 'lessons/keyboard.json'), 'r')
LESSONS = json.load(l)
l.close()


def render_template(template, **template_values):
    """Renders the given template with the given template_values"""
    # retrieve the html template
    t = jinja_environment.get_template(template)

    # render the html template with th given dictionary
    return t.render(template_values)


def create_salt():
    return hashlib.sha256(os.urandom(16)).hexdigest()


def create_salt_hash_pair(input, salt=None):
    if not salt:
        salt = create_salt()
    hash = hmac.new(SECRET, salt + input, hashlib.sha256).hexdigest()
    return "%s|%s" % (salt, hash)


def validate_salt_hash_pair(input, hash):
    salt = hash.split('|')[0]
    return hash == create_salt_hash_pair(input, salt)


def create_value_salt_hash_triplet(value, salt=None):
    if not salt:
        salt = create_salt()
    hash = hmac.new(SECRET, str(value) + salt).hexdigest()
    return "%s|%s|%s" % (value, salt, hash)


def validate_value_salt_hash_triplet(hash):
    value = hash.split('|')[0]
    salt = hash.split('|')[1]
    if hash == create_value_salt_hash_triplet(value, salt):
        return value


class BaseHandler(webapp2.RequestHandler):
    """Represents a handler which contains functions necessary for multiple
    handlers"""
    def write_template(self, template, **template_values):
        """Function to write out the given template with the given
        template_values"""
        self.response.out.write(render_template(template, **template_values))

    def set_cookie(self, name, value):
        """Function to set an http cookie"""
        self.response.headers.add_header('Set-Cookie', '%s=%s; Path=/' % (name, value))

    def get_cookie(self, name):
        """Function to get the value of a named parameter of an http cookie"""
        return self.request.cookies.get(name)

    def set_encrypted_cookie(self, name, value):
        """Function to set an http cookie"""
        self.response.headers.add_header('Set-Cookie', '%s=%s; Path=/' % (name, create_value_salt_hash_triplet(value)))

    def get_encrypted_cookie(self, name):
        """Function to get the value of a named parameter of an http cookie"""
        return validate_value_salt_hash_triplet(self.request.cookies.get(name))


class QuizPage(BaseHandler):
    
    def get(self):
        user = users.get_current_user()
        if user:
            template_args = {
                             'user': user,
                             'login_href': users.create_logout_url('/'),
                             'login_content': 'Logout'}
            
            mode = self.request.get('mode')
            if mode == 'key':
                stage = self.request.get('stage')
                current_lesson = 1
                # unit number from the URL should override that from the database
                if(self.request.get('unit')):
                    current_lesson = int(self.request.get('unit'))
                    if(current_lesson >= len(LESSONS)):
                        current_lesson = 1
                else:
                    disciple = Disciple.get_current(user)
                        
                isReview = (stage == 'review' or current_lesson == 1)
                
                config = '?unit=%d' % (current_lesson)
                if stage:
                    config += '&stage=%s' % stage
                    
                self.set_cookie('quiz_config', str(config))
                self.set_cookie('current_lesson', current_lesson)
                self.set_cookie('is_review', isReview)
                
                template_args.update({
                    'current_lesson': current_lesson,
                    'is_review': isReview,
                    'lessonDescription': LESSONS[current_lesson - 1]["description"]
                })
                
                
                self.write_template('quiz-key.html', **template_args)
            elif mode == 'word':
                # the words to be quizzed should have already been loaded into the cookie
                
                self.write_template('quiz-word.html', **template_args)
                
                
        else:
            self.redirect(users.create_login_url(self.request.uri))



class QuizData(BaseHandler):
    """In charge of querying the quiz data, with user-specific metadata attached"""
    def __init__(self,request=None, response=None):
        self.initialize(request, response)
        self.errorMsg = ''
        try:
            self.dictionary = Dictionary.create_default()
        except Exception as e:
            print Exceptions.format_exception(e)
        
    def get(self):
        user = users.get_current_user()
        if user:
            if self.request.get('keys'):
                try:
                    filtered = self.dictionary.filter(self.request.get('keys'), self.request.get('require'))
                            
                    self.dictionary.augment_with_rank(filtered)
                    
                    material = self.dictionary.prepare_for_quiz(filtered)
                    
                except Exception, e:
                    print Exceptions.format_exception(e)
                
                if self.errorMsg is not '':
                    self.set_cookie('error', str(self.errorMsg))
            
                self.response.out.write(json.dumps(material))    
            elif self.request.get('unit'):
                material = self.get_material(int(self.request.get('unit')) - 1, self.request.get('stage') == 'review')
                self.response.out.write(material)
            elif self.request.get('recent'):
                disciple = Disciple.get_current(user)
                material = self.dictionary.prepare_for_quiz(json.loads(disciple.recent_mastered))
                self.response.out.write(json.dumps(material))
        else:
            self.redirect(users.create_login_url(self.request.uri))
            
    
    def get_material(self, unitIndex, isCumulative):
        stuff = LESSONS[unitIndex]["quiz"]
        if(isCumulative and unitIndex > 0):
            stuff = LESSONS[unitIndex]["quiz"]
            for i in reversed(range(0, unitIndex)):
                stuff = dict(stuff.items() + LESSONS[i]["quiz"].items())    
                    
        stuff = [int(i) for i in stuff.keys()]    
        return stuff;
    
app = webapp2.WSGIApplication([('/quiz/?', QuizPage),
                               ('/quiz/data', QuizData)], debug=True)
        
