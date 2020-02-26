import {gui, init_gui} from '/client/gui/load_admin.js';


export function edit_town(conf, user, token, town) {
  window.gui = gui;
  
  Events.past('load_game_conf', ()=>{
    init_gui('town', town, user);
  });
}
