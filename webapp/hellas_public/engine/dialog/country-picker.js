import {template} from "/engine/dialog/country-picker.vue.js"
import {countries} from "/engine/modules/worlds/world.js";

export let component = Vue.component('dialog-country-picker', {
  template: template,

  data: function() {
    return {
      countries: countries
    }
  },

  methods: {
    open: function() {

    },

    onClicked: function(iso) {
      this.select = iso;

      Cookies['iso'] = iso;
      Cookies['country_name'] = this.countries[iso].name;

      this.$emit('picked', this.countries[iso]);

      this.show = false;
    }
  }
});
