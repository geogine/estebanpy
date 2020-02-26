import {client} from '/client/game/websocket.js';



export function offline_request(route, params) {
  const resp = {
    route: route,
    params: params
  };

  switch(route) {

    default: console.info(route, 'called with', params); break;

  }

}