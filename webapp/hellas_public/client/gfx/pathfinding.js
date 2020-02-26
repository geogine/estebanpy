import {spaces} from './mesh_factory.js';


let town = null;
const paths = new Set([]);
const all_space_is_road = new Set(['agora', 'acropolis'])


export function setup_paths(town0) {
  town = town0;

  // todo: find pathfinding algorithm

  // only update paths every 30 second, so that hoplites have a bit of a lagg before walking
  let task = setInterval(update_paths, 30*60);

  update_paths();
}


export function find_path(start, goal, h) {
  if (Array.isArray(start)) start = start[0]+','+start[1];
  if (Array.isArray(goal)) goal = goal[0]+','+goal[1];

  if (typeof h === 'undefined')
    var h = (node, end)=>{
      let [x1,y1] = rcoord(node);
      let [x2,y2] = rcoord(goal);

      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

  // The set of discovered nodes that may need to be (re-)expanded.
  let openSet = new Set([start]);
  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start to n currently known.
  const cameFrom = {};

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  const gScore = defaultdict(()=>Infinity, true);
  gScore[start] = 0;

  // For node n, fScore[n] = gScore[n] + h(n).
  const fScore = defaultdict(()=>Infinity, true);
  fScore[start] = h(start, goal);
  let iters = 0;

  while (len(openSet) > 0) {
    //current = the node in openSet having the lowest fScore[] value
    const current = Array.from(openSet).reduce((tmin, val) => {
      if (tmin.key == null || fScore[val] < tmin.score) {
        tmin.score = fScore[val];
        tmin.key = val;
      }

      return tmin;
    }, {score: Infinity, key: null}).key;
    
    if (current == goal)
      return reconstruct_path(cameFrom, current);

    openSet.delete(current);

    for (let neighbor of neighbors(current)) {
      // d(current,neighbor) is the weight of the edge from current to neighbor
      // tentative_gScore is the distance from start to the neighbor through current
      let tentative_gScore = gScore[current] + 1;//d(current, neighbor)
      
      if (tentative_gScore < gScore[neighbor]) {
        // This path to neighbor is better than any previous one. Record it!
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentative_gScore;
        fScore[neighbor] = gScore[neighbor] + h(neighbor, goal);
        
        openSet.add(neighbor);
      }
    }

    // too much iterations
    if (++iters > 1000) {
      console.error("Iteration count exceeded");
      return false;
    }
  }

  // Open set is empty but goal was never reached
  return false;
}

function reconstruct_path(cameFrom, current) {
  const total_path = [rcoord(current)];

  while (current in cameFrom) {
    current = cameFrom[current];

    total_path.unshift(rcoord(current));
  }

  return total_path;
}

const _neigh = [[0,1],[0,-1],[1,0],[-1,0]];

function* neighbors(ocoord) {
  let [ox,oy] = rcoord(ocoord);

  for (let [dx,dy] of _neigh) {
    let coord = (ox+dx)+','+(oy+dy);

    if (paths.has(coord))
      yield coord;
  }
}

function rcoord(scoord) {
  let [ox,oy] = scoord.split(',');
  ox = parseInt(ox);
  oy = parseInt(oy);

  return [ox,oy];
}

function update_paths() {
  if (!town.placements.road)
    return;

  paths.clear();

  // add town paths + building spaces as walking space

  // todo: determine coordinates OUTSIDE of town.placements.wall (radius)

  for (let [bid, [ox,oy]] of Object.items(town.placements)) {

    // Check building type
    if (bid == 'road') {
      // obviously all roads are part of the town

      for (let [x,y] of town.placements.road) {
        paths.add(x+','+y);
      }

    } else if(all_space_is_road.has(bid) || true) {
      // @todo: remove temporal code for normal buildings once they have an entrance path
      let [dx,dy,dx2,dy2] = spaces[bid]||Objects.buildings[bid].space;

      // for these buildings, their whole build space acts as a road
      for (let x of range(ox-dx, ox+dx2+1)) {
        for (let y of range(oy-dy, oy+dy2+1)) {
          paths.add(x+','+y);
        }
      }
    } else {
      // the rest of the buildings are unwalkable.
      // @ todo: fix this by adding an entrance coordinate?
    }
  }

}