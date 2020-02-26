import {template} from "/client/gui/frame/town-edit.vue.js"

import {build_conf} from "/client/game/building.js";
import {get_max_storage} from "/client/game/gathering.js";

const colors = {
  'wood': 'success',
  'limestone': 'secondary',
  'marble': 'white progress-bar-striped',
  'food': 'danger',
  'bronze': 'copper progress-bar-striped',
  'gold': 'warning',
  'pop': 'dark',
  'emerald': 'success progress-bar-striped',
  'holy': 'info progress-bar-striped',
};


export let component = Vue.component('town-edit', {
  template: template,
  data: function() {
    return {
      town: null,
    }
  },
  methods: {
    open: function(town) {
      this.town = town;
    },
    rescol: function(res) {
      return colors[res];
    },
    storage: function(res) {
      return get_max_storage(this.town, res);
    },
    gatherers: function(res) {
      let v = {};

      for (let [i,g] of enumerate(this.town.gatherers)) {
        if (g[0] == res)
          v[i] = g;
      }

      return v;
    },

    max_lvl: function(bid) {
      if (!build_conf[bid])
        return 0;

      return len(build_conf[bid]['wood']);
    },

    save: function() {
      const formData = new FormData();

      formData.append('wid', this.town.wid);
      formData.append('iso', this.town.iso);

      formData.append('resources', JSON.stringify(this.town.resources));
      formData.append('gatherers', JSON.stringify(this.town.gatherers));
      formData.append('placements', JSON.stringify(this.town.placements));
      formData.append('buildings', JSON.stringify(this.town.buildings));

      fetch('/town/edit', {
        method: 'POST',
        body: formData
      });
    },

    clear: function() {
      this.town.buildings = {
        'road': 1
      };
      this.town.placements = {
        'road': []
      };

      for (let res in this.town.resources)
        this.town.resources[res] = 0;

      for (let gather of this.town.gatherers)
        gather[1] = 0;

      this.town.buildings['acropolis'] = 1;
      this.town.buildings['warehouse'] = 1;
      this.town.buildings['granary'] = 1;
    }
  },

  watch: {
    town: {
      handler: function(val) {
        let cov = new Set([]);
        let missing = [];

        for (let bid in this.town.buildings) {
          if (this.town.buildings[bid] == 0) {
            delete this.town.buildings[bid];
            delete this.town.placements[bid];
            continue
          }
          
          if (!this.town.placements[bid])
            missing.push(bid);
          else
            cov.add(this.town.placements[bid].join(','));
        }

        let X = list(range(14)); random.shuffle(X);
        let Y = list(range(14)); random.shuffle(Y);

        for (let bid of missing) {
          // find free coordinate for building
          for (let x of X) for (let y of Y) {
            if (!cov[x+','+y]) {
              this.town.placements[bid] = [x,y];
              break;
            }
          }

          if (!this.town.placements[bid])
            this.town.placements[bid] = [0,0];
        }
      },
      deep: true
    }
  },

  computed: {
    resources: function() {
      return Object.keys(colors);
    },

    resources2: function() {
      return ['pop', 'holy'];
    },

    buildings2: function() {
      return ["lumberyard","stonemason","foundry","mill","warehouse","granary","house"];
    },

    buildings: function() {
      let f = this.buildings2;
      const q = ["wood","limestone","marble","bronze","food","road"];

      return Object.keys(build_conf).filter( function( el ) {
        return !f.includes( el ) && !q.includes(el);
      } );
    }
  }

});
