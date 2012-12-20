import jinja2
import os
import webapp2
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


class BaseHandler(webapp2.RequestHandler):
    """Represents a handler which contains functions necessary for multiple
    handlers"""
    def write_template(self, template, **template_values):
        """Function to write out the given template with the given
        template_values"""
        self.response.out.write(render_template(template, **template_values))


class MainPage(BaseHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            self.write_template('ploverquiz.html', **{'user': user})
        else:
            self.redirect(users.create_login_url(self.request.uri))


app = webapp2.WSGIApplication([('/ploverquiz.html', MainPage)], debug=True)
