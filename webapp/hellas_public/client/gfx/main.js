import {setup_scene} from './scene.js';
import {setup_grid} from './grid.js';
import {setup_buildings} from './buildings.js';
import {setup_roads} from './roads.js';
import {setup_controls, set_state} from './controls.js';
import {setup_effects} from './effects.js';
import {setup_loader, start_loading} from './mesh_factory.js';
import {setup_hoplites} from './hoplites.js';

let canvas, engine, scene;

const world_size = 256;
const height = 10;
const grids = 99;

let loaded = 0;
const to_load = 2;


Events.on('gfx_loaded', (town)=>{
  console.log("Graphics loaded");
  start_rendering();

  // Set default game editing state
  set_state("Default");
});

function start_rendering() {
  engine.runRenderLoop(function() { 
    scene.render();
  });

  window.addEventListener("resize", function() { 
    engine.resize();
  });
}


export function init_graphics(world, town, user) {
  // Create scene
  canvas = document.getElementById("app-game");
  engine = new BABYLON.Engine(canvas, true);
  scene = new BABYLON.Scene(engine);

  window.Objects = {
    scene: scene
  };
  
  setup_loader({});

  // Objects.town = town;
  setup_buildings(town, {
    enabled: true,
    // building size = twice the size of town grids!
    build_size: round(world_size/grids)*2,
  });

  // Start loading meshes
  start_loading((tasks)=>{
    if (++loaded >= to_load) {
      Events.fire('gfx_loaded', [town]);
    }
  });
  

  // Setup user controls
  setup_controls(canvas, {
    disable_left_click: true,
    free_camera: false,

    debug: {
      enabled: true,
      ray_helper: true,
      no_timeout: false,

      dashboard: true,
    },
  });

  // Add environment
  setup_scene(scene, {
    debug: false,
    test_sphere: false,
    test_light: false,

    sun: true,
    sky: 'box',
    water: true,

    ground: {
      enabled: true,

      map: 'm3',
      add_diffuse_texture: false,

      size: world_size,
      height: height,
    },

    postprocess: {      
      type: 'default_extra',

      antialiasing: true,
      sharpening: false,
      depth_filter: true,
      photo: true,
    },
  }, ()=>{
    if (++loaded >= to_load) {
      Events.fire('gfx_loaded', [town]);
    }
  });

  // Game grid
  setup_grid({
    debug_ray: false,
    hover_highlight: true,

    size: world_size,
    height: height,
    grids: grids
  });

  // Game effects & particles
  setup_effects({
    enabled: true,
  });

  // Init roads
  setup_roads({
    enabled: true,

    size: world_size,
    grids: grids,
    height: height,
  });


  setup_hoplites(town, {

  });
}
