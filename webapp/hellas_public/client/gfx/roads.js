import {grid_event, hide_tile, opts as gridopts} from './grid.js';
import {add_state_handler} from "./controls.js";
import {save_roads} from "/client/game/client.js";


let groundMat;
let uW, wsize;
let road_arr = null;

let new_roads = [];
let del_roads = [];

let is_enabled = true;
const C_BASE = 0, C_ROAD = 1, C_3 = 2;

// Roading state actions
export function setup_roads({enabled, size, grids, height, road_size, add_meshes}) {
  const scene = Objects.scene;
  if (typeof add_meshes === 'undefined') var add_meshes = true;

  if (!enabled) {
    is_enabled = false;
    return;
  }

  uW = grids;
  wsize = size;
  const subdiv = 250;

  // Generate ground texture:
  groundMat =  new BABYLON.TerrainMaterial("ground", scene);
  groundMat.specularColor = new BABYLON.Color3(0, 0, 0);

  //groundMat.freeze();

  // Dynamic generation by player
  road_arr = new Uint8Array(uW*uW*3);

  const uH = (uW-1)/2;

  for (let y = 0; y < uW; y++) for (let x = 0; x < uW; x++) {
    road_arr[(uW*y + x)*3+C_BASE] = 255;
    road_arr[(uW*y + x)*3+C_ROAD] = 0;
    road_arr[(uW*y + x)*3+C_3] = 0;      
  }

  /* textures & their colors on the mixmap:
    1   red     base (grass)
    2   green   road
    3   blue    3 (unused)
  */


  // "tex_grass.png";
  // "m3.jpg";
  groundMat.diffuseTexture1 = new BABYLON.Texture(`/img/textures/terrain/snow.jpg`, scene);
  groundMat.diffuseTexture2 = new BABYLON.Texture(`/img/textures/terrain/m3.jpg`, scene);
  groundMat.diffuseTexture3 = new BABYLON.Texture(`/img/textures/terrain/tex_mars.bmp`, scene);
  
  groundMat.diffuseTexture1.uScale = groundMat.diffuseTexture1.vScale = 30;
  groundMat.diffuseTexture2.uScale = groundMat.diffuseTexture2.vScale = 60;
  groundMat.diffuseTexture3.uScale = groundMat.diffuseTexture3.vScale = 60;

  groundMat.bumpTexture1 = new BABYLON.Texture("/img/textures/normals/snow_norm.jpg", scene);
  // groundMat.bumpTexture2 = new BABYLON.Texture("/img/textures/terrain/.png", scene);
  // groundMat.bumpTexture3 = new BABYLON.Texture("/img/textures/terrain/.png", scene);
  
  Objects.groundMat = groundMat;
 
}

export function draw_roads(town) {
  if (!town.placements.road) {
    town.buildings.road = 1;
    town.placements.road = [];
  }

  if (!is_enabled)
    return;
  
 for (let coord of town.placements.road) {
    set_tile(coord, C_ROAD, false);
  }

  redraw();
  
  const ground = Objects.ground;
  
  //ground.actionManager = new BABYLON.ActionManager(Objects.scene);
  ground.material = Objects.groundMat;

  if (Objects.water) {
    //Objects.water.material.addToRenderList(ground);
  }

  delete Objects.groundMat;
}

export function set_rect([x0,y0,x1,y1], tile, commit) {
  const uH = (uW-1)/2;
  if (typeof commit === 'undefined')
    var commit = true;

  for (let x of range(x0+uH, x1+uH+1)) {
    for (let y of range(y0+uH, y1+uH+1)) {

      road_arr[(uW*y + x)*3+C_BASE] = tile == C_BASE ? 255 : 0
      road_arr[(uW*y + x)*3+C_ROAD] = tile == C_ROAD ? 255 : 0;
      road_arr[(uW*y + x)*3+C_3] = tile == C_3 ? 255 : 0;
    }
  }

  if (commit)
    redraw();
}

export function set_tile([wx,wy], tile, commit) {
  let x = wx+(uW-1)/2, y = wy+(uW-1)/2;
  if (typeof commit === 'undefined')
    commit = true;

  road_arr[(uW*y + x)*3+C_BASE] = tile == C_BASE ? 255 : 0
  road_arr[(uW*y + x)*3+C_ROAD] = tile == C_ROAD ? 255 : 0;
  road_arr[(uW*y + x)*3+C_3] = tile == C_3 ? 255 : 0;

  if (commit)
    redraw();
}

function onToggleRoad(pick, posa, commit) {
  let uv = pick.getTextureCoordinates();
  let coord = pick.pickedCoordinate;

  if (typeof commit === 'undefined')
    var commit = true;

  // pixel coordinate in [0, uW]^2
  let pcoor = [Math.floor(uv.x*uW), Math.floor(uv.y*uW)];

  if (has_road(pcoor)) {
    clear_tile(pcoor, C_BASE);

    del_roads.push(coord);

    for (let [i,co] of enumerate(new_roads)) 
      if (co[0]==coord[0] && co[1]==coord[1])
        new_roads.splice(i, 1);
  } else {
    set_road(pcoor, C_ROAD);

    new_roads.push(coord);

    for (let [i,co] of enumerate(del_roads)) 
      if (co[0]==coord[0] && co[1]==coord[1])
        del_roads.splice(i, 1);
  }

  if (commit)
    redraw();
}

function _a([x,y],i) {
  return road_arr[(uW*y + x)*3+i];
}

function has_road(c) {
  /* textures & their colors on the mixmap:
    1   red     base (grass)
    2   green   road
    3   blue    3 (unused)
  */
  return _a(c,C_BASE)==0 && _a(c,C_ROAD)==255 && _a(c,C_3)==0;
}

function set_road([x,y]) {
  road_arr[(uW*y + x)*3+C_BASE] = 0;
  road_arr[(uW*y + x)*3+C_ROAD] = 255;
  road_arr[(uW*y + x)*3+C_3] = 0;
}

function clear_tile([x,y]) {
  road_arr[(uW*y + x)*3+C_BASE] = 255;
  road_arr[(uW*y + x)*3+C_ROAD] = 0;
  road_arr[(uW*y + x)*3+C_3] = 0;
}

export function redraw() {
  const oldTex = groundMat.mixTexture;
  
  //groundMat.unfreeze();

  let customMixTex = new BABYLON.RawTexture(
    road_arr,
    uW, uW,
    BABYLON.Engine.TEXTUREFORMAT_RGB,
    Objects.scene, false, false,
    BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
    BABYLON.Engine.TEXTURETYPE_UNSIGNED_INT
  );

  // Link materials together
  groundMat.mixTexture = customMixTex;
  //groundMat.freeze();

  // remove old texture from scene
  setTimeout(()=>{
    if (oldTex)
      oldTex.dispose();
  }, 200);
}


// Register road edit state & events
add_state_handler({
  name: 'Roading',
  module: 'roads.js',

  register: function(scene) {
    gridopts.hover_highlight = true;
    gridopts.show_coords = true;

    scene.defaultCursor = "cell";
    scene.hoverCursor = "default";

    grid_event('pointerpick', onToggleRoad);
  },
  unregister: function(scene) {
    hide_tile();

    scene.defaultCursor = 'default';
    scene.hoverCursor = "pointer";

    if (len(new_roads) || len(del_roads))
      save_roads(new_roads, del_roads);

    new_roads = [];
    del_roads = [];

    grid_event('pointerpick', null);
  },
});
