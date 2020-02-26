import {gui, init_gui} from '/client/gui/load.js';
//import {init_chat} from '/client/game/notifications.js';

import {init_gathering} from '/client/gfx2d/main.js';
import {start_updating} from '/client/game/client.js';


export default function init_app(conf, user, token, world, town) {
  //console.log("Init", conf, user, token, world);

  init_gathering(world, town, user);

  window.gui = gui;

  Events.past('load_game_conf', ()=>{
    init_gui(world, town, user);
  });

  start_updating(town);
}
