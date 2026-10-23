import json,struct,numpy as np
def load(p):
    b=open(p,'rb').read()
    l=struct.unpack('<I',b[12:16])[0];j=json.loads(b[20:20+l]);bin_=b[20+l+8:]
    def acc(i,dt,n):
        a=j['accessors'][i];v=j['bufferViews'][a['bufferView']];o=v.get('byteOffset',0)+a.get('byteOffset',0)
        return np.frombuffer(bin_,dt,a['count']*n,o).reshape(-1,n) if n>1 else np.frombuffer(bin_,dt,a['count'],o)
    return acc(0,'<f4',3).copy(),acc(1,'<f4',3).copy(),acc(2,'<u4',1).reshape(-1,3).copy()
def render(V,C,out,axis='front',S=600):
    from PIL import Image
    if axis=='front': x,y,z=V[:,0],V[:,1],V[:,2]
    elif axis=='side': x,y,z=V[:,2],V[:,1],-V[:,0]
    else: x,y,z=-V[:,0],V[:,1],-V[:,2]
    px=((x+0.5)*S).astype(int);py=((1.02-y)*S).astype(int)
    o=np.argsort(z);img=np.full((S,S,3),30,np.uint8)
    for d in (0,1):
        img[np.clip(py[o]+d,0,S-1),np.clip(px[o],0,S-1)]=C[o];img[np.clip(py[o],0,S-1),np.clip(px[o]+d,0,S-1)]=C[o]
    Image.fromarray(img).save(out)
