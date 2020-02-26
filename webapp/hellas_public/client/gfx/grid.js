
// grid events -- todo: this is kinda a hack
const events = {
  move: null,
  pick: null
};

const heights = {};
let select = null, prev_coord = null;
let w_off = 0;

export const opts = {};
export let W = 0, H = 0, NG = 0;

export function setup_grid({size, height, grids, debug, debug_ray}) {
  NG = grids;
  W = size / NG;
  H = height;

  const scene = Objects.scene;

  opts.debug_ray = debug_ray;
  opts.show_coords = false;
  opts.hover_highlight = false;

  w_off = 0;//W/2;

  // create 2D plane to indicate highlight selection of grids
  var selMat = new BABYLON.StandardMaterial("select", scene);
  selMat.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.9);
  selMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  selMat.emissiveColor = BABYLON.Color3.Blue();
  //selMat.ambientColor = new BABYLON.Color3(0.5, 1, 0.2);

  select = BABYLON.MeshBuilder.CreatePlane("select", {width: W, height: W}, scene);
  select.rotate(BABYLON.Axis.X, Math.PI/2, BABYLON.Space.LOCAL);
  select.isVisible = false;
  select.data = {};
  select.isPickable = false;
  
  selMat.freeze();
  select.material = selMat;

  scene.onPointerObservable.add((pointerInfo) => {
    var pick = pointerInfo.pickInfo;

    if (!pick.hit || pick.pickedMesh.name != 'ground')
      // reapply raycast, with the ground
      var pick = scene.pick(scene.pointerX, scene.pointerY, (mesh)=>mesh.name == 'ground');

    if (!pick.hit)
      return;

    const coord = get_coord(pick.pickedPoint);
    const cpos = get_center(coord);

    pick.pickedCoordinate = coord;

    switch (pointerInfo.type) {
      case BABYLON.PointerEventTypes.POINTERMOVE:
        if (events.move)
          return events.move(pick, cpos, pointerInfo.event);
        
        if (!coord) {
          return hide_tile();
        }

        if (opts.hover_highlight) {
          if (prev_coord != gcid(coord)) {
            // put a rectangle in space to show selection
            prev_coord = gcid(coord); 

            select.position.x = cpos[0];
            select.position.y = cpos[1] + 0.1;
            select.position.z = cpos[2];
            select.isVisible = true;
          }
        }

        if (opts.show_coords)
          $("#debug-coordinate").innerHTML = gcid(coord);

        break;
      case BABYLON.PointerEventTypes.POINTERUP:
        if (pointerInfo.event.ctrlKey) {
          // Debug meshes
          var pick = scene.pick(scene.pointerX, scene.pointerY);
          new BABYLON.RayHelper(pick.ray).show(scene);
          console.log(pick.pickedMesh, pick.pickedPoint);

        } if (pointerInfo.event.button == 0 && events.pick)
          events.pick(pick, cpos, pointerInfo.event);
        break;
    }
  });

  if (opts.debug_ray) {
    const dir_down = new BABYLON.Vector3(0, -1, 0);

    console.info("Size:", size, "Grids:", NG, "W_grid:", W);
    console.info("Height:", height);
    console.info('Grid Limits', -NG+1, NG-1);

    // find one height z for each coordinate in the map
    for (let x of range(-NG+1, NG)) {
      for (let y of range(-NG+1, NG)) {
        // casts a ray above the centre of grid tile downwards
        let origin = new BABYLON.Vector3(x*W, H+1, y*W);
        let ray = new BABYLON.Ray(origin, dir_down, H*1.5);

        let pick = scene.pickWithRay(ray, (mesh)=>mesh.name == 'ground');

        new BABYLON.RayHelper(pick.ray).show(scene);

        heights[gcid(x,y)] = pick.pickedPoint.y;
      }
    }
  }
};


export function hide_tile() {
  if (select.isVisible)
    select.isVisible = false;
  
  $("#debug-coordinate").innerHTML = "";
}

export function get_coord(pos) {
  //let p = [Math.floor(round(pos.x,2) / W), Math.floor(round(pos.z,2) / W)];
  let p = [Math.floor((pos.x+W/2)/W), Math.floor((pos.z+W/2)/W)];


  if (p[0]>=NG || p[1]>=NG || p[0]<=-NG || p[1]<=-NG)
    return null;

  return p;
}

export function get_center(co) {
  let h = get_height(co);

  if (!co)
    return null;

  return [W*co[0], h, W*co[1]];
}

export function get_height(coord) {
  const scene = Objects.scene;
  const dir_down = new BABYLON.Vector3(0, -1, 0);

  // cache heights
  let h = heights[gcid(coord)];

  if (!h) {
    // calculate height for coordinate on demand
    let cx = coord[0]*W;
    let cy = coord[1]*W;

    let origin = new BABYLON.Vector3(cx, H+1, cy);
    let ray = new BABYLON.Ray(origin, dir_down, H*1.5);

    let pick = scene.pickWithRay(ray, (mesh)=>mesh.name == 'ground');
    
    if (pick.hit) {
      h = pick.pickedPoint.y;
      heights[gcid(coord)] = h;
    } else {
      //new BABYLON.RayHelper(pick.ray).show(scene);
      console.error("NO HEIGHT", coord, h, heights[gcid(coord)])
    }
  }

  return h;
}

export function grid_event(name, f) {
  events[name.substr(7)] = f;
}


function gcid(pos, nice) {
  let del = nice ? ', ' : ';';

  if (typeof pos === 'number')
    return pos+del+nice;

  if (Array.isArray(pos))
    return pos.join(del);

  return `${pos.x}${del}${pos.y}`;
}
