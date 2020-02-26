import {conn} from '/engine/modules/geomap/conn.js';


export function find_path(source, target) {
  if (conn[source].includes(target))
    return [source, target];

  // Dijkstra algorithm
  let dist = defaultdict(()=>{return Infinity}, true);
  let previous = {};

  let iters_DAG_prevent = 0;
  
  dist[source] = 0;
  let Q = new Set(Object.keys(conn));

  while(len(Q) > 0) {
    // u = node in Q with smallest dist[]
    let u = Object.keys(dist).reduce((min_key, key) => {
      return (Q.has(key) && (min_key == null || dist[key] < dist[min_key])) ? key : min_key;
    }, null);

    // this happens when we have a non-connected graph
    if (u == null)
      break;
    Q.delete(u);

    for (let v of conn[u]) {
      // where v has not yet been removed from Q.
      if (!Q.has(v))
        continue;
  
      let alt = dist[u] + 1;

      if (alt < dist[v]) {
        // Relax (u,v)
        dist[v] = alt;
        previous[v] = u;
      }
    }
  }


  let curr = target;
  let path = [];

  while (curr != source) {
    path.splice(0,0,curr);
    curr = previous[curr];
  }

  return path;
}


export function _dfs(start_area_id, depth, discovered, stop_at) {
  //Recursive depth-first search with iterative limit

  if (!discovered)
    discovered = new Set();  
  discovered.add(start_area_id);

  if (depth == null)
    depth = Infinity;

  if (depth <= 0)
    return discovered;

  if (stop_at == null && discovered.has(stop_at))
    return discovered;
  
  for (let narea_id of conn[start_area_id]) {
    if (!discovered.has(narea_id)) {
      _dfs(narea_id, depth-1, discovered, stop_at);
    }
  }

  return discovered;
}