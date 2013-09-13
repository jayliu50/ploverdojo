from google.appengine.ext import db
import json
import time

class Disciple(db.Model):
    """Models a disciple of the dojo."""
    user_id = db.StringProperty()
    
    
    # a bookmark with the format [lesson].[slide]
    tutor_current_lesson = db.StringProperty()
    
    # if True, will go to a dashboard instead of loading up all the introductory content
    skip_introduction = db.BooleanProperty()
    
    # holds what the user has recently mastered in the format { 'hours since epoch' : [words,,,] }
    recent_mastered_json = db.TextProperty()
    
    # holds the entire user mastery record in the format { 'word' : 100 } where 100 is fully mastered, and 0 or missing key is unvisited.
    word_mastery_json = db.TextProperty()
    
    # holds the filters that the user has used in the past { 'filter' : { title: 'title', timestamp: 'timestamp since last accessed' }}
    filter_history_json = db.TextProperty()
    
    # holds how big the quiz sizes should be
    quiz_size = db.IntegerProperty(None, None, 10)
    
    new_user = db.BooleanProperty(None, None, True)

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
        
        word_mastery = None
        recent_mastered = None
        
        # update word mastery
        if self.word_mastery_json:
            word_mastery = json.loads(self.word_mastery_json)
        
        if not word_mastery:
            word_mastery = {}
            
        for w in words:
            word_mastery[w] = 100 # currently: if the user has practiced them in a quiz, they are considered mastered :P
                
        self.word_mastery_json = json.dumps(word_mastery)
        
        # update recently mastered
        if self.recent_mastered_json:
            recent_mastered = json.loads(self.recent_mastered_json)
            
        if not recent_mastered:
            recent_mastered = {}
        
        bucket = str(int(time.time()) / 3600)
        
        if bucket not in recent_mastered.keys():
            recent_mastered[bucket] = []
        
        recent_mastered[bucket].extend(words)
        
        self.recent_mastered_json = json.dumps(recent_mastered)
        
        self.put()
                
    def update_filter_history(self, filter):
        """ adds this filter (just use url?) to the history"""
        
        filter_history = None
        
        if self.filter_history_json:
            filter_history = json.loads(self.filter_history_json)
            
        if not filter_history:
            filter_history = {}
        
        filter_history.update(json.loads(filter))
        
        self.filter_history_json = json.dumps(filter_history)
        
        self.put()
                