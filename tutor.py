import jinja2
import os
import webapp2

from google.appengine.api import users

from models.student import Student


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

    def set_cookie(self, name, value):
        """Function to set an http cookie"""
        self.response.headers.add_header('Set-Cookie', '%s=%s; Path=/' % (name, value))

    def get_cookie(self, name):
        """Function to get the value of a named parameter of an http cookie"""
        return self.request.cookies.get(name)

        
class TutorPage(BaseHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            logoutURL = users.create_logout_url(self.request.uri)

            student = Student.get_or_create_current_student(user)

            template_values = {
                'logoutURL': logoutURL
            }

            self.set_cookie('currentLesson', student.current_unit)
            self.write_template('tutor.html', **template_values)
        else:
            loginURL = users.create_login_url(self.request.uri)
            
            self.redirect(loginURL)

    def post(self):
        current_lesson = self.request.get('ploverdojo_currentlesson')
        user = users.get_current_user()
        
        student = get_current_student(user)

        student.current_unit = int(current_lesson)
        self.set_cookie('currentLesson', student.current_unit)
        student.put()   

   
### ROUTER

app = webapp2.WSGIApplication([('/tutor/?', TutorPage)],
                              debug=True)