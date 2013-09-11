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
        
    def write_static_template(self, template, **template_values):
        """Wraps the template given with the static.html, and then presents that"""
        t = jinja_environment.get_template(template)
        template_values['content'] = t.render(template_values)
        
        self.write_template("static.html", **template_values)


class MainPage(BaseHandler):
    
    """Meant to serve the generic pages, not user-specific"""
    def get(self, *args):
        specific_page_requested = len(args) > 0
        user = users.get_current_user()
        template_values = {}
        if user:
            logout_url = users.create_logout_url('home.html')
            disciple = Disciple.get_current(user)
            template_values['logout_url'] = logout_url;
                      
        if specific_page_requested:
            try:
                self.write_static_template(args[0], **template_values)
            except:
                self.error(404)
                self.write_static_template("error.html", **template_values) 
        elif user:
            self.redirect('/dashboard')
        else:
            loginURL = users.create_login_url(self.request.uri)

            template_values['loginURL'] = loginURL
            
            self.write_static_template('home.html', **template_values)     
            
            
class LessonBrowserPage(BaseHandler):
    """User comes here to see which lesson to go to next"""
    def get(self, *args):
        user = users.get_current_user()
        template_values = {}
        if user:
            logout_url = users.create_logout_url('home.html')
            disciple = Disciple.get_current(user)
            template_values['logout_url'] = logout_url;
            self.write_template('lessonbrowser.html', **template_values)
        else:
            loginURL = users.create_login_url(self.request.uri)
            self.redirect(loginURL)

### ROUTER

app = webapp2.WSGIApplication([
                               ('/lessons', LessonBrowserPage),
                               ('/?', MainPage), 
                               ('/(.+)', MainPage)],
                              debug=True)
