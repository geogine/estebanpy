// Geogine
import {map, view, init_map} from '/engine/map.js';
import {gui, init_gui} from '/client/gui/load_world.js';
import {load, onload, toload} from '/engine/loader.js';
import {isocolors} from '/engine/colors.js';

// Geogine modules
//import {setup_features} from '/engine/modules/geomap/setup.js';
import {set_world, set_user, world as worldObj} from '/engine/modules/worlds/world.js';
// import {init_building} from '/engine/modules/building/building.js';
// import {init_borders} from '/engine/modules/borders/borders.js';

// Layers
import {watercolorLayer} from '/engine/layers/watercolor.js';
import {arrowLayer} from '/engine/layers/arrows.js';
import {areaLayer, areaSource} from '/client/layers/areas.js';
import {townLayer, townSource} from '/client/layers/towns.js';
import {heroLayer, heroSource} from '/client/layers/heroes.js';

// Game files
import {client} from '/client/game/websocket.js';
import {init_chat} from '/client/game/notifications.js';


map.getLayers().extend([
  watercolorLayer,

  areaLayer,
  townLayer,
  heroLayer,
  arrowLayer,
]);

init_map({
  global_keypress: new Set([' ', 'ESCAPE', 'TAB']),

});

toload(['build_conf']);

export default function init_worldmap(conf, user, token, world, towns, heroes) {
  // Init map view
  view.setCenter([2548000, 4581000]);
  view.setZoom(8);
  view.setMinZoom(7);
  view.setMaxZoom(11);

  let my_town;

  for (let town of towns) {
    if (town.iso == user.iso)
      my_town = town;
  }

  // Client and websocket
  client.init_game_client(conf.client, user, ()=>{

    if (conf.chat.enabled) {
      // init WS global chat
      init_chat(gui.$refs['global-chat'], conf.chat);
    }
  });
  // hide chat
  if (gui.$refs['global-chat'])
    gui.$refs['global-chat'].show = false;


  // Global variables
  window.gui = gui;
  window.world = worldObj;
  window.view = view;
  window.sources = {
    towns: townSource,
    heroes: heroSource,
    areas: areaSource
  }

  // do not need to load world, but fake its load state
  load("world", function() {
    this.ctx.towns = towns;
    this.ctx.heroes = heroes;

    set_world(world);
    set_user(user);
    
    this.loaded();
  });

  onload(['build_conf'], ()=>{
    init_gui(world, my_town, user);
  });
}

// todo: for areas
// load("map", function() {
//   // todo: put it to map layer
//   this.loaded();
// });

onload(["world", "towns"], (ctx) => {

  // Set up polis feature
  for (let town of ctx.towns) {
    let feature = townSource.getFeatureById(town.iso);
    feature.setProperties(town);
  }  

  let my_town = townSource.getFeatureById(worldObj.me);
  
  // set view to my town
  if (my_town) {
    view.setCenter(my_town.getGeometry().getCoordinates());
    view.setZoom(10);
  }

});
onload(["world", "towns", "map"], (ctx) => {
  // Set up heroes
  for (let hero of ctx.heroes) {
    let feature = new ol.Feature(hero);

    if (hero.lat && hero.lon) {
      // put hero in area he belongs, but custom coordinate
      var coord = [hero.lon, hero.lat];
    } else if (hero.area_id) {
      // put hero in area he belongs
      const area_feature = areaSource.getFeatureById(hero.area_id);
      var coord = area_feature.get('cen');
    } else if (hero.iso) {
      // put hero in his town
      const town_feature = townSource.getFeatureById(hero.iso);
      var coord = town_feature.getGeometry().getCoordinates();
    } else {
      console.error("Hero hasn't neither area_id nor coordinates", hero);
      continue;
    }

    feature.setGeometry(new ol.geom.Point(coord));
    heroSource.addFeature(feature);
  }
});

isocolors["TN"] = new Color([17, 2, 233]);
isocolors["TH"] = new Color([197, 50, 50]);
isocolors["SP"] = new Color([207, 20, 43]);
isocolors["CO"] = new Color([149, 37, 87]);
isocolors["AT"] = new Color([22, 55, 137]);
isocolors["OL"] = new Color([254, 15, 88]);
isocolors["DE"] = new Color([53, 91, 87]);
isocolors["RH"] = new Color([190, 127, 4]);
isocolors["KN"] = new Color([195, 130, 48]);
isocolors["MG"] = new Color([154, 105, 33]);
isocolors["AR"] = new Color([3, 7, 147]);
isocolors["ER"] = new Color([96, 122, 193]);
isocolors["TG"] = new Color([35, 77, 15]);
isocolors["ST"] = new Color([11, 48, 212]);
isocolors["PT"] = new Color([120, 121, 0]);
isocolors["SM"] = new Color([128, 78, 56]);
isocolors["MA"] = new Color([170, 110, 40]);
isocolors["NA"] = new Color([81, 35, 104]);
isocolors["LA"] = new Color([215, 67, 32]);
isocolors["ME"] = new Color([63, 120, 35]);
