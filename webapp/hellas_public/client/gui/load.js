import '/engine/gui/infobar-header.js';

import '/client/gui/component/upgrade-button.js';

import '/client/gui/infobar/build/booster.js';
import '/client/gui/infobar/build/agora.js';
import '/client/gui/infobar/build/acropolis.js';
import '/client/gui/infobar/build/temple.js';
import '/client/gui/infobar/build/gymnasium.js';
import '/client/gui/infobar/build/theatre.js';
import '/client/gui/infobar/build/storage.js';
import '/client/gui/infobar/build/gatherer.js';
import '/client/gui/infobar/build/harbor.js';
import '/client/gui/infobar/hoplite.js';

import '/client/gui/frame/town-info.js';

import '/engine/mixins.js';
import {gui as ff} from '/engine/gui.js';

export const gui = ff;

export function init_gui(world, town, user) {
  gui.$refs['town-info'].open(town);

  world.me = user.iso;
  Vue.prototype.world = world;
}
