import json
import unittest
from dictionary import Dictionary

"""Unit test for Dictionary methods"""

class DictionaryTest(unittest.TestCase):
    
    def setUp(self):
        None
        
    def test_filter(self):
        """ Simple filter """
        dictionary = Dictionary(json.loads('{ "TK": "did", "K": "can", "T": "it", "TKOPBT": "don\'t", "TK-P/EPBT": "dependent", "TKEUFT/TREFL": "distressful", "PWUL/-BS": "bulbs"}'))
        
        result = dictionary.filter("TK")
        
        self.assertTrue(len(result) is 3, 'Returned wrong number of elements. Expected: 3, Actual: %d' % len(result))
        self.assertTrue(result["K"], 'Doesn\'t contain K')     
        self.assertTrue(result["T"], 'Doesn\'t contain T') 
        self.assertTrue(result["TK"], 'Doesn\'t contain TK') 
        
    def test_filter_required(self):
        """ Simple filter with required entries """
        dictionary = Dictionary(json.loads('{ "TK": "did", "K": "can", "T": "it", "KO": "could", "S": "is"}'))
        
        result = dictionary.filter("TKO", "TK")
        
        self.assertTrue(len(result) is 4, 'Returned wrong number of elements. Expected: 4, Actual: %d' % len(result))
        self.assertTrue(result["K"], 'Doesn\'t contain K')     
        self.assertTrue(result["T"], 'Doesn\'t contain T') 
        self.assertTrue(result["TK"], 'Doesn\'t contain TK')
        self.assertTrue(result["KO"], 'Doesn\'t contain KO')
        
    def test_common(self):
        """ Simple Filter with check for common word """
        
        dictionary = Dictionary(json.loads('{"TKOPBT": "don\'t", "TKOEPBT": "doesn\'t" }'),\
                                json.loads('[ { "Rank":"17", "Word":"don\'t", "Percentage": "0.780360782"} ]'))
        
        result = dictionary.filter("TKOPBT")
        
        self.assertTrue(len(result) is 1, 'Returned wrong number of elements. Expected: 1, Actual: %d' % len(result))
        self.assertTrue(result["TKOPBT"], 'Doesn\'t contain TKOPBT')     