from google.appengine.ext import db

class Student(db.Model):
    """ models an individual student and their current progress """
    #name = db.StringProperty(required=True)
    registration_date = db.DateProperty(auto_now_add=True)
    #new_hire_training_completed = db.BooleanProperty(indexed=False)
    email = db.StringProperty()
    
    # contains the number of the last unit completed by the student, of the current phase
    current_unit = db.IntegerProperty()
    
    # marks the overall progress of the student
    current_training_phase = db.StringProperty(choices=set(
        [ "keyboard"
        , "alphabet"
        , "dictionary"]
        ), default="keyboard")
      
    # date the last time this object was updated
    last_updated = db.DateTimeProperty(auto_now=True)

    @staticmethod
    def student_key(student_id):
        """Constructs a Datastore key for a Student entity with the given id."""
        return db.Key.from_path('Student', student_id)

    @staticmethod
    def get_or_create_current_student(user):
        student = Student.gql("WHERE ANCESTOR IS :1 LIMIT 1", Student.student_key(user.user_id())).fetch(1)
        # convert student query to object (is this bad code?)
        if(not student or len(student) is 0):
            student = Student(parent=Student.student_key(user.user_id()))
        else:
            student = student[0]
            
        return student
        
    @staticmethod
    def get_current_student(user):
        student = Student.gql("WHERE ANCESTOR IS :1 LIMIT 1", Student.student_key(user.user_id())).fetch(1)
        # convert student query to object (is this bad code?)
        if(not student or len(student) is 0):
            return None
        else:
            student = student[0]
            
        return student
