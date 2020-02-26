import {grid_event, get_center, hide_tile, opts as gridopts} from './grid.js';
import {lookat, set_state, add_state_handler} from "./controls.js";
import {load} from './mesh_factory.js';
import {show_lvlup} from './effects.js';
import {set_rect, draw_roads} from "./roads.js";

import {build_skins} from "/client/game/building.js";
import {build as request_build, replace as request_replace} from "/client/game/client.js";

// bid -> build mesh container:
const meshes = {};


// a new building that is selected to be built on click
let to_build = null;
let town = null;

export function setup_buildings(town0, {build_size, enabled}) {
  if (!enabled)
    return;

  add_buildstates();

  town = town0;
  Objects.buildings = meshes;

  // Add buildings
  for (let [bid, coord] of Object.items(town.placements)) {
    // road and wall have special gfx, and are not represented by a 3D model
    if (bid == 'road' || bid =='wall')
      continue;

    let lvl = town.buildings[bid] || 0;
    if (lvl == 0) {
      console.error("Lvl 0 for building: " + bid);
      continue;
    }

    create_building(bid, (build)=>{
      build.data.lvl = lvl;
      build.data.coord = coord;
    });
  }

  Events.on('build_upgrade', (bid, lvl)=>{
    // Build is upgraded: lvlup effect
    show_lvlup(meshes[bid]);

    // Camera looks at
    lookat(meshes[bid]);
  });

  Events.on('gfx_loaded', (town)=>{
    // Display all buildings and roads at their correct positions

    for (let [bid, build] of Object.items(meshes)) {
      replace(build, build.data.coord, false);
    }

    draw_roads(town);
  });
}

Events.on('set_build', (bid)=>{
  to_build = bid;
});

export function create_building(bid, cb) {
  if (!meshes[bid]) {

    load(bid, (build)=>{
      meshes[bid] = build;

      // Set up input controls
      build.actionManager = new BABYLON.ActionManager(Objects.scene);
      if (cb)
        cb(build);
      build.freezeWorldMatrix();
    });
  } else {
    console.error("Mesh is already loaded", bid);
  }
}

export function replace(build, [x,y], commit) {
  if (commit == null)
    var commit = true;

  if (!build) {
    console.error("Build object doesn't exist", x,y);
    return;
  }

  let [dx,dy,dx2,dy2] = build.data.dirt_space;
  // dx = (dx-1)/2, dy = (dy-1)/2;
  // dx2 = (dx2-1)/2, dy2 = (dy2-1)/2;


  if (build.data.coord) {
    // building has an older position
    const [ox,oy] = build.data.coord;

    // Clear old dirt to grass
    set_rect([ox-dx, oy-dy, ox+dx2, oy+dy2], 0, false);
  }

  // Set grid position - height is the distance between ground and (0,0,0) of mesh
  let new_pos = get_center([x,y]);
  const dp = build.data.adjust;

  build.unfreezeWorldMatrix();
  build.position.x = new_pos[0] + dp[0];
  build.position.y = new_pos[1] + dp[1];
  build.position.z = new_pos[2] + dp[2];
  build.freezeWorldMatrix();

  // Set road at new position
  set_rect([x-dx, y-dy, x+dx2, y+dy2], 1, commit);

  build.data.coord = [x,y];
}


