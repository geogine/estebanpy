export const template = `

  <div v-if="get_costs(res_bid, lvl+1)">
    <span id="btn-tool-wrapper" class="d-inline-block" tabindex="0">
      <button @click="onSubmit" :disabled="!can_build(town, bid)" class="btn btn-sm btn-danger">Upgrade</button>
    </span>

    <b-tooltip target="btn-tool-wrapper" custom-class="tooltip-res" placement="bottom">
      <strong>Costs for lvl {{lvl+1}}:</strong>

      <div v-for="(am,res) in get_costs(res_bid, lvl+1)">
        <span v-if="res != 'gold'" :class="'ra ra-2x ra-res-'+res"></span> {{ am.estimation() }}
        <span v-else :class="'ra ra-2x ra-res-gold'+goldicon(am)"></span> {{ am.estimation() }}
      </div>
    </b-tooltip>
  </div>
`;
