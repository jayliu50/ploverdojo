import json
import os
import itertools
import copy


class Dictionary():
    """Tools for interacting with Plover dictionary"""
    @staticmethod
    def create_default():
        """Creates a dictionary using the default file locations"""
        dictionary = None
        resources_directory = os.path.join(os.path.dirname(__file__), 'resources')
        dictfile = open(os.path.join(resources_directory, 'dict.json'), 'r')
        commonfile = open(os.path.join(resources_directory, 'common.json'), 'r') 
        conversionfile = open(os.path.join(resources_directory, 'binaryToSteno.json'), 'r')
        dictionary = Dictionary(json.load(dictfile), json.load(commonfile), json.load(conversionfile))
        dictfile.close()
        commonfile.close()
        conversionfile.close()
        
        return dictionary
    
    def __init__(self, dictionary=None, common=None, conversion=None, threshold=None):
        
        if dictionary:
            self.data = dict((self.encode_brief(self.expand_brief(k)), dictionary[k]) for k in dictionary)
        
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
        result = copy.deepcopy(self.data)
        match_string = self.encode_brief(self.expand_brief(match_string))
        
        
        # monosyllabic
        if not include_multisyllabic:
            result = dict((k, result[k]) for k in result if u'/' not in k)
        
        # common words only
        if hasattr(self, 'common'):
            result = dict((k, result[k]) for k in result if result[k] in self.common)

        if match_string is not '':
            combos = self.combinations(match_string, require_string)
            result = dict((k, result[k]) for k in result if k in combos)

        result = dict((self.decode_brief(k), result[k]) for k in result)

        return result
    
    def __filter(self, k, combos):
        for c in combos:
            if c in k:
                return True
        
        return False
    
    def combinations(self, match_string, require_string=None):
        result = set()
        
        if len(match_string) > 2:
            for i in range(2, len(match_string) + 1):
                for x in itertools.combinations(match_string, i): result.add(''.join(x))
            for x in match_string: result.add(x)
        elif len(match_string) is 2:
            result = set([match_string, match_string[0], match_string[1]])
        else:
            result = set(match_string)
        
        if(require_string):
            requires = set(self.encode_brief(self.expand_brief(s)) for s in require_string.split(','))
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
        """Account for handedness in the briefs"""
        
        if brief is None:
            return None
        
        right_hand = False
        vowel_visited = False
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
                    right_hand = True
                if right_hand:
                    output = output + "-" + x
                else:
                    if x in 'AO':
                        vowel_visited = True
                        output = output + x + "-"
                    elif vowel_visited:
                        right_hand = True
                        output = output + '-' + x
                    else:
                        output = output + x + "-"
            
        return output
    
    def encode_brief(self, brief):
        """Just another representation of steno keys. Condenses all hyphenated keys of the expanded form into lower case"""
        output = ''
        
        right_hand = False
        brief = str(brief)
        
        i = 0
        while i < len(brief):
            if str.isalpha(brief[i]):
                output = output + brief[i]
                i = i + 1
            elif brief[i] is '-' and i + 1 < len(brief) and str.isalpha(brief[i + 1]):
                output = output + str.lower(brief[i + 1])
                i = i + 1
            else:
                output = output + brief[i]
            
            i = i + 1
                
            
        return output
    
    def decode_brief(self, brief):
        output = ''
        hyphen_added = False
        seen_vowel = False
        for c in brief:
            if c in 'AO*':
                seen_vowel = True
            if str.islower(c) and not hyphen_added:
                if not seen_vowel:
                    output = output + "-"
                hyphen_added = True
            output = output + str.upper(c)
        
        return output

    def wordlist(self, match_string, required_string=None):
        filtered = self.filter(match_string, required_string)
        return list(set(filtered.values()))
    
    def lesson(self, description, match_string, required_string):
        return '*** %s ***\n [%s]\n' % (description, '\t'.join(dictionary.wordlist(match_string, required_string)))

    def debug_list_missing_words(self):
        """Returns a list of the words that are in common but not in the dictionary"""
        
        #assume that dict.json is much bigger than common.json
        search = set(self.data.values())
        data = list((k) for k in self.common if k not in search)
        
        return data

if __name__ == "__main__":
    """running some tests here"""
    assets_dir = os.path.join(os.path.dirname(__file__), 'resources')
    
    with open(os.path.join(assets_dir, 'dict.json'), 'r') as dictfile:
        with open(os.path.join(assets_dir, 'common.json'), 'r') as commonfile:
            with open(os.path.join(assets_dir, 'binaryToSteno.json'), 'r') as conversionfile:
                dictionary = Dictionary(json.load(dictfile), json.load(commonfile), json.load(conversionfile), 5000)
    

    ##print dictionary.lesson('Ending TS', 'STKPWHRAO*EUTS', '-TS') # ADDED
    #print dictionary.lesson('Ending -BGS = X', 'STKPWHRAO*EUBGS', '-BGS') 
    #print dictionary.lesson('Ending -GS = tion, sion, xion ', 'STKPWHRAO*EUFGS', '-GS') # ADDED
    #print dictionary.lesson('Ending D', 'STKPWHRAO*EUD', '-D') #
    #print dictionary.lesson('Ending Z', 'STKPWHRAO*EUZ', '-Z')
    #print dictionary.lesson('KP = X', 'KPAO*EUFRPBLGTS', 'KP')
    #print dictionary.lesson('STKPB = Z', 'STKPBAO*EUFRPBLGTS', 'STKPB')
    
    
    
    print 'Done.'
    # print json.dumps(returned)

#    for (k, v) in returned:
#        print "%s=%s" % (k, v)

