import {IsoRenderer} from '/client/gfx2d/renderer.js';
import {SRNG} from '/client/gfx2d/srng.js';

const debug = true;
const TW = 64, n_tiles = 14+2;

let canvas, ctx, riso;
let start;
let rng;
let town, coords = {}, highlighted = null;

const tiles = {
  wood: [8],

  marble: [10,11,12,13],
  bronze: [3],
  food: [4,5,6,7,9,14],
  limestone: [0,1,2],
};

const opts = {
  render_scenery: true,
};

function render(timestamp) {
  const seed = town.iso.charCodeAt(0)-65 + town.iso.charCodeAt(1)-65;
  rng = new SRNG(seed);

  if (!start) 
    start = timestamp;
  let dt = timestamp - start;

  // Clear canvas
  ctx.clearRect(0,0, canvas.width, canvas.height);
  ctx.shadowBlur=0;
  ctx.lineWidth=0;

  // Render scenery
  if (opts.render_scenery) {
    for(let y of range(-n_tiles,n_tiles*2,2)) for(let x of range(-n_tiles,n_tiles*2,2)) {

      if (riso.isIn([x,y]) || (-x-2 == y)) {
        // grass in visible area
        // +added extra condition for upper row
        riso.drawTile('res', 15, [x,y], {});
      }
    }
  } else {
    // Draw grass tiles just under the city
    for(let y of range(0,n_tiles,2)) for(let x of range(0,n_tiles,2)) {
      riso.drawTile('res', 15, [x,y], {});
    }
  }

  // Render town
  for(let y of range(1,n_tiles,2)) for(let x of range(1,n_tiles,2)) {
    let cid = x+','+y;

    if (coords[cid]) {
      let i = coords[cid];

      // get values from town
      let lvl = town.gatherers[i][1];
      let res = town.gatherers[i][0];


      // Draw buildings:
      let tile = rng.choice(tiles[res]);
      riso.drawTile('res', tile, [x,y], {});

      // Draw level:
      if (lvl > 0) {
        riso.drawLevel(lvl, [x,y], {
          text_color: 'black',
          stroke_color: 'black',
          bg_color: highlighted == cid ? '#C9C9FF' : 'white',
        });
      }
    }
  }

  // hack: drop inner shadow
  const H = riso.canvas.height, W = riso.canvas.width;
  ctx.beginPath();

  ctx.shadowColor='black';
  ctx.shadowBlur=15;
  ctx.lineWidth=5;

  ctx.arc(W-250, H/2, H/2, -0.5*Math.PI, 0.5 * Math.PI);
  ctx.lineTo(250, H);
  ctx.arc(250, H/2, H/2, 0.5*Math.PI, -0.5 * Math.PI);
  ctx.lineTo(W-250, 0);

  ctx.closePath();
  ctx.stroke();
  ctx.globalCompositeOperation='destination-in';
  ctx.fill();

  // clean up -- set compsiting back to default
  ctx.globalCompositeOperation='source-over';

  window.requestAnimationFrame(render);
}


function onMouseMove(e) {
  e.stopPropagation();

  let mpos = riso.getMousePos(e);
  let [x,y] = riso.screenToIso(mpos.x, mpos.y, true);

  if (debug)
    $("#debug-coordinate").innerHTML = x+', '+y;

  if (x % 2 == 0) x -= 1;
  if (y % 2 == 0) y -= 1;
  highlighted = x+','+y;

  if (coords[highlighted])
    canvas.style.cursor = "pointer";
  else
    canvas.style.cursor = null;
}

function onMouseUp(e) {
  e.stopPropagation();

  let mpos = riso.getMousePos(e);
  let [x,y] = riso.screenToIso(mpos.x, mpos.y, true);
  
  if (x % 2 == 0) x -= 1;
  if (y % 2 == 0) y -= 1;
  highlighted = x+','+y;

  if (coords[highlighted]) {
    // clicked on building
    gui.infobar("gatherer", town, coords[highlighted]);
  }
}

export function init_rendering(world, t0, user) {
  canvas = document.getElementById("app-gathering");
  riso = new IsoRenderer(TW, canvas, n_tiles);
  riso.setCtx(ctx = canvas.getContext("2d"));

  let loaded = 0;
  town = t0;

  // assign random coordinates to each gatherer
  let allcoords = [];
  for (let i of range(1,n_tiles-2,2)) for (let j of range(1,n_tiles-2,2))
    if (i != (n_tiles-2)/2 && j != (n_tiles-2)/2)
      allcoords.push(i+','+j);

  const seed = town.iso.charCodeAt(0)-65 + town.iso.charCodeAt(1)-65;
  rng = new SRNG(seed);
  rng.shuffle(allcoords);

  // add shuffled world coordinates
  for (let [i,gatherer] of enumerate(town.gatherers)) {
    coords[allcoords[i]] = i;
  }

  function on_load() {
    if (++loaded >= 1) {
      canvas.addEventListener("mousemove", onMouseMove, false);
      canvas.addEventListener("mouseup", onMouseUp, false);
      
      render();
    }
  }

  riso.loadTileset("res", "/img/resources.png", 128, 5, on_load);
  
  //riso.loadTileset("tile", "/img/tiles_test.png", 64, 10, on_load);

  if (debug) {
    window.world = world;
    window.town = town;
  }
}
