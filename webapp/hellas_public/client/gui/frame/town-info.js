import {template} from "/client/gui/frame/town-info.vue.js"
import {get_production, get_total_production, get_max_storage, get_gold_stack} from "/client/game/gathering.js";


export let component = Vue.component('town-info', {
  template: template,
  data: function() {
    return {
      show: false,
      town: null,

      is_visible: true,
      prod_gold: 0,
      prod_marble: 0,
      prod_limestone: 0,
      prod_wood: 0,
      prod_bronze: 0,
      prod_food: 0,
    }
  },
  methods: {
    open: function(town) {
      this.town = town;

      this.prod_gold = get_total_production(town, 'gold');
      this.prod_marble = get_total_production(town, 'marble');
      this.prod_limestone = get_total_production(town, 'limestone');
      this.prod_wood = get_total_production(town, 'wood');
      this.prod_food = get_total_production(town, 'food');
      this.prod_bronze = get_total_production(town, 'bronze');

      this.storage = get_max_storage(town, 'wood');
      this.granary = get_max_storage(town, 'food');

      // todo: itt: dropdown by cookie val
      // todo: display town resources
      // todo: Update every 5min
      // todo: update by calc every second
    },
  },

  computed: {
    goldicon: function() {
      if (!this.town)
        return 1;
      return get_gold_stack(this.town.resources['gold']);
    }
  },

  watch: {
    town: {
      handler: function(val, oldVal) {
      },
      deep: true
    }
  }
});
