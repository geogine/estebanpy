
export const template = `
<div v-if="show">
  <div class="modal" style="display: block">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Players</h5>

          <button type="button" class="close" aria-label="Close" @click="$emit('close')">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body scroll" :style="maxHeight">

          <div class="row">
            <div class="col-lg-2 col-md-3 col-sm-4 col-xs-6 pointer" v-for="country in countries" v-on:click="onClicked(country.iso)">

              <div>
                <span :class="'flag flag-md d-inline-block flag-' + country.iso + (country.username?'':' flag-unclaimed')"></span>

                <div></div>

                <h5 class="card-title">{{ country.name }}</h5>
                <p v-if="country.username">{{ country.username }}</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
`;