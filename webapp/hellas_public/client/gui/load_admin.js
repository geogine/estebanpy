import '/client/gui/frame/town-edit.js';
//import '/client/gui/frame/world-edit.js';

import '/engine/mixins.js';
import {gui as ff} from '/engine/gui.js';


export const gui = ff;


export function init_gui(view, entity, user) {
  if (view == 'town')
    gui.$refs['town-edit'].open(entity);
  if (view == 'world')
    gui.$refs['world-edit'].open(entity);
}
