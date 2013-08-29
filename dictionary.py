import json
import os
import itertools


class Dictionary():
    """Tools for interacting with Plover dictionary"""
    
    
    def __init__(self, json=None, common=None, conversion=None):
        self.data = json
        
        if common:
            self.common = set(v["Word"] for i, v in enumerate(common))
        
        if conversion:
            self.conversion = dict((v, int(k)) for (k, v) in conversion.items())
            
    def filter(self, match_string, require_string=None, include_multisyllabic=False):
        """Returns a subset of the dictionary given the match_string and other settings"""
        
        combos = self.combinations(match_string)

       
        '''data is in the form of 
        "ARPL": "arm"
        
        test stuff using
        # if self.test_bool_exp(match_string, k, None))
                                  
        ''' 
        if(require_string):
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
    
    def prepare_for_quiz(self, dictionary):
        result = []
        for x in dictionary.keys():
            # old way
            # result[self.convert_to_binary(x)] = "binary"        
            result.append(self.convert_to_binary(x))
        return result

            
    def convert_to_binary(self, keystroke_string):
        new_keystroke = self.expand_brief(keystroke_string)
        binary = 0
        x = 0
        while x < len(new_keystroke):
            token = new_keystroke[x]
            if self.conversion.has_key(token):
                binary = binary | self.conversion[token]
                x += 1
            else:
                token = new_keystroke[x] + new_keystroke[x+1]
                if self.conversion.has_key(token):
                    binary = binary | self.conversion[token]
                    x += 2
                
        return binary
        
    def expand_brief(self, brief):
        right_hand = False
        left_hand_visited = False
        output = ''
        for x in brief:
            if x == '-':
                right_hand = True
            elif x == '#':
                output = output + x
            elif  x == '*':
                output = output + x
                right_hand = True
            else:
                if x in 'EU':
                    left_hand_visited = True
                    right_hand = True
                if left_hand_visited and x in 'EUFBLGDZ':
                    right_hand = True
                    left_hand_visited = True
                if right_hand:
                    output = output + "-" + x
                else:
                    left_hand_visited = True
                    output = output + x + "-"
            
        return output

if __name__ == "__main__":
    """running some tests here"""
    assets_dir = os.path.join(os.path.dirname(__file__), 'resources')

    with open(os.path.join(assets_dir, 'dict.json'), 'r') as dictfile:
        with open(os.path.join(assets_dir, 'common.json'), 'r') as commonfile:
            with open(os.path.join(assets_dir, 'binaryToSteno.json'), 'r') as conversionfile:
                dictionary = Dictionary(json.load(dictfile), json.load(commonfile), json.load(conversionfile))
    
    result = dictionary.prepare_for_quiz(dictionary.filter('KWAO*EUFRPBLGTSDZ', 'KW'))
    
    with open('result.json', 'w') as outfile:
        something = json.dumps(result)
        print something
