import {build_skins} from '/client/game/building.js';


let bsize = 6;
let scene;

const models = {
  "lumberyard": null,
  "stonemason": "stonemason",
  "foundry": "foundry",
  "mill": null,
  "warehouse": "warehouse",
  "granary": "granary",
  "harbor": null,
  "acropolis": "acropolis",
  "agora": "agora",
  "theatre": "theatre",
  "temple": null,
  "house": null,
  "gymnasium": "gymnasium",
  "wall": null,  
}
export const spaces = {
 "lumberyard": [1,1,1,1],
 "stonemason": [1,1,1,1],
 "foundry": [1,1,1,1],
 "mill": [1,1,1,1],
 "warehouse": [1,1,1,1],
 "granary": [1,2,1,1],
 "harbor": [1,1,1,1],

 "acropolis": [4,3,4,1],
 "agora": [5,5,5,5],
 "theatre": [5,4,5,4],
 "temple": [1,1,1,1],
 "house": [1,1,1,1],

 "gymnasium": [1,2,1,3],
 "wall": [1,1,1,1],
};

let onfinish = null;
let assetsManager;
let instant_load = false;

export function setup_loader(bs) {
  bsize = bs;

  assetsManager = new BABYLON.AssetsManager(Objects.scene);
  
  // assetsManager.onProgress = function(remainingCount, totalCount, lastFinishedTask) {
  //   engine.loadingUIText = 'We are loading the scene. ' + remainingCount + ' out of ' + totalCount + ' items still need to be loaded.';
  // };
}

export function start_loading(cb) {
  assetsManager.onFinish = ()=>{
    // after the initial loading, we load models on demand:
    instant_load = true;

    cb();
  };

  BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
    if (document.getElementById("geoLoad")) {
      // Do not add a loading screen if there is already one
      document.getElementById("geoLoad").style.display = "initial";
      return;
    }

    this._loadingDiv = document.createElement("div");
    this._loadingDiv.id = "geoLoad";

    this._loadingDiv.innerHTML = "<div class='text-center'><img class='align-middle' src='/img/hellas_logo.png'/></div> Loading...";

    this._resizeLoadingUI();
    window.addEventListener("resize", this._resizeLoadingUI);
    document.body.appendChild(this._loadingDiv);
  };

  BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function(){
      document.getElementById("geoLoad").style.display = "none";
      console.log("scene is now loaded");
  }

  Objects.scene.getEngine().displayLoadingUI();

  // Start loading
  assetsManager.load();
}

export function load(bid, cb) {

  create_mesh(bid, (build)=>{
    //build.group = 'building';
    build.data.bid = bid;

    // apply a new layer of material for emissive selet
    if (build.material.constructor.name == 'MultiMaterial') {
      // freeze the rest of the materials
      build.material.subMaterials.forEach((mat)=>{
        mat.freeze();
      });

      const emat = new BABYLON.StandardMaterial('s'+bid, Objects.scene);
      const N = len(build.material.subMaterials);

      emat.emissiveColor = BABYLON.Color3.White();
      emat.alpha = 0.0;

      // apply material all over the mesh
      build.subMeshes.push(new BABYLON.SubMesh(N, 0, build.getTotalVertices(), 0, build.getTotalIndices(), build));

      build.material.subMaterials.push(emat);
      build.select_mat = emat;
    }

    cb(build);
  });
}

function create_mesh(bid, cb) {
  let build;
  const model = models[bid];

  if (model) {
    if (!instant_load) {
      // Load using original pipeline
      let meshTask = assetsManager.addMeshTask("load "+bid, "", "/models/buildings/", model+".babylon");

      meshTask.onSuccess = function (task) {
        for (let build of task.loadedMeshes) {
          build.data = {
            adjust: [
              build.position.x,
              build.position.y,
              build.position.z,
            ],
            dirt_space: spaces[bid]
          };

          cb(build);
        }
      };
      meshTask.onError = function (task, message, exception) {
        console.error(message, exception, model+".babylon");
      };
    } else {
      // load on-demand
      BABYLON.SceneLoader.ImportMesh("", "/models/buildings/", model+".babylon", scene, function (meshes, particleSystems, skeletons) {

        for (let build of meshes) {
          build.data = {
            adjust: [
              build.position.x,
              build.position.y,
              build.position.z,
            ],
            dirt_space: spaces[bid]
          };

          cb(build);
        }
      });
    }
  } else {
    const scene = Objects.scene;

    // no model found for building
    // use placeholder box
    build = BABYLON.MeshBuilder.CreateBox(bid,  {height: bsize, width: bsize, depth: bsize}, scene);

    // Text over material
    let text = new BABYLON.DynamicTexture("dynamic texture", {width:512, height:256}, scene);   
    let textureContext = text.getContext();
    const col = build_skins[bid].cat_color;
    text.drawText(bid.title(), 20, 140, "bold 68px monospace", col, "white", true, true);

    // Sample material
    var bmat = new BABYLON.StandardMaterial(bid, scene);
    bmat.diffuseTexture = text;
    bmat.specularColor = new BABYLON.Color3(0.2, 0.3, 0.4);
    build.material = bmat;

    // debug materials aren't frozen, let it go
    //bmat.freeze();

    build.data = {
      height: bsize/2
    };

    cb(build);
  }

  // Set up building information
}
