export const template = `
  <div v-if="town">
    <h2 class="font-brand text-white">Editing {{ town.name }} 
      <button @click="save" class="btn btn-primary">Save</button> 
      <button @click="clear" class="btn btn-link">Clear</button> 
    </h2>

    <div class="d-flex">
      <div class="p-2 card-paper">
        <div class="row">
          <div class="col">
            <strong>Resources</strong>
          </div>
          <div class="col">
            <strong>Gatherers</strong>
          </div>
        </div>

        <!-- Resources -->
        <div v-for="res in resources">
          <div class="row">
            <div class="col card-paper">

              <p><span :class="'ra ra-res-'+res"></span> <strong :class="'text-'+rescol(res)">{{ res.title() }}</strong> - {{ town.resources[res] }}</p>

              <input type="range" :class="'custom-range bg-'+rescol(res)" min="0" :max="storage(res)" v-model.number="town.resources[res]">

              <div>
                <button @click="town.resources[res] = 0" class="btn btn-link">(set 0)</button>
                <button @click="town.resources[res] = storage(res)"class="btn btn-link">(set {{ storage(res) }})</button>
              </div>

            </div>
            <div class="col card-paper">

              <div v-for="[res,lvl],i in gatherers(res)">
                <div class="d-flex">
                  <input type="range" :class="'flex-fill custom-range bg-'+rescol(res)" min="0" max="20" v-model.number="town.gatherers[i][1]">
                  <div style="min-width: 50px; padding-left: 3px">Lv {{ town.gatherers[i][1] }}</div>
                </div>

              </div>
            </div>
          </div>

          <hr />
        </div>
      </div>
      <div v-for="Q in [buildings2, buildings]" class="p-2 card-paper">
        <!-- Buildings -->
        <table class="table table-sm table-borderless">
          <tr>
            <th>Build</th>
            <th colspan="2">Level</th>
            <th>Coords</th>
          </tr>
          <tr v-for="bid in Q">
            <td :class="{'text-secondary': !town.buildings[bid] == 0}">
              <strike v-if="!town.buildings[bid]">{{ bid.title() }}</strike>
              <span v-else>{{ bid.title() }}</span>
            </td>
            <td>
              <input type="range" class="flex-fill custom-range" min="0" :max="max_lvl(bid)" v-model.number="town.buildings[bid]">
            </td>
            <td>
              <strike v-if="!town.buildings[bid]">Lvl 0</strike>
              <span v-else>Lvl {{ town.buildings[bid] }}</span>

            <td>
              <span v-if="town.placements[bid]">
                <input type="number" v-model.number="town.placements[bid][0]" min="-28" max="28" style="max-width: 50px">
                <input type="number" v-model.number="town.placements[bid][1]" min="-28" max="28" style="max-width: 50px">
                
              </span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
`;
