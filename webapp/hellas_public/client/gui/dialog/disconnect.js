import {template} from "/client/gui/dialog/disconnect.vue.js"


export let component = Vue.component('dialog-disconnect', {
  template: template,

  data: function() {
    return {
      show: false,
      status: null,
      attempts: 0,
    }
  },

  methods: {
    open: function() {
      this.show = true;
      this.attempts = 0;
    },

    close: function() {
      this.show = false;
    },

    onAttempt: function() {
      this.status = 'reconnect';
      this.attempts++;
    },

    onFailed: function() {
      this.status = 'failed';
    },

    onReconnect: function() {
      this.status = 'success';
      this.attempts = 0;

      setTimeout(()=>{
        this.close();
      }, 200);
    },

    onQuit: function() {
      alert("Feature not yet implemented");
      //window.location = '/';
      //this.close();
    }
  }
});
