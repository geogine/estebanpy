export const borderSource = new ol.source.Vector();
import {getColor} from '/js/game/colors.js';


export const borderLayer = new ol.layer.Vector({
  source: borderSource,

  style: (feature, res) => {
    let styles = [];

    // country outer border style:
    styles.push(new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      }),
    }));

    return styles;
  }
});

borderLayer.name = 'borders';
