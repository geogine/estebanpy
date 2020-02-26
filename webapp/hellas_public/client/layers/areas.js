import {getColor, getMapBlend, getHighlight, colors} from '/engine/colors.js';
import {world} from '/engine/modules/worlds/world.js';
import {load} from '/engine/loader.js';


// todo: later: download as zip & unzip
export const areaSource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  url: `/json/areas.geojson`,
});

export const areaLayer = new ol.layer.Vector({
  source: areaSource,

  style: (feature, res) => {
    const styles = [];

    const hovered = feature.get('hovered');
    const id = feature.getId();
    const iso = null;
    let color = colors.base;
    let color_edge = colors.base_edge;

    // set town color
    // todo: if hovered
    if (iso) {
      color_edge = getColor(iso);
      color = getMapBlend(color_edge, iso);
    }

    styles.push(new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'white',//color_edge.shade(-0.25).rgb(),
        width: 1
      }),
      fill: new ol.style.Fill({
        color: color.shade(0.1).rgb()
      }),
    }));
    
  //   if (hovered) {
  //     styles.push(new ol.style.Style({
  //       text: new ol.style.Text({
  //         text: feature.get('name'),
  //         fill: new ol.style.Fill({color: dark_bg.rgb()}),
  //         stroke: new ol.style.Stroke({color: dark_bg.contrast(), width: 3}),
  //         font: '14px "Opera Lyrics"',
  //         offsetY: 28,
  //       }),
  //       geometry: point_cen
  //     }));
  //   }  
    // State name
    // styles.push(new ol.style.Style({
    //   text: new ol.style.Text({
    //     text: feature.get('name'),
    //     fill: new ol.style.Fill({
    //       color: color.rgb()
    //     }),
    //     stroke: new ol.style.Stroke({
    //       color: color_edge.rgb(),
    //       width: 3
    //     }),
    //     font: '12px "herakles"',
    //     offsetY: 2,
    //   }),
    // }));

    return styles;
  }
});
areaLayer.name = 'areas';


areaLayer.click = (feature, key) => {
  if (key == 'CTRL' &&  feature) 
    return console.log(feature.getId(), feature.getProperties());
};

load("map", function() {
  var listenerKey = areaSource.on('change', (e) => {
    if (areaSource.getState() == 'ready' && len(areaSource.getFeatures()) > 0) {
      ol.Observable.unByKey(listenerKey);

      this.loaded();
    }
  });
});
