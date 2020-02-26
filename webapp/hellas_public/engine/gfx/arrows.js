import {arrowSource} from '/engine/layers/arrows.js';


/************************\
 *       ARROWS         *
\************************/
const hoverArrow = new ol.Feature({
  rotation: 0,
  hide: true,
  locked: false,
  geometry: new ol.geom.LineString([[0,0], [0,0]])
})
arrowSource.addFeature(hoverArrow);

export function show_arrow(from, to, please_lock) {
  hoverArrow.set('iso', from.get('iso'));
  hoverArrow.set('hide', false);

  if (please_lock)
    hoverArrow.set('locked', true);

  // set 1st coordinate
  let geom = hoverArrow.getGeometry();
  let coords = geom.getCoordinates();
  coords[0] = from.get('cen');

  if (to)
    coords[1] = to.get('cen');
  else {
    hoverArrow.set('hide', true);;
    coords[1] = from.get('cen');
  }

  geom.setCoordinates(coords);
}

export function set_arrow(to) {
  if (hoverArrow.set('locked'))
    return;

  hoverArrow.set('hide', false);

  // set 2nd coordinate
  let geom = hoverArrow.getGeometry();
  let coords = geom.getCoordinates();
  coords[1] = to.get('cen');
  geom.setCoordinates(coords);
}

export function hide_arrow(please_unlock) {
  if (hoverArrow.get('locked') && !please_unlock)
    return false;
  
  hoverArrow.set('locked', false);
  hoverArrow.set('hide', true);
  return true;
}
