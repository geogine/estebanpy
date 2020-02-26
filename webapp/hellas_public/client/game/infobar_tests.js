
const boosters = ["lumberyard","stonemason","foundry","mill"];
const storages = ["warehouse","granary"];
const hoplites = ["hoplite"];

// "harbor"
// "acropolis"
// "agora"
// "theatre"
// "temple"
// "house"
// "gymnasium"

export function setup_infobar_test(town, bid, lvl) {
  let infobar;

  if (!lvl)
    var lvl = town.buildings[bid];
  else
    town.buildings[bid] = lvl;

  // change bid
  if (hoplites.includes(bid)) {
    gui.infobar('hoplite', town);
  } else if (boosters.includes(bid)) {
    gui.infobar('booster', town, bid);
  } else if (storages.includes(bid)) {
    gui.infobar('storage', town, bid);
  } else {
    gui.infobar(bid, town);
  }

  Vue.prototype.world = {
    me: "TH"
  };
}
