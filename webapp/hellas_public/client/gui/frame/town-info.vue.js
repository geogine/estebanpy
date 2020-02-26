export const template = `
  <div v-if="town">
    <div class="town-info bg-dark unselectable">
      <b-collapse :visible="is_visible" ref="coll" id="collapse-1" class="mt-2">
        <b-card>
          <div class="card-body">

            <div class="row">
              <h5 class="col font-brand">{{ town.name }}</h5>
              
              <div class="col">
                <span class="ra ra-res-marble"></span> {{ Math.floor(town.resources['marble']).estimation() }}<br/>
                <span class="ra ra-res-emerald"></span> 0
              </div>

            </div>

            <div class="">
              <span :class="'ra ra-2x ra-res-gold'+goldicon"></span> {{ Math.floor(town.resources['gold']).estimation() }} +({{ Math.floor(prod_gold).estimation() }}/h)
              <br/>
              <div class="progress progress-sm">
                <div :class="'progress-bar bg-warning'" role="progressbar" :style="'width: '+ round(town.resources['gold'] / storage *100) +'%'"></div>
              </div>
            </div>
            <div class="">
              <span class="ra ra-2x ra-res-limestone"></span> {{ Math.floor(town.resources['limestone']).estimation() }} +({{ Math.floor(prod_limestone).estimation() }}/h)
              <br/>
        
              <div class="progress progress-sm">
                <div :class="'progress-bar bg-secondary'" role="progressbar" :style="'width: '+ round(town.resources['limestone'] / storage *100) +'%'"></div>
              </div>
            </div>
            <div class="">
              <span class="ra ra-2x ra-res-wood"></span> {{ Math.floor(town.resources['wood']).estimation() }} +({{ Math.floor(prod_wood).estimation() }}/h)
              <br/>
              <div class="progress progress-sm">
                <div :class="'progress-bar bg-success progress-bar-striped'" role="progressbar" :style="'width: '+ round(town.resources['wood'] / storage *100) +'%'"></div>
              </div>
            </div>
            <div class="">
              <span class="ra ra-2x ra-res-bronze"></span> {{ Math.floor(town.resources['bronze']).estimation() }} +({{ Math.floor(prod_bronze).estimation() }}/h)
              <br/>
              <div class="progress progress-sm">
                <div :class="'progress-bar bg-copper progress-bar-striped'" role="progressbar" :style="'width: '+ round(town.resources['bronze'] / storage *100) +'%'"></div>
              </div>
            </div>
            <div class="">
              <span class="ra ra-2x ra-res-food"></span> {{ Math.floor(town.resources['food']).estimation() }} +({{ Math.floor(prod_food).estimation() }}/h)
              <br/>
              <div class="progress progress-sm">
                <div :class="'progress-bar bg-danger'" role="progressbar" :style="'width: '+ round(town.resources['food'] / storage *100) +'%'"></div>
              </div>
            </div>
          </div>
        </b-card>
      </b-collapse>

      <div class="text-center">
        <b-button ref="cbtn" v-b-toggle.collapse-1 block variant="link">
          <span v-if="is_visible" class="ra ra-lg ra-icon-arrow-up"></span>
          <span v-else class="ra ra-lg ra-icon-arrow-down"></span>
        </b-button>
      </div>
    </div>
  </div>
`;
