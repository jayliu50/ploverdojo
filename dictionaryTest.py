import json
import unittest
from dictionary import Dictionary

"""Unit test for Dictionary methods"""

class DictionaryTest(unittest.TestCase):
    
    def setUp(self):
        None
        
    def test_filter_left_hand(self):
        """ Simple filter for the left hand"""
        dictionary = Dictionary(json.loads('{ "TK": "did", "K": "can", "T": "it", "TKOPBT": "don\'t", "-T": "the", "TK-P/EPBT": "dependent", "TKEUFT/TREFL": "distressful", "PWUL/-BS": "bulbs"}'))
        
        result = dictionary.filter("TK")

        self.assertTrue("K" in result, 'Doesn\'t contain K')     
        self.assertTrue("T" in result, 'Doesn\'t contain T') 
        self.assertTrue("TK" in result, 'Doesn\'t contain TK')
        self.assertFalse("TKOPBT" in result, 'should not have contained TKOPBT')
        self.assertFalse("-T" in result, 'should not have contained -T')
        
        self.check_count(result, 3)
        
    def test_filter_right_hand(self):
        """ Simple filter for right hand """
        dictionary = Dictionary(json.loads('{ "TK": "did", "K": "can", "T": "it", "TKOPBT": "don\'t", "-T": "the", "TK-P/EPBT": "dependent", "TKEUFT/TREFL": "distressful", "PWUL/-BS": "bulbs"}'))
        
        result = dictionary.filter("-T")
        
        self.assertTrue("TKOPBT" in result, 'should have contained TKOPBT')
        self.assertTrue("-T" in result, 'should have contained -T')
        
        self.check_count(result, 1)
        
        
    def test_filter_required_and(self):
        """ Simple filter with required entries in AND configuration """
        dictionary = Dictionary(json.loads('{ "STKOE": "stow", "TK": "did", "TKO": "do", "K": "can", "T": "it", "KO": "could", "S": "is", "O": "to"}'))
        
        result = dictionary.filter("TKO", "TK")
        
        self.assertFalse("K" in result, 'should not have contained K')     
        self.assertFalse("T" in result, 'should not have contained T') 
        self.assertTrue("TK" in result, 'Doesn\'t contain TK')
        self.assertTrue("TKO" in result, 'should have contained TKO')
        self.assertFalse("KO" in result, 'should not have contained KO')
        self.assertFalse("O" in result, 'should not have contained O')
        self.assertFalse("STKOE" in result, 'should not have contained STKOE')
        
        self.check_count(result, 2)
        
        
    def test_filter_required_or(self):
        """ Simple filter with required entries, in OR configuration """
        dictionary = Dictionary(json.loads('{ "TK": "did", "K": "can", "T": "it", "KO": "could", "S": "is", "O": "to"}'))
        
        result = dictionary.filter("TKO", "T,K")
        
        self.assertTrue("K" in result, 'Doesn\'t contain K')     
        self.assertTrue("T" in result, 'Doesn\'t contain T') 
        self.assertTrue("TK" in result, 'Doesn\'t contain TK')
        self.assertTrue("KO" in result, 'Doesn\'t contain KO')
        self.assertFalse("O" in result, 'should not have contained O')
        
        self.check_count(result, 4)
        
    def test_common(self):
        """ Simple Filter with check for common word """
        
        dictionary = Dictionary(json.loads('{"TKOPBT": "don\'t", "TKOEPBT": "doesn\'t" }'), \
                                json.loads('[ { "Rank":"17", "Word":"don\'t", "Percentage": "0.780360782"} ]'))
        
        result = dictionary.filter("TKOPBT")
        
        self.assertTrue("TKOPBT" in result, 'Doesn\'t contain TKOPBT')     
        
        self.check_count(result, 1)
        
    def test_expand_brief_right_explicit(self):
        """Basic case for expanding a brief from the right hand, explicit"""
        
        dictionary = Dictionary()
        result = dictionary.expand_brief("-FR")
        expected = "-F-R"
        self.assertEquals(result, expected, "Expected to find %s, but found %s instead" % (expected, result))
    
    def test_expand_brief_right_implicit(self):
        """Basic case for expanding a brief from the right hand, implicit"""
        
        dictionary = Dictionary()
        result = dictionary.expand_brief("EU")
        expected = "-E-U"
        self.assertEquals(result, expected, "Expected to find %s, but found %s instead" % (expected, result))
        
    def test_expand_brief_left(self):
        """Basic case for expanding a brief from the left hand"""
        
        dictionary = Dictionary()
        result = dictionary.expand_brief("TK")
        expected = "T-K-"
        self.assertEquals(result, expected, "Expected to find %s, but found %s instead" % (expected, result))

    def test_expand_brief_mix(self):
        """Basic case for expanding a brief from the both hands"""
        
        dictionary = Dictionary()
        result = dictionary.expand_brief("WAUL")
        expected = "W-A--U-L"
        self.assertEquals(result, expected, "Expected to find %s, but found %s instead" % (expected, result))
    
        
    def test_expand_brief_all(self):
        """Basic case for expanding a brief from everything"""
        
        dictionary = Dictionary()
        result = dictionary.expand_brief("#STKPWHRAO*EUFRPBLGTSDZ")
        expected = "#S-T-K-P-W-H-R-A-O-*-E-U-F-R-P-B-L-G-T-S-D-Z"
        self.assertEquals(result, expected, "Expected to find %s, but found %s instead" % (expected, result))
        
            
    def test_expand_brief_hash(self):
        """Basic case for expanding hash sign"""
        
        dictionary = Dictionary()
        result = dictionary.expand_brief("#")
        
        self.assertEquals(result, "#", "Expected to find #, but found %s instead" % result)
                   
    def test_expand_brief_star(self):
        """Basic case for expanding star"""
        
        dictionary = Dictionary()
        result = dictionary.expand_brief("*")
        
        self.assertEquals(result, "*", "Expected to find #, but found %s instead" % result)
        
    def check_count(self, result, expected):
        self.assertTrue(len(result) is expected, 'Returned wrong number of elements. Expected: %d, Actual: %d' % (expected, len(result)))
        