function add_buildstates() {

  const selectAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, function(ev) {
    let bid = ev.meshUnderPointer.data.bid;

    // boosters share a unified infobar window
    if (build_skins[bid].type == 'booster')
      gui.infobar('booster', town, bid);
    else if (build_skins[bid].type == 'storage')
      gui.infobar('storage', town, bid);
    else
      gui.infobar(bid, town);
  });

  // Long drag starts moving state
  const dragLongAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLongPressTrigger, function(ev) {
    //if (dragging)
    //  return;
    // long press forces a state switch
    set_state('Moving');

    onDragStart(ev);
  });

  // Hover in
  const hoverInAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){
    const mat = ev.meshUnderPointer.select_mat;

    if (mat) {
      // we have a separate material for selection -- the rest of the mats are frozen!
      mat.alpha = 0.05;
      mat.emissiveColor = BABYLON.Color3.White();
    } else {
      // debug object, apply emissive select
      ev.meshUnderPointer.material.emissiveColor = new BABYLON.Color3(0.02, 0.02, 0.02);
    }
  });

  // Hover out
  const hoverOutAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev) {
    const mat = ev.meshUnderPointer.select_mat;

    if (mat) {
      mat.alpha = 0.0;
    } else {
      // debug object
      ev.meshUnderPointer.material.emissiveColor = BABYLON.Color3.Black();
    }
  });


  let last_pointer_event = 0;

  // Hover in
  const hoverInEditAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){
    const mat = ev.meshUnderPointer.select_mat;

    if (mat) {
      // we have a separate material for selection -- the rest of the mats are frozen!
      mat.emissiveColor = BABYLON.Color3.Blue();
      mat.alpha = 0.05;
    } else {
      // debug object, apply emissive select
      ev.meshUnderPointer.material.emissiveColor = BABYLON.Color3.Blue();
    }
  });
  
  let dragging = null, dcoord = null;

  function onDragStart(ev) {
    // Then start drag (remember: we're not in Moving state!)
    dragging = ev.meshUnderPointer;
    dragging.unfreezeWorldMatrix();
  }

  function onDragging(pick, [px,py,pz]) {
    // update building while we're dragging
    if (!dragging)
      return;
    
    if (pick.pickedCoordinate) {
      dcoord = pick.pickedCoordinate;
      // update dragging position of Building:
      const dp = dragging.data.adjust;

      dragging.position.x = px + dp[0];
      dragging.position.y = py + dp[1];
      dragging.position.z = pz + dp[2];
    }
  }

  function onDragEnd(evt) {
    if (!dragging)
      return;

    if (dcoord) {
      // replace mesh
      replace(dragging, dcoord);

      // http request
      request_replace(town, dragging.data.bid, dcoord, ()=>{
        // 
      });
    }

    dragging.freezeWorldMatrix();

    dragging = null;
    dcoord = null;
  }

  const dragStartAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, onDragStart);
  const dragEndAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickOutTrigger, onDragEnd);
  const dragEndAction2 = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, onDragEnd);


  function onNewBuild(pick, pos) {
    if (to_build == null) {
      console.error("In build mode but to_build is null!");
      return;
    }

    const bid = to_build;
    const coord = pick.pickedCoordinate;

    // back to normal game state
    set_state("Default");
    to_build = null;

    // HTTP call
    request_build(town, bid, coord, ()=>{
      // add 3D building
      create_building(bid, (build)=>{
        build.data.lvl = 1;
        build.data.coord = coord;

        // put it to its place
        replace(build, coord);

        // Camera looks at
        lookat(build);
      });
    });

    gui.infobar('close');
  }


  // Default state actions
  add_state_handler({
    name: 'Default',
    module: 'buildings.js',

    register: function(scene) {
      for (let build of Object.values(meshes)) {
        build.actionManager.registerAction(hoverInAction);
        build.actionManager.registerAction(hoverOutAction);

        build.actionManager.registerAction(selectAction);

        build.actionManager.registerAction(dragLongAction);
      }

      gridopts.hover_highlight = false;
      gridopts.show_coords = true;
    },
    unregister: function(scene) {
      for (let build of Object.values(meshes))
        for (let action of build.actionManager.actions)
          build.actionManager.unregisterAction(action);
    },
  });

  // Building state actions
  add_state_handler({
    name: 'Building',
    module: 'buildings.js',

    register: function(scene) {
      scene.defaultCursor = "cell";
      grid_event('pointerpick', onNewBuild);

      gridopts.hover_highlight = true;
      gridopts.show_coords = true;
    },
    unregister: function(scene) {
      scene.defaultCursor = 'default';
      grid_event('pointerpick', null);

      hide_tile();
    },
  });

  // Moving state actions
  add_state_handler({
    name: 'Moving',
    module: 'buildings.js',

    register: function(scene) {
      for (let build of Object.values(meshes)) {
        build.actionManager.registerAction(hoverInEditAction);
        build.actionManager.registerAction(hoverOutAction);

        build.actionManager.registerAction(dragStartAction);
        build.actionManager.registerAction(dragEndAction);
        build.actionManager.registerAction(dragEndAction2);
      }

      grid_event('pointermove', onDragging);
      scene.hoverCursor = 'move';
      scene.defaultCursor = 'move';

      gridopts.hover_highlight = false;
      gridopts.show_coords = false;
    },
    unregister: function(scene) {
      for (let build of Object.values(meshes))
        for (let action of build.actionManager.actions)
          build.actionManager.unregisterAction(action);

      scene.hoverCursor = 'pointer';
      scene.defaultCursor = 'default';

      grid_event('pointermove', null);
    },
  });
}