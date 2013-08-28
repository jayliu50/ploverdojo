import json
import os
import itertools
from test import test_bool


class Dictionary():
    """Tools for interacting with Plover dictionary"""
    
    
    def __init__(self, json, common=None):
        self.data = json
        
        if common:
            self.common = set(v["Word"] for i, v in enumerate(common))
            
            
    def filter(self, match_string, require_string=None, include_multisyllabic=False):
        
        combos = self.combinations(match_string)

       
        '''data is in the form of 
        "ARPL": "arm"
        
        test stuff using
        # if self.test_bool_exp(match_string, k, None))
                                  
        ''' 
        if(require_string):
            required = self.combinations(require_string)
            if include_multisyllabic:
                if hasattr(self, 'common'):
                    result = dict((k, self.data[k]) for k in self.data \
                                  if k in combos and self.data[k] in self.common and not set(k).isdisjoint(require_string))
                else:
                    result = dict((k, self.data[k]) for k in self.data \
                                  if k in combos and not set(k).isdisjoint(require_string))
            else:
                if hasattr(self, 'common'):
                    result = dict((k, self.data[k]) for k in self.data \
                                  if u'/' not in k and k in combos and self.data[k] in self.common and not set(k).isdisjoint(require_string))
                                  
                else:
                    result = dict((k, self.data[k]) for k in self.data \
                                  if u'/' not in k and k in combos and not set(k).isdisjoint(require_string))
            
        else:
            if include_multisyllabic:
                if hasattr(self, 'common'):
                    result = dict((k, self.data[k]) for k in self.data \
                                  if k in combos and self.data[k] in self.common)
                else:
                    result = dict((k, self.data[k]) for k in self.data \
                                  if k in combos)
            else:
                if hasattr(self, 'common'):
                    result = dict((k, self.data[k]) for k in self.data \
                                  if u'/' not in k and k in combos and self.data[k] in self.common)
                                  
                else:
                    result = dict((k, self.data[k]) for k in self.data \
                                  if u'/' not in k and k in combos)                          

        return result
    
    def combinations(self, match_string):
        result = set()
        
        if(len(match_string) > 2):
            for i in range(2, len(match_string) + 1):
                for x in itertools.combinations(match_string, i): result.add(''.join(x))
            for x in match_string: result.add(x)
        else:
            result = set([match_string, match_string[0], match_string[1]])
        
        return result
    
    def test_bool_exp(self, match_string, k, v):
        return u'/' not in k and match_string in k
    

if __name__ == "__main__":
    """running some tests here"""
    assets_dir = os.path.join(os.path.dirname(__file__), 'assets')

    with open(os.path.join(assets_dir, 'dict.json'), 'r') as dictfile:
        with open(os.path.join(assets_dir, 'common.json'), 'r') as commonfile: 
            dictionary = Dictionary(json.load(dictfile), json.load(commonfile))
    
    result = dictionary.filter('SKWAO*EUFRPBLGTSDZ', 'KW', False)
    
    with open('result.json', 'w') as outfile:
        json.dump(result, outfile)
