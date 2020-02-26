import {simulate_gather_all} from "/client/game/gathering.js";
import {remove_cost} from "/client/game/building.js";


let task = null;
let interval = 1000*60*5;
let interval2 = 500;
let town = null;

export function start_updating(to) {
  town = to;

  // 5 minute server sync
  let task = setInterval(()=>{
    fetch('/api/town/resources').then(resp=>resp.json()).then((resources)=>{
      town.resources = resources;
    });
  }, interval);


  // realtime res simulation on frontend
  let d0 = (new Date()).getTime();
  let task2 = setInterval(()=>{
    let d1 = (new Date()).getTime();
    let dt = (d1-d0)/1000.0;

    simulate_gather_all(town, dt);

    d0 = d1;
  }, interval2);
}


export function save_roads(new_arr, del_arr) {
  const formData = new FormData();

  formData.append('new_roads', JSON.stringify(new_arr));
  formData.append('delete_roads', JSON.stringify(del_arr));

  fetch('/api/town/roads', {
    method: 'PUT',
    body: formData
  }).then(resp=>resp.json()).then((resp)=>{
    if (resp.error)
      return handle_err(resp);

    // todo: handle town roads
  });
}


export function replace(town, bid, [x,y], cb) {
  const formData = new FormData();

  formData.append('x', x);
  formData.append('y', y);

  fetch('/api/town/move/'+bid, {
    method: 'PUT',
    body: formData
  }).then(resp=>resp.json()).then((resp)=>{
    if (resp.error)
      return handle_err(resp);

    town.placements[bid] = [x,y];

    // handle 3D callback
    cb();
  });
}



export function build(town, bid, coord, cb) {
  const formData = new FormData();

  if (coord) {
    if (town.buildings[bid]) {
      console.error("New building called with existing bid", bid);
      return;
    }

    // construct new building
    formData.append('x', coord[0]);
    formData.append('y', coord[1]);

    fetch('/api/town/build/'+bid, {
      method: 'POST',
      body: formData
    }).then(resp=>resp.json()).then((resp)=>{
      if (resp.error)
        return handle_err(resp);

      town.buildings[bid] = 1;

      // update resources
      remove_cost(town, bid);

      // update town -> handled by gfx
      cb();
    });
  } else {
    if (!town.buildings[bid] && !town.gatherers[parseInt(bid)]) {
      console.error("Building or gatherer doesn't exist", bid);
      return;
    }

    fetch('/api/town/build/'+bid, {
      method: 'PUT',
      body: formData
    }).then(resp=>resp.json()).then((resp)=>{
      if (resp.error)
        return handle_err(resp);

      if (!isNaN(parseInt(bid))) {
        // gatherer
        town.gatherers[bid][1] += 1;
        var lvl = town.gatherers[bid][1];

        // update town -> already handled by client
        if (cb) cb();
      } else {
        town.buildings[bid] += 1;
        var lvl = town.buildings[bid];

        // update town -> already handled by client
        cb();
      }

      // update town values
      remove_cost(town, bid);
    });
  }
}

export function recruit(town, unit, num) {
  if (num == null)
    var num = 1;
  
  formData.append('num', num);

  fetch('/api/town/'+unit, {
    method: 'POST',
    body: formData
  }).then(resp=>resp.json()).then((resp)=>{
    if (resp.error)
      return handle_err(resp);

    alert("OKIE DOKIE");

    // update town values
    //remove_cost(town, bid);
  });
}

function handle_err(resp) {
  if (!resp.error) return;

  if (Array.isArray(resp.error)) {
    let msg = "";

    for (let [res, am] of Object.items(resp.error[1]))
      msg += res +' -> ' +am+', ';

    alert(resp.error[0] + ": " + msg);
  } else {
    alert(resp.error);
  }
}
