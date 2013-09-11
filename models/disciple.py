from google.appengine.ext import db
import json

class Disciple(db.Model):
    """Models a disciple of the dojo."""
    user_id = db.StringProperty()
    
    # farthest the disciple has gone
    tutor_max_lesson = db.IntegerProperty()
    
    # a bookmark with the format [lesson].[slide]
    tutor_current_lesson = db.StringProperty()
    
    # if True, will go to a dashboard instead of loading up all the introductory content
    skip_introduction = db.BooleanProperty()
    
    # holds what the user has recently mastered in the format { 'datestring' : [words,,,] }
    recent_mastered_json = db.TextProperty()
    
    # holds the entire user mastery record in the format { 'word' : 100 } where 100 is fully mastered, and 0 or missing key is unvisited.
    word_mastery_json = db.TextProperty()

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
    
    def update_mastery(self, words):
        """takes in a list of words that the user has practiced on"""
        word_mastery = json.loads(self.word_mastery_json)
        
        if not word_mastery:
            word_mastery = {}
            
        for w in words:
            word_mastery[w] = 100 # currently: if the user has practiced them in a quiz, they are considered mastered :P
                
        self.word_mastery_json = json.dumps(word_mastery)
        self.put()
                
        