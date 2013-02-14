import hashlib
import hmac
import jinja2
import os
import re
import webapp2
import json

from google.appengine.ext import db
from google.appengine.api import users


template_directory = os.path.join(os.path.dirname(__file__), 'templates')
jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(template_directory), autoescape=True)


hmac_message = os.path.join(os.path.dirname(__file__), 'secret/message')
f = open(hmac_message, 'r')
SECRET = f.read().strip()
f.close()

lessons_path = os.path.join(os.path.dirname(__file__), 'lessons/keyboard.json')
l = open(lessons_path, 'r')
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


class MainPage(BaseHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            try:
                quizNo = int(self.request.get('quiz'))
                if(quizNo >= len(LESSONS)):
                    quizNo = 1
            except:
                quizNo = 1
            self.set_cookie("testdata", json.dumps(LESSONS[quizNo - 1]["test"]))
            self.write_template('ploverquiz.html', **{
                'user': user,
                'quizNo': quizNo,
                'lessonDescription': LESSONS[quizNo - 1]["description"],
                'hasNext': ((quizNo + 1) < len(LESSONS)),
                'hasPrevious': (quizNo > 1),
                'login_href': users.create_logout_url(self.request.uri),
                'login_content': 'Logout'

            })
        else:
            self.redirect(users.create_login_url(self.request.uri))


app = webapp2.WSGIApplication([('/ploverquiz.html', MainPage)], debug=True)
