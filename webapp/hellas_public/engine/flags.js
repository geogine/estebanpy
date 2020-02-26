import {load, onload} from '/engine/loader.js';

export const has_texture = new Set([]);



export const img_dim = {w: 512, h: 512};
export const flags = {};
let conf = null;

export function init_flags(cf) {
  conf = cf || {};

  if (conf.dim) {
    img_dim.w = conf.dim[0];
    img_dim.h = conf.dim[1];
  }

  if (conf.spritesheet) {
    parse_flags('/css/flags.png', conf.isos);

    if (ctx)
      ctx = null;
    if (loader_canvas)
      loader_canvas = null;
  } else {
  }
};

function parse_flags(floc,isos) {
  const flagsImg = new Image;
  flagsImg.onload = () => {
    flagsImg.src = floc;
    isos.sort();

    const NX = 5;
    const loader_canvas = document.createElement('canvas');
    const ctx = loader_canvas.getContext("2d");

    loader_canvas.width = img_dim.w;
    loader_canvas.height = img_dim.h;

    // render and add flags to countries
    for (let [flagi, iso] of enumerate(isos)) {
      ctx.clearRect(0,0,img_dim.w, img_dim.h);

      let x = flagi % NX, y = Math.floor(flagi / NX);

      ctx.drawImage(flagsImg, x*img_dim.w,y*img_dim.h, img_dim.w, img_dim.h, 0,0,img_dim.w, img_dim.h);
      let img = new Image;
      img.src = loader_canvas.toDataURL();

      has_texture.add(iso);

      // set flag
      flags[iso] = img;
    }
  }
}


let loader_canvas = document.createElement('canvas');
loader_canvas.width = img_dim.w;
loader_canvas.height = img_dim.h;
let ctx = loader_canvas.getContext("2d");

// Load on-demand and interpret flags
export function getFlag(area) {
  if (typeof area == 'string') var area = {iso: area};
  else if (area.getProperties) var area = area.getProperties();
  let iso = area.iso;

  if (iso && flags[iso]) {
    if (flags[iso] == 'loading')
      return flags['AA'];

    return flags[iso];
  }

  if (has_texture.has(iso)) {
    // load flag texture
    let flagsImg = new Image;
    flags[iso] = 'loading';

    flagsImg.onload = () => {
      // todo: cut into shield shape?
      flags[iso] = flagsImg;
    };
    flagsImg.src = '/img/flags/flag_'+iso+'.png';
  } else {
    // create image of color
    console.log("TODO: image of color");
  }

  return flags['AA'];
}
