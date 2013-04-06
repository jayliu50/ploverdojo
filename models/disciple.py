from google.appengine.ext import db

class Disciple(db.Model):
    """Models a disciple of the dojo."""
    user_id = db.StringProperty();
    tutor_max_lesson = db.IntegerProperty();
    tutor_current_lesson = db.StringProperty();

    @staticmethod
    def get_or_create_current(user):
        disciple = db.GqlQuery("SELECT * FROM Disciple " +
                                   "WHERE user_id = :1 ",
                                   user.user_id())
        disciple = disciple.get()

        if not disciple:
            disciple = Disciple(user_id = user.user_id(), tutor_max_lesson = 0, tutor_current_lesson = "0.0")
            disciple.put()
        
        return disciple
        
    @staticmethod
    def get_current(user):
        disciple = db.GqlQuery("SELECT * FROM Disciple " +
                               "WHERE user_id = :1 ",
                               user.user_id())
        disciple = disciple.get()
        return disciple