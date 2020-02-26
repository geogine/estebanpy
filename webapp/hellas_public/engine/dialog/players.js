import {template} from "/engine/dialog/players.vue.js";
import {countries} from "/engine/modules/worlds/world.js";

export let component = Vue.component('dialog-players', {
  template: template,
  data: function() {
    return {
      show: false,

      countries: countries,
    }
  },
  created: function () {
  },
  methods: {
    open: function() {
      
    },

    onClicked: function() {
      
    }
  }
});