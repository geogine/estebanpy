import {gui, init_gui} from '/client/gui/load.js';

import {init_graphics} from '/client/gfx/main.js';
import {init_rendering} from '/client/gfx2d/main.js';
import {start_updating} from '/client/game/client.js';


export function init_town(conf, user, token, world, town) {
  //console.log("Init", conf, user, token, world);

  init_graphics(world, town, user);

  window.gui = gui;
  window.town = town;

  // Open GUI once build conf is loaded
  Events.past('load_game_conf', ()=>{
    init_gui(world, town, user);
  });

  start_updating(town);

  // if (ctx.conf.chat.enabled) {
  //   // init WS global chat
  //   init_chat(gui.$refs['global-chat'], ctx.conf.chat);
  // } else {
  //   // hide chat
  //   if (gui.$refs['global-chat'])
  //     gui.$refs['global-chat'].show = false;
  // }
}


export function init_gathering(conf, user, token, world, town) {
  init_rendering(world, town, user);

  window.gui = gui;

  Events.past('load_game_conf', ()=>{
    init_gui(world, town, user);
  });

  start_updating(town);
}

export default {
  init_gathering: init_gathering,
  init_town: init_town,
};