import {load, onload} from '/engine/loader.js';
import {conn} from '/engine/modules/geomap/conn.js';


// Loading methods:

export function load_map(map_name) {
  load("map", function() {
    fetch(`/maps/${map_name}.conjson`, {cache: 'force-cache'}).then((resp) => {
      return resp.json();
    }).then((resp) => {
      for (let [iso1, iso2] of resp) {
        conn[iso1].push(iso2);
        conn[iso2].push(iso1);
      }

      this.loaded();
    });
  })
}

export function add_node(node, edges) {
  for (let edge of edges) {
    conn[node].push(edge);
    conn[edge].push(node);
  }
}

var need_load_conn = null;

export function setup_features(area_source) {
  for (let feature of area_source.getFeatures()) {
    setup_feature(feature);
  }
}


export function setup_feature(feature) {

  if (need_load_conn == null) {
    need_load_conn = !Boolean(feature.get('conn'));
  }

  // add missing centroid
  if (!feature.get('cen'))
    feature.set('cen', centroid(feature));

  // add connection
  let conn = feature.get('conn');
  if (conn) {
    add_node(feature.getId(), conn);
    feature.unset('conn');
  }
}

onload(["map", "world"], (ctx) => {
  if (need_load_conn) {
    // geoconn - load missing connection file
    load_map(world.map);
  }
});