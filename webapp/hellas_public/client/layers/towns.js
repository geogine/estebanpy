import {getColor, getMapBlend, getHighlight, colors} from '/engine/colors.js';
import {world} from '/engine/modules/worlds/world.js';
import {load} from '/engine/loader.js';
import {jumpTo} from '/engine/gfx/jumpto.js';


export const townSource = new ol.source.Vector({
  format: new ol.format.GeoJSON({
  }),
  url: `/json/polis.geojson`,
});

const icon_cache = {};

export const townLayer = new ol.layer.Vector({
  source: townSource,

  style: (feature, res) => {
    const styles = [];

    const hovered = feature.get('hovered');
    const username = feature.get('username');
    const iso = feature.getId();
    let color = colors.base;
    let color_edge = colors.base_edge;

    // set town color
    if (username || hovered) {
      color_edge = getColor(iso);
      color = getMapBlend(color_edge, iso);
    }

    styles.push(new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: color.rgb()
        }),
        stroke: new ol.style.Stroke({
          color: color_edge.rgb(),
          lineCap: 'square',
          lineDash: [0.1, 8],
          width: 4
        }),
        radius: 14,
      })
    }));

    if (letters[iso] == 'icon') {
      // polis symbol
      styles.push(new ol.style.Style({
        image: icon_cache[iso] || (icon_cache[iso] = new ol.style.Icon({
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: '/img/map/polis-'+iso+'.png',
          scale: 0.28,
          color: color_edge.rgb()
        }))
      }));
    } else {
      // otherwise, we juse display a greek letter
      styles.push(new ol.style.Style({
        text: new ol.style.Text({
          text: letters[iso],
          fill: new ol.style.Fill({
            color: color_edge.rgb()
          }),
          font: 'bold 16px "arial"',
          offsetY: 2,
        }),
      }));
    }

    // State name
    styles.push(new ol.style.Style({
      text: new ol.style.Text({
        text: feature.get('name'),
        fill: new ol.style.Fill({
          color: color.rgb()
        }),
        stroke: new ol.style.Stroke({
          color: color_edge.rgb(),
          width: 3
        }),
        font: '16px "herakles"',
        offsetY: 28,
      }),
    }));

    // User name
    if (username && hovered) {
      styles.push(new ol.style.Style({
        text: new ol.style.Text({
          text: username,
          fill: new ol.style.Fill({
            color: 'white'
          }),
          stroke: new ol.style.Stroke({
            color: 'black',
            width: 2
          }),
          font: '14px "Times New Roman"',
          offsetY: 44,
        }),
      }));
    }

    return styles;
  }
});
townLayer.name = 'areas';


townLayer.click = (feature, key) => {
  if (key == 'CTRL' &&  feature) 
    return console.log(feature.getId(), feature.getProperties());

  if (feature.getId() == world.me)
    window.location = '/town';
  else
    window.location = '/town/'+feature.getId()+'/'+feature.get('name');
};

townLayer.rightclick = (feature, key) => {
  console.log(feature, key);
};

townLayer.keydown = (feature, key) => {
  console.log(feature, key);
};

townLayer.keyup = (feature, key) => {
  console.log(feature, key);
};


let hovered = null;
townLayer.hover = (feature) => {
  if (hovered) {
    hovered.set('hovered', false);
    hovered = null;
  }

  if (feature) {
    // hover in 
    feature.set('hovered', true);
    hovered = feature;

    $("#app-map").style.cursor = "pointer";
  } else {
    // hover out 
    $("#app-map").style.cursor = "";
  }

  // hovering changes the move arrow
  //area_target(feature);
};


load("towns", function() {
  var listenerKey = townSource.on('change', (e) => {
    if (townSource.getState() == 'ready' && len(townSource.getFeatures()) > 0) {
      ol.Observable.unByKey(listenerKey);

      this.loaded();
    }
  });
});


townLayer.keydown = (feature, key) => {
  if (key == 'SPACE' || key == ' ') {
    const feature = townSource.getFeatureById(world.me);

    jumpTo(feature.getGeometry().getCoordinates(), true);
  }

  // else if (key == 'TAB') {
  //   // toggle countries overview infobar
  //   if (!gui.opened)
  //     gui.infobar("countries");
  // }
};

const letters = {
  "CO": "icon",
  "AT": "icon",
  "SP": "Λ",

  // made up BS:
  "OL": "icon",
  "TN": "θ",
  "TH": "θ",
  "DE": "δ",
  "RH": "ρ",
  "KN": "Ξ",
  "MG": "ψ",
  "AR": "α",
  "ER": "ε",
  "TG": "τ",
  "ST": "ς",
  "PT": "π",
  "SM": "Σ",
  "MA": "μ",
  "NA": "ν",
  "LA": "λ",
  "ME": "μ"
}
