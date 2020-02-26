const state_handlers = defaultdict(list, true);

let current_state = null;
let camera = null;

export function add_state_handler(sh) {
  state_handlers[sh.name].push(sh);
}

add_state_handler({
  name: 'nil',
  module: 'controls.js',

  register: function() {},
  unregister: function() {},

  pointerMove: null,
  pointerClick: null,
});

export function set_state(state_name) {
  let old_state = state_handlers[current_state];
  let new_state = state_handlers[state_name];

  // Reset old state:
  if (old_state)  {
    for (let state of old_state)
      state.unregister(Objects.scene);
  }

  if (!new_state) {
    console.error("State not found:", state_name);
    return;
  }

  current_state = state_name;

  for (let state of new_state)
    state.register(Objects.scene);

  console.log("Switched state:", state_name);
}


export function setup_controls(canvas, {free_camera, disable_left_click, debug}) {
  const scene = Objects.scene;

  // Add camera
  camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 140, new BABYLON.Vector3(0,0,0), scene);

  if (!free_camera) {
    camera.lowerBetaLimit = 0.2;
    camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    camera.lowerRadiusLimit = 80;
    camera.upperRadiusLimit = 160;
  }

  camera.panningAxis = new BABYLON.Vector3(1,0,1);
  camera.panningSensibility = 60;
  camera.panningDistanceLimit = 256*0.5;

  if (disable_left_click)
    camera.inputs.attached.pointers.buttons[0] = null;

  // camera.setPosition(43, 131, 153);
  // camera.setTarget(0,0,0);

  Objects.camera = camera;


  // Debugging
  if (debug.dashboard) {
    window.addEventListener("keypress", function(e) {
      if (e.key == ' ') {
        // log camera position
        e.preventDefault();
        e.stopPropagation();

        if (dashboard_show)
          scene.debugLayer.hide();
        else
          scene.debugLayer.show();
        dashboard_show = !dashboard_show;
        //console.info('%c POS -> ' + camera.position + " TARG -> " + camera.target, log_style);
      }
    });
  }

  camera.attachControl(canvas, true);
  //camera.attachControl(canvas, true, false, 2);

  return camera;
}

export function lookat(obj) {
  camera.target = obj.position;
}


let dashboard_show = false;

function test_ctrl(mesh, point, distance) {
  console.log(`%cP(${round(point.x,1)}, ${round(point.y,1)}, ${round(point.z,1)})`,log_style, mesh);
}
