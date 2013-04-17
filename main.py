import jinja2
import os
import webapp2

from google.appengine.api import users

from models.disciple import Disciple

template_directory = os.path.join(os.path.dirname(__file__), 'templates')
jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(template_directory), autoescape=True)


def render_template(template, **template_values):
    """Renders the given template with the given template_values"""
    # retrieve the html template
    t = jinja_environment.get_template(template)

    # render the html template with th given dictionary
    return t.render(template_values)


### HANDLERS

class BaseHandler(webapp2.RequestHandler):
    """Represents a handler which contains functions necessary for multiple handlers"""
    def write_template(self, template, **template_values):
        """Function to write out the given template with the given
        template_values"""
        self.response.out.write(render_template(template, **template_values))


class MainPage(BaseHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            logout_url = users.create_logout_url(self.request.uri)

            disciple = Disciple.get_current(user)
            template_values = {
                'logout_url': logout_url
            }
            if(disciple and hasattr(disciple, 'skip_introduction') and disciple.skip_introduction):
                self.write_template('dashboard.html', **template_values)
            else:
                disciple.skip_introduction = True
                disciple.put()
                self.write_template('introduction.html', **template_values)
        else:
            loginURL = users.create_login_url(self.request.uri)

            template_values = {
                'loginURL': loginURL,
            }
            
            self.write_template('introduction.html', **template_values)
            

   
### ROUTER

app = webapp2.WSGIApplication([('/?', MainPage)],
                              debug=True)