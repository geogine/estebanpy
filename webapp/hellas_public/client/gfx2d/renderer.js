
export function IsoRenderer(TW, canvas, MAXW) {
  this.tilesets = {};
  this.TW = TW;
  this.MODs = {};
  this.TWs = {};
  this.dx = 0;
  this.dy = 0;

  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  this.setCtx = function(ctx) {
    this.ctx = ctx;
  }


  // ------------------------------
  // Math models
  // ------------------------------

  this.isoToScreen = function(x, y) {
    var TW = this.TW;
    var posX = (x - y) * (TW / 2);
    var posY = (x + y) * (TW / 4);

    return [posX, posY];
  }

  this.screenToIso = function(posX, posY, round) {
    var TW = this.TW;
    //posY -= TW/4;
    var x = (posX / (TW / 2) + posY / (TW / 4))/2;
    var y = posY / (TW / 4) - x;

    if (round)
      return [Math.round(x), Math.round(y)];
    else
      return [x, y];
  }

  this.getMousePos = function(evt) {
    let rect = this.canvas.getBoundingClientRect();

    return {
      x: evt.clientX - rect.left - this.dx,
      y: evt.clientY - rect.top  - this.dy
    };
  }

  this.isIn = function(xy) {
    let [cx,cy] = this.isoToScreen(xy[0], xy[1]);
    let rect = this.canvas.getBoundingClientRect();
    
    cy += this.dy;
    cx += this.dx;

    return 0 <= cx && cx <= this.canvas.width && 0 <= cy && cy <= this.canvas.height;
  }

  this.getCenter = function(xy) {
    if (typeof xy == 'number')
      var xy = [xy, xy];

    const w_iso = Math.min(xy[0], xy[1]);
    let wx = w_iso * this.TW;

    // offset by half the map's size, so that it's centered
    let dx = (this.canvas.width/2 - wx/2) + (wx/2);
    let dy = this.TW/4 + (this.canvas.height/2)-(wx/4);//(wx/4) + (wx/4);

    this.dx = dx;
    this.dy = dy;

    return [dx, dy];
  }

  if (canvas) {
    this.getCenter(MAXW);
  }

  // ------------------------------
  // Sprites
  // ------------------------------

  this.loadTileset = function(name, url, TW, MOD, cb_func) {
    let img = new Image();
    img.addEventListener("load", ()=>{
      this.addTileset(name, img, TW, MOD);
      cb_func();
    });
    img.src = url;
  }

  this.addTileset = function(name, image, TW, MOD) {
    this.tilesets[name] = image;
    this.TWs[name] = TW;
    this.MODs[name] = MOD;
    //this.TWBs[name] = TWB;
  }


  // ------------------------------
  // Draw methods
  // ------------------------------

  this.drawWire = function(xy, opts) {
    if (!opts) var opts = {};
    //if (!offxy) var offxy = [0,0];

    let [Cx,Cy] = this.isoToScreen(xy[0], xy[1]);
    let Hx = this.TW/2, Hy = this.TW/4;

    Cx += this.dx;
    Cy += this.dy;

    this.ctx.beginPath();
    this.ctx.moveTo(Cx, Cy-Hy);
    this.ctx.lineTo(Cx+Hx, Cy);
    this.ctx.lineTo(Cx, Cy+Hy);
    this.ctx.lineTo(Cx-Hx, Cy);
    this.ctx.lineTo(Cx, Cy-Hy);

    if (opts.block_color) {
      this.ctx.fillStyle = opts.block_color;
      this.ctx.fill();
    } 

    if (opts.wire_color) {
      this.ctx.strokeStyle = opts.wire_color;
      this.ctx.stroke();
    }
  }

  this.drawWires = function(xy, opts) {
    if (typeof xy == 'number')
      var xy = [xy, xy];

    let [dx, dy] = this.getCenter(xy);

    // draw wires each
    for(var y=0; y<xy[1]; y++) for(var x=0;x<xy[0];x++) {
      let OP = typeof opts === 'function' ? opts(x,y) : opts;

      this.drawWire([x,y], [dx,dy], OP);

      if (opts.display_coords)
        this.drawText(x+","+y, [x,y], [dx,dy], OP);
    }
  }

  this.drawTile = function(name, i, xy, opts) {
    var pos = this.isoToScreen(xy[0], xy[1]);

    var M = this.MODs[name];
    var TWB = this.TWs[name];
    var my = Math.floor(i / M), mx = i % M;

    this.ctx.drawImage(
      this.tilesets[name],
      mx*TWB, my*TWB, TWB, TWB,
      this.dx+pos[0] - (this.TW/2)-((TWB-this.TW)/2),
      this.dy+pos[1] - (this.TW/4)-((TWB-this.TW)/2+1),
      TWB, TWB
    );
  }

  this.drawText = function(text, xy, opts) {
    this.ctx.font = "bold 14px Arial";
    this.ctx.lineWidth = 1;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = "center";

    let pos = this.isoToScreen(xy[0], xy[1]);

    if (opts.stroke_color) {
      this.ctx.strokeStyle = opts.stroke_color;
      this.ctx.strokeText(text, this.dx+pos[0], this.dy+pos[1]);
    }

    this.ctx.fillStyle = opts.text_color||'black';
    this.ctx.fillText(text, this.dx+pos[0], this.dy+pos[1]);
  }

  this.drawLevel = function(text_lvl, xy, opts) {
    let pos = this.isoToScreen(xy[0], xy[1]);

    this.ctx.strokeStyle = opts.stroke_color;
    this.ctx.fillStyle = opts.bg_color||'white';

    this.ctx.beginPath();
    this.ctx.arc(this.dx+pos[0], this.dy+pos[1], 9, 0,2*Math.PI);
    this.ctx.stroke();
    this.ctx.fill();

    this.ctx.font = "bold 12px Arial";
    this.ctx.lineWidth = 1;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = "center";

    this.ctx.fillStyle = opts.text_color||'black';
    this.ctx.fillText(text_lvl, this.dx+pos[0], this.dy+pos[1]);
  }
}
