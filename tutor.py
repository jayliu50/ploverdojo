import jinja2
import os
import webapp2

from google.appengine.ext import db
from google.appengine.api import users


template_directory = os.path.join(os.path.dirname(__file__), 'templates')
jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(template_directory), autoescape=True)


def render_template(template, **template_values):
    """Renders the given template with the given template_values"""
    # retrieve the html template
    t = jinja_environment.get_template(template)

    # render the html template with th given dictionary
    return t.render(template_values)


### CLASSES

class Player(db.Model):
    """Models a player."""
    user_id = db.StringProperty()


### HANDLERS

class BaseHandler(webapp2.RequestHandler):
    """Represents a handler which contains functions necessary for multiple handlers"""
    def write_template(self, template, **template_values):
        """Function to write out the given template with the given
        template_values"""
        self.response.out.write(render_template(template, **template_values))

        
class TutorPage(BaseHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            logoutURL = users.create_logout_url(self.request.uri)

            player = db.GqlQuery("SELECT * FROM Player " +
                                 "WHERE user_id = :1 ",
                                 user.user_id())
            player = player.get()

            if not player:
                player = Player(user_id = user.user_id())
                player.put()

            template_values = {
                'logoutURL': logoutURL
            }

            self.write_template('tutor.html', **template_values)
        else:
            loginURL = users.create_login_url(self.request.uri)

            template_values = {
                'loginURL': loginURL,
            }

            self.write_template('tutor.html', **template_values)

   
### ROUTER

app = webapp2.WSGIApplication([('/tutor/?', TutorPage)],
                              debug=True)