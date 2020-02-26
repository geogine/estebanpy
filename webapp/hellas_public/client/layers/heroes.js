import {getColor, getMapBlend, getHighlight, colors} from '/engine/colors.js';
import {world} from '/engine/modules/worlds/world.js';

export const heroSource = new ol.source.Vector();

const icon_cache = {};

export const heroLayer = new ol.layer.Vector({
  source: heroSource,

  style: (feature, res) => {
    const styles = [];

    const hovered = feature.get('hovered');
    const id = feature.getId();
    const type = feature.get('type')||'hero';
    const iso = feature.get('iso');
    let color = colors.base;
    let color_edge = colors.base_edge;

    // set town color
    if (iso || hovered) {
      color_edge = getColor(iso);
      color = getMapBlend(color_edge, iso);
    }

    styles.push(new ol.style.Style({
      image: icon_cache[iso] || (icon_cache[iso] = new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: '/img/map/unit-'+type+'.png',
        scale: 0.5,
        color: color_edge.rgb()
      }))
    }));

    if (type == 'hero') {
      let num = feature.get('hoplites')||0 + feature.get('skirmishers')||0 + feature.get('cavalry')||0;

      // display number of army
      styles.push(new ol.style.Style({
        text: new ol.style.Text({
          text: num.estimation(),
          fill: new ol.style.Fill({
            color: color.rgb()
          }),
          stroke: new ol.style.Stroke({
            color: color_edge.rgb(),
            width: 2
          }),
          font: '16px "herakles"',
          offsetY: 28,
        }),
      }));
    }

    return styles;
  },
});
heroLayer.name = 'heroes';
