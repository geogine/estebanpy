export let build_conf = {};

export let build_tree = {};

export let build_skins = {
  lumberyard: { disabled: true, cat: 'eco', type: 'booster', cat_color: 'green', cat_bg: 'bg-success'},
  stonemason: { disabled: false, cat: 'eco', type: 'booster', cat_color: 'green', cat_bg: 'bg-success'},
  foundry: {    disabled: true, cat: 'eco', type: 'booster', cat_color: 'green', cat_bg: 'bg-success'},
  mill: {       disabled: true, cat: 'eco', type: 'booster', cat_color: 'green', cat_bg: 'bg-success'},
  warehouse: {  disabled: false, cat: 'eco', type: 'storage', cat_color: 'green', cat_bg: 'bg-success'},
  granary: {    disabled: false, cat: 'eco', type: 'storage', cat_color: 'green', cat_bg: 'bg-success'},
  harbor: {     disabled: true, cat: 'eco', type: 'trading', cat_color: 'green', cat_bg: 'bg-success'},
  acropolis: {  disabled: false, cat: 'infra', type: null , cat_color: 'blue', cat_bg: 'bg-primary'},
  agora: {      disabled: false, cat: 'infra', type: null , cat_color: 'blue', cat_bg: 'bg-primary'},
  theatre: {    disabled: false, cat: 'infra', type: null , cat_color: 'blue', cat_bg: 'bg-primary'},
  temple: {     disabled: true, cat: 'infra', type: null , cat_color: 'blue', cat_bg: 'bg-primary'},
  house: {      disabled: true, cat: 'infra', type: null , cat_color: 'blue', cat_bg: 'bg-primary'},
  road: {       disabled: false, cat: 'infra', type: null, cat_color: 'blue', cat_bg: 'bg-primary'},
  gymnasium: {  disabled: false, cat: 'mil', type: 'training', cat_color: 'red', cat_bg: 'bg-danger'},
  wall: {       disabled: true, cat: 'mil', type: 'defensive', cat_color: 'red', cat_bg: 'bg-danger'},
};

export const boosters = {
  "lumberyard": "wood",
  "stonemason": "limestone",
  "foundry": "bronze",
  "mill": "food",
}

export const resource_skins = {
  'wood': {name: 'Forest', bg: 'bg-success'},
  'limestone': {name: 'Limestone mine', bg: 'bg-secondary'},
  'marble': {name: 'Marble mine', bg: 'bg-white progress-bar-striped'},
  'food': {name: 'Wheat fields', bg: 'bg-danger'},
  'bronze': {name: 'Copper mine', bg: 'bg-copper bg-copper progress-bar-striped'},
  'gold': {name: 'Taxation', bg: 'bg-warning'},
};


fetch('/json/gameconfig.json', {cache: 'force-cache'}).then(resp=>resp.json()).then((resp)=>{
  build_conf = resp.costs;
  build_tree = resp.build_tree;

  Events.fire('load_game_conf', [resp]);
});


const res_build = new Set(['wood', 'gold', 'limestone', 'marble']);


export function get_costs(bid, lvl) {
  const cost = {};
  const next_lvl = lvl;
  
  if (!build_conf[bid]) {
    console.error("Bid not found", bid);
    return {};
  }

  for (let res of res_build) {
    if (!build_conf[bid][res])
      continue
    
    const req_am = build_conf[bid][res][next_lvl-1];

    if (req_am > 0)
      cost[res] = req_am;
  }

  if (len(cost) == 0)
    return null;
  return cost;
}


export function can_build(town, bid, lvl) {
  if (typeof bid === 'number' || !isNaN(parseInt(bid))) {
    // It's a resource gatherer
    let i = parseInt(bid);
    var bid = town.gatherers[i][0];

    if (!lvl)
      var lvl = town.gatherers[i][1];

    return can_upgrade_res(town, bid, lvl);
  }

  if (build_skins[bid].disabled)
    return false;

  // It's a normal building
  const next_lvl = lvl || ((town.buildings[bid]||0) + 1);

  // max lvl
  if (!build_conf[bid]['wood'][next_lvl-1])
    return false;

  for (let res of res_build) {
    const req_am = build_conf[bid][res][next_lvl-1];
    const curr_am = town.resources[res];

    if (curr_am < req_am)
      return false;
  }

  return true;
}


function can_upgrade_res(town, res_bid, lvl) {
  const next_lvl = lvl + 1;

  // max lvl
  if (!build_conf[res_bid]['wood'][next_lvl-1])
    return false;

  for (let res of res_build) {
    const req_am = build_conf[res_bid][res][next_lvl-1];
    const curr_am = town.resources[res];

    if (curr_am < req_am)
      return false;
  }

  return true;
}


export function list_unlocked(town) {
  // lists buildings that are not built yet, but can be based on the build tree
  let unlocked = [];

  for (let [bid, deps] of Object.items(build_tree)) {
    // is already built
    if (town.buildings[bid])
      continue;
    if (bid == 'road')
      continue;
    if (build_skins[bid].disabled)
      continue;

    // see if all requirements are met for dependency
    let all_met = true;

    for (let [depbid, lvl] of deps) {
      if ((town.buildings[depbid]||0) < lvl)
        all_met = false;
    }

    if (all_met)
      unlocked.push(bid);
  }

  return unlocked;
}


export function list_upcoming(town) {
  let upcoming = [];

  for (let [bid, deps] of Object.items(build_tree)) {
    // is already built
    if (town.buildings[bid])
      continue;
    if (bid == 'road')
      continue;
    if (build_skins[bid].disabled)
      continue;

    let up = [bid, []];

    // see if all requirements are close to be met
    let req_lvl_diff = 0;

    for (let [depbid, lvl] of deps) {
      // is already built
      req_lvl_diff += Math.max(0, lvl-(town.buildings[depbid]||0));
      up[1].push([depbid, lvl]);
    }

    if (req_lvl_diff/len(up[1]) <= 2.4 && req_lvl_diff != 0)
      upcoming.push(up);
  }

  return upcoming;
}


export function list_all(town) {
  let all = [];

  for (let [bid, deps] of Object.items(build_tree)) {
    if (bid == 'road')
      continue;
    if (build_skins[bid].disabled)
      continue;

    all.push(bid);
  }

  return all;
}


export function remove_cost(town, bid) {
  let cost;

  if (!isNaN(parseInt(bid))) {
    cost = get_costs(town.gatherers[bid][0], town.gatherers[bid][1]);
  } else {
    cost = get_costs(bid, town.buildings[bid]);
  }

  for (let [res, am] of Object.items(cost)) {
    town.resources[res] -= am;
  }
}