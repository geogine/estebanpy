import bpy
from bpy import context

sumfaces = []
for o in context.selected_objects:
    if o.type != 'MESH':
        continue
    me = o.data
    verts = len(me.vertices)
    edges = len(me.edges)
    faces = len(me.polygons)
    sumfaces.append(faces)
    print("%s: verts:%d edges:%d polys %d"
            % (o.name, verts, edges, faces))

print("total polys %d" % sum(sumfaces)) 
