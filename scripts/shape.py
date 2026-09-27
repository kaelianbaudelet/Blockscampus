import json,sys
def shape(v,maxs=50):
    if isinstance(v,dict):
        if set(v.keys())=={'_T','V'}: return {'_T%s'%v['_T']: shape(v['V'],maxs)}
        return {k:shape(x,maxs) for k,x in v.items()}
    if isinstance(v,list):
        if not v: return []
        # merge keys of all dict elements
        if all(isinstance(x,dict) for x in v):
            m={}
            for x in v:
                for k,y in x.items():
                    if k not in m: m[k]=y
            return [shape(m,maxs),'…%d'%len(v)]
        return [shape(v[0],maxs),'…%d'%len(v)]
    s=json.dumps(v,ensure_ascii=False); return s if len(s)<=maxs else s[:maxs]+'…'
for f in sys.argv[1:]:
    d=json.load(open(f)); d=d.get('dataSec',{}).get('data',d)
    print('#####',f); print(json.dumps(shape(d),ensure_ascii=False,indent=1))
