import '/engine/gui/infobar-header.js';
import '/engine/modules/chat/gui.js';
//import '/engine/dialog/players.js';

//import '/client/gui/dialog/settings.js';
//import '/client/gui/dialog/disconnect.js';

import '/client/gui/frame/town-info.js';

import '/engine/mixins.js';
import {gui as ff} from '/engine/gui.js';


export const gui = ff;


export function init_gui(world, town, user) {
  gui.$refs['town-info'].open(town);
}
