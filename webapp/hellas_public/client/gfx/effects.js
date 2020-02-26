

let particleSystem;


const DT = 1400;
const SP = 0.02;
const radius = 4;


export function setup_effects(opts) {
  if (!opts.enabled)
    return;

  const scene = Objects.scene;

  // Create & launch a particule system
  particleSystem = new BABYLON.ParticleSystem("particles_lvlup", 3600, scene);    // 3600 particles to have a continue effect when computing circle positions
  particleSystem.particleTexture = new BABYLON.Texture("/img/textures/particles/star_hollow.png", scene);
  // particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
  // particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
  // particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
  particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;
  particleSystem.emitRate = 500;
  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;     // to manage alpha
  //particleSystem.gravity = new BABYLON.Vector3(0, 3, 0);
  //particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
  //particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
  particleSystem.minEmitPower = 5;
  particleSystem.maxEmitPower = 50;
  particleSystem.updateSpeed = SP;


  // Custom function to get the circle effect
  particleSystem.startPositionFunction = function(worldMatrix, positionToUpdate)
  {
      var rndAngle = 2 * Math.random() * Math.PI;
      var randX = radius * Math.sin(rndAngle);
      var randY = this.minEmitBox.y;
      var randZ = radius * Math.cos(rndAngle);
      
      BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(randX, randY, randZ, worldMatrix, positionToUpdate);
  }

}

export function show_lvlup(build) {
  particleSystem.worldOffset = build.position;

  // start particles & highlight building
  particleSystem.start();
  if (build.select_mat) {
    build.select_mat.emissiveColor = BABYLON.Color3.Yellow();
    build.select_mat.alpha = 0.3;
  }

  if (DT) {
    setTimeout(()=>{
      particleSystem.stop();

      if (build.select_mat) {
        //build.select_mat.emissiveColor = BABYLON.Color3.White();

        let INV = setInterval(()=>{
          if(build.select_mat.alpha > 0.0)
            build.select_mat.alpha -= 0.08;
          else {
            build.select_mat.alpha = 0.0;
            clearInterval(INV);
          }

        }, 100);
      }
    }, DT);
  }
}

export function hide_lvlup() {
  particleSystem.stop();
}
