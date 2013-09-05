import json
import os
import itertools


class Dictionary():
    """Tools for interacting with Plover dictionary"""
    
    
    def __init__(self, json=None, common=None, conversion=None, threshold=None):
        self.data = json
        
        if common:
            self.common = list(v["Word"] for i, v in enumerate(common)) if threshold is None else \
                          list(v["Word"] for i, v in enumerate(common) if int(v["Rank"]) < threshold)
            # print ' '.join(self.common)
        
        if conversion:
            self.conversion = dict((v, int(k)) for(k, v) in conversion.items())
            
    def filter(self, match_string, require_string=None, include_multisyllabic=False):
        """Returns a subset of the dictionary given the match_string and other settings"""
            
        '''data is in the form of 
        "ARPL": "arm"
        
        test stuff using
        # if self.test_bool_exp(match_string, k, None))
                                  
        ''' 
        result = dict((k, self.data[k]) for k in self.data)
        
        # monosyllabic
        if not include_multisyllabic:
            result = dict((k, result[k]) for k in result if u'/' not in k)
        
        # common words only
        if hasattr(self, 'common'):
            result = dict((k, result[k]) for k in result if result[k] in self.common)

        combos = self.combinations(match_string, require_string)
       
        result = dict((k, result[k]) for k in result if k in combos)

        return result
    
    def __filter(self, k, combos):
        for c in combos:
            if c in k:
                return True
        
        return False
    
    def combinations(self, match_string, require_string=None):
        result = set()
        
        if(len(match_string) > 2):
            for i in range(2, len(match_string) + 1):
                for x in itertools.combinations(match_string, i): result.add(''.join(x))
            for x in match_string: result.add(x)
        else:
            result = set([match_string, match_string[0], match_string[1]])
        
        if(require_string):
            requires = set(require_string.split(','))
            result = set(k for k in result if self.__filter(k, requires))
        
        return result
    
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
                token = new_keystroke[x] + new_keystroke[x + 1]
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

    def wordlist(self, match_string, required_string=None):
        filtered = dictionary.filter(match_string, required_string)
        return list(set(filtered.values()))


if __name__ == "__main__":
    """running some tests here"""
    assets_dir = os.path.join(os.path.dirname(__file__), 'resources')
    
    with open(os.path.join(assets_dir, 'dict.json'), 'r') as dictfile:
        with open(os.path.join(assets_dir, 'common.json'), 'r') as commonfile:
            with open(os.path.join(assets_dir, 'binaryToSteno.json'), 'r') as conversionfile:
                dictionary = Dictionary(json.load(dictfile), json.load(commonfile), json.load(conversionfile), 5000)
    
    print 'Lesson 1'
    print '\t'.join(dictionary.wordlist('HAE*OUFR', 'H'))
    print '\t'.join(dictionary.wordlist('RAE*OUFR', 'R'))
    print '\t'.join(dictionary.wordlist('HRAE*OUFR', 'HR'))
    print
    
    print 'Lesson 2'
    print '\t'.join(dictionary.wordlist('PRAE*OUFR', 'P'))
    print '\t'.join(dictionary.wordlist('WHRAE*OUFR', 'W'))
    print '\t'.join(dictionary.wordlist('PWHRAE*OUFR', 'PW'))
    print
    
    print 'Lesson 3'
    print '\t'.join(dictionary.wordlist('PWHRAE*OUFRP', '-P'))
    
    # print json.dumps(returned)

#    for (k, v) in returned:
#        print "%s=%s" % (k, v)



    #===========================================================================
    # # just a little script to process incategory.json to a regular dictionary file
    # 
    # with open(os.path.join(assets_dir, 'incategory.json'), 'r') as catfile:
    #     something = json.load(catfile)
    #     
    #     goods = {}
    #     for s in something:
    #         if 'canon' in s[2] or 'phonetic' in s[2]:
    #             print 'canonical %s %s' % (s[0], s[1])
    #             goods[s[1]] = s[0]
    #         
    #     with open('result-dict.json', 'w') as outfile:
    #         outfile.write(json.dumps(goods))
    #         
    #     
    # print 'done'
    #===========================================================================
