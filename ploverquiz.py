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


class MainPage(BaseHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            stage = self.request.get('stage')
            
            unitNo = 1
            # unit number from the URL should override that from the database
            if(self.request.get('unit')):
                unitNo = int(self.request.get('unit'))
                if(unitNo >= len(LESSONS)):
                    unitNo = 1
            else:
                player = get_current_player(user)
                if(player and hasattr(player, 'last_unit_completed') and player.last_unit_completed):
                    unitNo = int(player.last_unit_completed)
                    
            material = self.get_material(unitNo - 1, stage == 'review')
            isReview = (stage == 'review' or unitNo == 1)
            self.set_cookie('testdata', json.dumps(material))
            self.set_cookie('unitNo', unitNo)
            self.set_cookie('isReview', isReview )
            self.write_template('ploverquiz.html', **{
                'user': user,
                'unitNo': unitNo,
                'isReview': isReview,
                'lessonDescription': LESSONS[unitNo -1]["description"],
                'hasNext': ((unitNo + 1) < len(LESSONS)),
                'hasPrevious': (unitNo > 1),
                'login_href': users.create_logout_url(self.request.uri),
                'login_content': 'Logout'
            })
        else:
            self.redirect(users.create_login_url(self.request.uri))

    def get_material(self, unitIndex, isCumulative):
        if(isCumulative and unitIndex > 0):
            stuff = LESSONS[unitIndex]["test"]
            for i in reversed(range(0, unitIndex)):
                stuff = dict(stuff.items() + LESSONS[i]["test"].items())
            return stuff
            
        return LESSONS[unitIndex]["test"]
        
    def post(self):
        user = users.get_current_user()
        #stage = self.request.get('stage')
        
        player = get_or_create_current_player(user)
        player.last_unit_completed = int(self.request.get('unit'))
        player.put()
        
app = webapp2.WSGIApplication([('/ploverquiz.html', MainPage)], debug=True)


class Player(db.Model):
  """ models an individual player and their current progress """
  #name = db.StringProperty(required=True)
  registration_date = db.DateProperty(auto_now_add=True)
  #new_hire_training_completed = db.BooleanProperty(indexed=False)
  email = db.StringProperty()
  
  # contains the number of the last unit completed by the player, of the current phase
  last_unit_completed = db.IntegerProperty()
  
  # marks the overall progress of the player
  current_training_phase = db.StringProperty(choices=set(
    [ "keyboard"
    , "alphabet"
    , "dictionary"]
    ), default="keyboard")
    
  # date the last time this object was updated
  last_updated = db.DateTimeProperty(auto_now=True)

def player_key(player_id):
  """Constructs a Datastore key for a Player entity with the given id."""
  return db.Key.from_path('Player', player_id)

def get_or_create_current_player(user):
    player = Player.gql("WHERE ANCESTOR IS :1 LIMIT 1", player_key(user.user_id())).fetch(1)
    # convert player query to object (is this bad code?)
    if(not player or len(player) is 0):
        player = Player(parent=player_key(user.user_id()))
    else:
        player = player[0]
        
    return player
    
def get_current_player(user):
    player = Player.gql("WHERE ANCESTOR IS :1 LIMIT 1", player_key(user.user_id())).fetch(1)
    # convert player query to object (is this bad code?)
    if(not player or len(player) is 0):
        return None
    else:
        player = player[0]
        
    return player