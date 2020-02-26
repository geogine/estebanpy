

export function setup_scene(scene, {sky, sun, water, test_sphere, test_light, postprocess, ground}, cb) {
  const gnd = ground, proc = postprocess;

  if (sky) {

    if (sky == 'globe') {
      //skyMat.reflectionTexture = new BABYLON.CubeTexture(`/img/textures/???`, scene);
      var thesky = BABYLON.Mesh.CreateSphere("skyBox", {diameter: sky.distance||5000.0, sideOrientation: BABYLON.Mesh.BACKSIDE}, scene);

      const skyMat = new BABYLON.StandardMaterial("skyBox", scene);
      skyMat.backFaceCulling = false;
      skyMat.reflectionTexture = new BABYLON.Texture(`/img/textures/skies/skyglobe`, scene);
      skyMat.reflectionTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
      skyMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyMat.specularColor = new BABYLON.Color3(0, 0, 0);
      skyMat.disableLighting = true;

      thesky.material = skyMat;
    } else if (sky == 'box') {
      var thesky = BABYLON.Mesh.CreateBox("skyBox", sky.distance||5000.0, scene);

      const skyMat = new BABYLON.StandardMaterial("skyBox", scene);
      skyMat.backFaceCulling = false;
      skyMat.reflectionTexture = new BABYLON.CubeTexture(`/img/textures/skies/TropicalSunnyDay`, scene);
      skyMat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      skyMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyMat.specularColor = new BABYLON.Color3(0, 0, 0);
      skyMat.disableLighting = true;

      thesky.material = skyMat;
    }

    // if (thesky)
    //   Objects.sky = thesky;
  }

  if (sun) {
    //var light_sky = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    var sun = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene);
    //light_sun.diffuse = new BABYLON.Color3(1, 0, 0);
  }

  if (test_light) {
    let light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
  }

  if (test_sphere) {
    let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:10}, scene);

    sphere.position.y = 10;

    Objects.test_sphere = sphere;
  }

  // Add objects
  if (gnd && gnd.enabled) {
    // generate ground from height map:
    const subdiv = gnd.subdiv||250;
    const lvlz = 0;
    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", `/img/textures/terrain/${gnd.map}_hm.png`, gnd.size, gnd.size, subdiv, lvlz, gnd.height, scene, false, cb);

    ground.isPickable = true;
    ground.freezeWorldMatrix();

    // add geopoly properties
    ground.data = {
      dx: gnd.size/2, 
      dy: gnd.size/2,
      dz: gnd.height - lvlz
    };

    if (gnd.add_diffuse_texture) {
      var groundMat = new BABYLON.StandardMaterial("ground", scene);
      groundMat.diffuseTexture = new BABYLON.Texture(`/img/textures/terrain/${gnd.map}_tex.png`, scene);
      groundMat.specularColor = new BABYLON.Color3(0, 0, 0);

      ground.material = groundMat;      
    }

    Objects.ground = ground;
  }


  if (water) {
    var water = BABYLON.Mesh.CreateGround("water", 2048, 2048, 16, scene, false);
    
    var waterMat = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(512, 512));
    waterMat.backFaceCulling = true;
    waterMat.bumpTexture = new BABYLON.Texture(`/img/textures/normals/waterbump.png`, scene);
    waterMat.windForce = -2;
    waterMat.waveHeight = 0.2;
    waterMat.bumpHeight = 0.2;
    waterMat.windDirection = new BABYLON.Vector2(1, 1);
    waterMat.waterColor = new BABYLON.Color3(0, 0, 221 / 255);
    waterMat.colorBlendFactor = 0.0;

    waterMat.addToRenderList(thesky);
    water.material = waterMat;

    Objects.water = water;
  }


  if (proc && proc.type != 'default') {
    const camera = Objects.camera;

    const pipeline = new BABYLON.DefaultRenderingPipeline(
      "default", // The name of the pipeline
      false, // Do you want HDR textures?
      scene, // The scene instance
      [camera] // The list of cameras to be attached to
    );

    // Anti aliasing
    if (proc.antialiasing) {
      pipeline.samples = 2;
      pipeline.fxaaEnabled = true;      
    }

    // sharpening
    if (proc.sharpening) {
      pipeline.sharpenEnabled = true;
      pipeline.sharpen.edgeAmount = 0.9;
      pipeline.sharpen.colorAmount = 0.0;      
    }

    // Depth of field
    if (proc.depth_filter) {
      pipeline.depthOfFieldEnabled = true;
      pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Low;
      // distance of the current focus point from the camera in millimeters considering 1 scene unit is 1 meter
      pipeline.depthOfField.focusDistance  = 10000; 
      // focal length of the camera in millimeters
      pipeline.depthOfField.focalLength  = 20; 
      // pipeline.depthOfField.fStop  = 1.4; // aka F number of the camera defined in stops as it would be on a physical device
    }

    if (proc.photo) {
      scene.imageProcessingConfiguration.exposure = 0.8;
      scene.imageProcessingConfiguration.contrast = 1.4;      
    }
  }

}

