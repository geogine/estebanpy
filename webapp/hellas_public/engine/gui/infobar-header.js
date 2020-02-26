import {template} from "/engine/gui/infobar-header.vue.js"


export let component = Vue.component('infobar-header', {
  template: template,

  props: {
    content: { default: "" },
    subcontent: { default: "" },
    iso: { default: null },
    infobar_id: { default: "" },
  },

});
