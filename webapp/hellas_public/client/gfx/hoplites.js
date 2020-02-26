import {find_path, setup_paths} from './pathfinding.js';
import {get_center} from './grid.js';

const hoplites = {};
let town = null;
const activities = [
  //gymnasium
  //theatre
  //agora
  //harbor
  //mill
];


export function setup_hoplites(t, opts) {
  return;
  const scene = Objects.scene, engine = scene.getEngine();

  setup_paths(t, {});
  town = t;

  let capsule = MakeCapsule(3, 6, 16);

  hoplites['1'] = capsule;
  place(capsule, town.placements.acropolis)

  Events.on('gfx_loaded', ()=>{
    // @temporal: walk towards granary if possible
    move_to('1', 'granary');
  });

  // @temporal: walk towards goal
  setInterval(()=>{
    if (!capsule.data.path)
      return;

    if (len(capsule.data.path) == 0 || capsule.data.coord == town.placements[capsule.data.goal]) {
      // goal has been reached
      console.info("Goal reached", capsule.data.goal, capsule.data.coord);
      
      capsule.data.path = null;
      capsule.data.goal = null;
      return;
    }

    const next_coord = capsule.data.path.shift();
    place(capsule, next_coord);
  }, 400);

  let t_start = (new Date).getTime();

  scene.registerBeforeRender(()=>{
    const tspent = (new Date).getTime() - t_start;
    //const dt = engine.getDeltaTime();

    for (let [hid, hoplite] of Object.items(hoplites)) {
      if (hoplite.data.path) {


        capsule.rotation.z = Math.PI/2 + Math.PI/8 * Math.sin(tspent/20);
        capsule.rotation.y = Math.PI/2 + Math.PI/8 * Math.cos(tspent/10);
      }
    }
  });
}


function move_to(id, goal) {
  let hoplite = hoplites[id];
  let coord = town.placements[goal];

  hoplite.data.goal = goal;

  let path = find_path(hoplite.data.coord, coord);
  if (path) {
    // we're starting the journey

    setTimeout(()=>{
      hoplite.data.path = path;
    }, 1000);
  } else {
    console.error("path not found", hoplite.data.coord, coord);
  }
}

function place(hoplite, coord) {
  hoplite.data.coord = coord;
  let pos = get_center(hoplite.data.coord);

  hoplite.position.x = pos[0];
  hoplite.position.y = pos[1] + hoplite.data.adjust_y;
  hoplite.position.z = pos[2];
}


// Test capsule
function MakeCapsule(width, height, detail) {
  const scene = Objects.scene;

  // Make the capsule parent. Because it was made outside
  // it can have it's values changed from other functions.
  const capsule = new BABYLON.TransformNode("capsule");

  // workwidth and workheight are adjusted width and
  // height values that the function uses to make the capsule.
  var workwidth;
  var workheight;

  // This if statement sets the workwidth value
  if (width == 1) {
      workwidth = width;
  } else {
      workwidth = width-1;
  } 

  // This sets the workheight value acording to the workwidth value
  workheight = (height-workwidth);

  // Create the EndSpehre1.  uses the detail and width values
  var es1 = BABYLON.Mesh.CreateSphere("es1", detail, width, scene);

  // If the height value is less than 2, don't make the 
  // second sphere and the cylinder.  This saves on processing
  // power. (why make 2 spheres why you can make 1?)
  if (height >= 2 && height !== width && width < height) {

      // make the cylinder. It uses the custom workwidth/height values
      var mc = BABYLON.MeshBuilder.CreateCylinder("mc", {diameterTop: width, diameterBottom: width, tessellation: detail*2, height: workheight-1}, scene);

      // Rotate the cylinder to make it "connect" the 2 spheres
      mc.rotation.z = Math.PI/2;

      // Make the second end sphere
      var es2 = BABYLON.Mesh.CreateSphere("es2", detail, width, scene);

      // Position the spheres accordingly.
      // The position of es1 is in this if statement
      // so that when only it is showing it will
      // not be off-center.
      es1.position.x = (workheight-1)/2;
      es2.position.x = (-workheight+1)/2;
  }

  // Parent the capsule's parts to the transform node.
  es1.parent = capsule;
  mc.parent = capsule;
  es2.parent = capsule;

  capsule.data = {
    coord: null,
    adjust_y: height/2,
    path: null,
    goal: null,
  };

  capsule.rotation.z = Math.PI/2;

  return capsule;
}