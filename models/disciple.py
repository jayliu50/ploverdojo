from google.appengine.ext import db

class Disciple(db.Model):
    """Models a disciple of the dojo."""
    user_id = db.StringProperty();
    
    # farthest the disciple has gone
    tutor_max_lesson = db.IntegerProperty();
    
    # a bookmark with the format [lesson].[slide]
    tutor_current_lesson = db.StringProperty();
    
    # if True, will go to a dashboard instead of loading up all the introductory content
    skip_introduction = db.BooleanProperty()

    @staticmethod
    def get_current(user):
        disciple = db.GqlQuery("SELECT * FROM Disciple " +
                                   "WHERE user_id = :1 ",
                                   user.user_id())
        disciple = disciple.get()

        if not disciple:
            disciple = Disciple(user_id = user.user_id(), tutor_max_lesson = 0, tutor_current_lesson = "0.0")
            disciple.put()
        
        return disciple
        