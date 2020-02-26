import {template} from "/client/gui/component/upgrade-button.vue.js"
import {can_build, get_costs} from "/client/game/building.js";
import {get_gold_stack} from "/client/game/gathering.js";
import {build} from "/client/game/client.js";


export let component = Vue.component('upgrade-button', {
  template: template,
  props: ['town', 'bid'],
  data: function() {
    return {
    }
  },
  created: function() {

  },
  methods: {

    onSubmit: function() {
      build(this.town, this.bid);

      Events.fire('build_upgrade', [this.bid, this.town.buildings[this.bid]+1]);
    },

    goldicon: function(am) {
      return get_gold_stack(am);
    },

    get_costs: get_costs,
    can_build: can_build,
  },
  computed: {
    is_gatherer: function() {
      return typeof this.bid === 'number' || !isNaN(parseInt(this.bid));
    },
    lvl: function() {
      if (this.is_gatherer)
        return this.town.gatherers[parseInt(this.bid)][1];
      else
        return this.town.buildings[this.bid];
    },
    res_bid: function() {
      if (this.is_gatherer)
        return this.town.gatherers[parseInt(this.bid)][0];
      else
        return this.bid;
    }
  }
});