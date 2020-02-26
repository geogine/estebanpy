ol.style.IconImageCache.shared.setSize(512);

export const view = new ol.View({
  center: [0, 0],
  zoom: 5,
});

export const map = new ol.Map({
  layers: [
  ],
  target: 'app-map',
  //renderer: 'webgl',
  controls: ol.control.defaults({
    attribution: false,
    // attributionOptions: {
    //   collapsible: false,
    // }
  }),
  interactions: ol.interaction.defaults({
    doubleClickZoom :false,
    // dragAndDrop: false,
    // keyboardPan: false,
    // keyboardZoom: false,
    // mouseWheelZoom: false,
    // pointer: false,
    // select: false
  }),
  view: view
});

const map_events = {
  keyup: [],
  keydown: [],
  keypress: [],
  hover: [],
  click: [],
  rightclick: [],
  contextmenu: [],
};

// Jump to feature
let jumper = {
  jump_i: 0,

}

map.on('click', (event) => {
  /**
   * Event for mouse click over feature
   */
  if (!keys.smartcast_enabled && keys.key_pressed && keys.smartcastable.has(keys.key_pressed)) {
    // smartcast is off, player clicked with keypress
    // player adds modifiers by clicking while holding key down

    map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
      if (layer.keypress) {
        layer.keypress(feature, keys.key_pressed);
      }
    });

  } else {
    // Regular click happened

    let has_feature = false;

    // default key modifier is CTRL / SHIFT / ALT
    let keyMod = event.originalEvent.ctrlKey ? 'CTRL' : (event.originalEvent.shiftKey ? 'SHIFT' : (event.originalEvent.altKey ? 'ALT' : null));

    map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
      if (layer.click) {
        layer.click(feature, keyMod, event);

        has_feature = true;
      }
    });

    if (!has_feature) {
      // global click happened

      for (let handler of map_events.click)
        handler(null);
    }
  }
});


// todo: @later: switch between right click and context menu
map.getViewport().addEventListener('contextmenu', function (event) {
  event.preventDefault();

  let has_feature = false;

  map.forEachFeatureAtPixel(map.getEventPixel(event), (feature, layer) => {
    if (layer.rightclick) {
      layer.rightclick(feature, keys.key_pressed);
      has_feature = true;
    }
  });

  if (!has_feature) {
    // global rghtclick happened
    for (let handler of map_events.rightclick)
      handler(null);
  }
});


// @todo: @later: enable/disable hover
const camera = {
  last_pointer_event: 0,
  // true if camera is panning or zooming
  busy: false,
};

map.on('pointermove', (event) => {
  /**
   * Event for mouse movement over features
   */

  // ignore event if camera/renderer are busy
  if (camera.busy)
    return;

  if (keys.smartcast_enabled) {
    keys.mouse_pixel = event.pixel;
  }

  // load-balance the mouse event, as OL calls are expensive
  let now = (new Date()).getTime();
  if (now - camera.last_pointer_event < 50) {
    return;
  }
  camera.last_pointer_event = now;

  // find the feature we moved over
  let found_feature = false;
  map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
    if (layer.hover) {
      found_feature = true;

      layer.hover(feature);
    }
  });

  // user hovered out of the map
  if (!found_feature) {
    for (let handler of map_events.hover)
      handler(null);
  }
});

map.on('movestart', (e)=>{
  camera.busy = true;
});

map.on("moveend", (e)=>{
  camera.busy = false;
});


// let start_time = new Date().getTime();
// let postcompose = function(event) {
//   var vectorContext = event.vectorContext;
//   var frameState = event.frameState;

//   unitLayer.update(frameState.time - start_time);

//   map.render();
// };
// map.on('postcompose', postcompose);

/**
 * Event handlers for keypress
 **/
export let keys = {
  // Config:
  smartcast_enabled: true,

  global_keypress: new Set([]),
  smartcastable: new Set([]),

  // Internal:  
  smartcast_happened: false,
  key_pressed: null,
  mouse_pixel: null,
};

document.onkeydown = function (e) {
  const key = e.key.toUpperCase();

  if (keys.smartcast_enabled && keys.smartcastable.has(key)) {
    e.preventDefault();
    // smartcast happens once, prevent the event otherwise
    if (keys.smartcast_happened)
      return;
    keys.smartcast_happened = true;

    // smartcast was called
    if (keys.mouse_pixel != null) {
      map.forEachFeatureAtPixel(keys.mouse_pixel, (feature, layer) => {
        if (layer.keypress) {
          layer.keydown(feature, key);
        }
      });
    }
  } else if (!keys.smartcast_enabled) {
    e.preventDefault();
    // register key pressed for non-smartcast mouse event
    keys.key_pressed = key;
  }

  if (keys.global_keypress.has(key)) {
    e.preventDefault();

    for (let handler of map_events.keydown)
      handler(null, key);
  }
};

document.onkeyup = function (e) {
  keys.key_pressed = null;

  const key = e.key.toUpperCase();

  if (keys.smartcast_enabled) {
    keys.smartcast_happened = false;
  }

  if (keys.global_keypress.has(key)) {
    e.preventDefault();

    for (let handler of map_events.keyup)
      handler(null, key);
  }
};

export function init_map(conf) {
  // TODO: conf.right_click OR context menu
  // TODO: conf.hover
  
  // init layer events
  map.getLayers().forEach((layer)=>{
    if (layer.keyup)
      map_events.keyup.push(layer.keyup);
    if (layer.keydown)
      map_events.keydown.push(layer.keydown);
    if (layer.keypress)
      map_events.keypress.push(layer.keypress);

    if (layer.hover)
      map_events.hover.push(layer.hover);
    if (layer.click)
      map_events.click.push(layer.click);
    if (layer.rightclick)
      map_events.rightclick.push(layer.rightclick);
    if (layer.contextmenu)
      map_events.contextmenu.push(layer.contextmenu);
  });

  // forward Key mapping:
  keys.global_keypress = conf.global_keypress;
}