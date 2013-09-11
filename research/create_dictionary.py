import os
import json

def method():
    """just a little script to process incategory.json to a regular dictionary file"""
    assets_dir = os.path.join(os.path.dirname(__file__), "..\\resources")
    
    categorized = {}
    with open(os.path.join(assets_dir, 'incategory.json'), 'r') as catfile:
        categorized = json.load(catfile)
        
    dict = {}
    with open(os.path.join(assets_dir, 'dict_orig.json'), 'r') as dictfile:
        dict = json.load(dictfile)
        
    common = {}
    with open(os.path.join(assets_dir, 'common.json'), 'r') as commonfile:
        common = json.load(commonfile)
         
    catMod = {}
    for s in categorized:
        if s[0] not in catMod:
            catMod[s[0]] = {}
            
        catMod[s[0]][s[1]] = s[2]   
        
        
    dictMod = {}
    for d in dict:  # 'stroke' : 'word'
        if dict[d] not in dictMod:
            dictMod[dict[d]] = []
        dictMod[dict[d]].append(d) 
    
    catMod2 = {}
    for k in catMod:
        for k2 in catMod[k]:
            if u'canon' in catMod[k][k2]:
                catMod2[k2] = k
                break
            elif u'phonetic' in catMod[k][k2]:
                catMod2[k2] = k
                break
            elif u'brief' in catMod[k][k2]:
                catMod2[k2] = k
                break
    
    
    exportDict = {}
    missing = {}
    
    for i in common:
        k = i["Word"]
        if k not in catMod2:
            if k in dictMod:
                if len(dictMod[k]) is 1:
                    exportDict[dictMod[k][0]] = k
                else:
                    missing[k] = dictMod[k]
            
    
    exportDict.update(catMod2)
    

    with open(os.path.join(assets_dir, 'result-dict.json'), 'w') as outfile:
        outfile.write(json.dumps(exportDict))
    
    with open(os.path.join(assets_dir, 'result-missing-words.json'), 'w') as missingfile:
        missingfile.write(json.dumps(missing))
         
    print 'done'

method()
