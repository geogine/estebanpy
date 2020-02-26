// Game files
// import {client} from '/client/websocket.js';
import {gui, init_gui} from '/client/gui/load.js';
//import {init_chat} from '/client/game/notifications.js';

import {init_graphics} from '/client/gfx/main.js';

import {start_updating} from '/client/game/client.js';


export default function init_app(conf, user, token, world, town) {
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
