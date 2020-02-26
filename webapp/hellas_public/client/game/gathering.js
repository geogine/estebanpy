import {build_conf} from '/client/game/building.js';

const boosters = {
  "wood": "lumberyard",
  "limestone": "stonemason",
  "bronze": "foundry",
  "food": "mill",
  "gold": "agora",

  "marble": "__nothing__"
}

const W_SPEED = 1.0;
const max_pop = 11000.0;
const max_emerald = 100000;
const max_holy = 30;
const gold_boost = 0.9;


export function get_total_production(town, res0) {
  if (res0 == 'gold')
    return get_production(town, res0, 1);

  let prod_sum = 0;

  for (let [res, lvl] of town.gatherers) {

    if (res == res0)
      prod_sum += get_production(town, res, lvl);
  }

  return prod_sum;
}

export function get_production(town, res, lvl) {
  if (lvl <= 0)
    return 0;

  let boosting = 1.0;
  let booster = boosters[res]||null;

  if (booster in town.buildings) {
    let booster_lvl = town.buildings[booster];

    if (booster_lvl > 0)
      boosting = 1.0 + (build_conf[booster]['attri'][booster_lvl-1]/100);
  }

  // gold is a special resource
  if (res == 'gold')
    return boosting * town.resources['pop'] * gold_boost * W_SPEED;

  let prod = build_conf[res]['prod'][lvl-1];

  let production = prod * boosting * W_SPEED;
  return production;
}

export function get_max_storage(town, res) {
  // special resources
  if (res == "holy")
    return max_holy;
  else if (res == "emerald")
    return max_emerald;
  else if (res == "pop")
    return max_pop;

  // Gets max storage capacity of resource type.
  let storage_facility = "warehouse"
  if (res == "food") {
    storage_facility = "granary"
  }
  
  let lvl = town.buildings[storage_facility]||0;
  if (lvl == 0) {
    return 0;
  }

  let storage = build_conf[storage_facility]['attri'][lvl-1];
  return storage;
}


export function simulate_gather_all(town, dt) {
  // Gets gathered resources in dt
  const h = dt/3600.0;

  town.resources['wood'] += Math.min(get_max_storage(town, 'wood'), get_total_production(town, 'wood') * h);
  town.resources['food'] += Math.min(get_max_storage(town, 'food'), get_total_production(town, 'food') * h);
  town.resources['gold'] += Math.min(get_max_storage(town, 'gold'), get_total_production(town, 'gold') * h);
  town.resources['marble'] += Math.min(get_max_storage(town, 'marble'), get_total_production(town, 'marble') * h);
  town.resources['bronze'] += Math.min(get_max_storage(town, 'bronze'), get_total_production(town, 'bronze') * h);
  town.resources['limestone'] += Math.min(get_max_storage(town, 'limestone'), get_total_production(town, 'limestone') * h);

  return true;
}


export function get_gold_stack(gold) {
  if (gold >= 1000000)
    return 5;
  else if (gold >= 100000)
    return 4;
  else if (gold >= 5000)
    return 3;
  else if (gold >= 200)
    return 2;
  else
    return 1;
}
