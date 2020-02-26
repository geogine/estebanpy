
export const template = `
  <div v-if="show" class="infobar font-oldie">
    <infobar-header content="Hoplite" infobar_id="acropolis"></infobar-header>
    <div class="infobar-content p-2" :bid="bid">
       

        <div class="pointer unit-box text-center p-2" :style="unit_background(unit)" >


          <img class="img-fluid" :src="src_unit(unit)" style="min-height:75px" />

          <i class="ra ra-lg ra-panel-world" style="position: absolute; top: 70px"></i>
        </div>


        <div class="progress">
          <div class="progress-bar bg-danger" role="progressbar" :style="'width: '+Math.round(unit.health*100)+'%'">
            <i class="ra ra-health"></i> {{Math.round(unit.health*100)}}
          </div>
        </div>
    </div>
  </div>
`;