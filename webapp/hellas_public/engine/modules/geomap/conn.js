export const conn = defaultdict(list, true);

import {_dfs} from "/engine/modules/geomap/pathfinder.js";

export function are_neighbors(id1, id2) {
  // returns if two areas are next to each other
  return conn[id1].includes(id2);
}


export function get_neighbors(id1) {
  return conn[id1];
}


export function is_path_connected(path) {
  let idnow = path.shift();

  for (let id1 of path){
    if (!conn[idnow].includes(id1))
      return false;

    idnow = id1;
  }

  return true;
}


export function is_connected(id1, id2, max_depth) {
  // are the two ids on the same connected graph, within max_depth steps?
  if (max_depth == null)
    var max_depth = Infinity;

  if (max_depth == 1)
    return are_neighbors(id1, id2);

  // todo: itt: DFS nem muxik
  const disc = _dfs(id1, max_depth, null, id2);

  return disc.has(id1) && disc.has(id2);
}
