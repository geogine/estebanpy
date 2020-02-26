export let armies_conf = {};

Events.past('load_game_conf', (resp)=>{
  armies_conf = resp.armies;
});


const res_cost = {
  buy: new Set(['wood', 'bronze']),
  main: new Set(['gold', 'food', 'bronze'])
}


export function get_costs(unit, numb, cat) {
  const cost = {};

  if (!armies_conf[unit]) {
    console.error("Unit not found", unit);
    return null;
  }

  if (!cat)
    var cat = 'buy';

  // get number category in config
  const icfg = get_icfg(unit, numb);

  for (let res of res_cost[cat]) {
    if (!armies_conf[unit][res])
      continue
    
    const req_am = armies_conf[unit][cat+'_'+res][icfg];

    if (req_am > 0)
      cost[res] = req_am;
  }

  if (len(cost) == 0)
    return null;
  return cost;
}



function get_icfg(unit, numb) {
  // Gets cost index in config based on number of soldiers present
  let icfg;
  var numb = numb||0;

  if (unit == 'warship') {
    // Warships have number category
    for (let [i, num_criteria] of enumerate(armies_conf[unit]['number'])) {
      if (numb > num_criteria)
        break;

      icfg = i - 1;
    }
  } else if (unit == 'hero') {
    // heroes have a cost for each number

    icfg = Math.min(20, numb) - 1;
  } else {
    // for regular soldiers, there's only 1 cost
    // number is ignored

    icfg = 0;
  }

  return icfg;
}