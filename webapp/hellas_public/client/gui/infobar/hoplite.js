import {template} from "/client/gui/infobar/hoplite.vue.js"
import {get_img} from '/client/game/autogen.js';


export let component = Vue.component('infobar-hoplite', {
  template: template,

  data: function() {
    return {
      show: false,
      infobar_id: null,

      tf_is_ready: false,

      // Model of hoplite
      town: null,
      unit: {
        health: 0.75,
        name: "Sanyi",
        img_vector: [
          (29.909862518310547 + 0.00028043612837791443)/2,
          (26.26699447631836 + 0.0)/2,
          (0.0 + 0.0)/2,
          (0.0 + 0.0)/2,
          (21.20724105834961 + 0.004125744104385376)/2,
          (34.91117477416992 + 5.576841831207275)/2,
          (28.98605728149414 + 0.0021321214735507965)/2,
          (47.702152252197266 + 23.024473190307617)/2,
          (25.017847061157227 + 2.822951555252075)/2,
          (0.0 + 0.0)/2,
          (20.986604690551758 + 0.0012453645467758179)/2,
          (0.0 + 0.0)/2,
          (18.64076805114746 + 0.0)/2,
          (35.97879409790039 + 11.48003101348877)/2,
          (0.0 + 0.0)/2,
          (19.601293563842773 + 0.004652589559555054)/2
        ]
      }
    }
  },

  methods: {
    open: function(town) {
      this.town = town;

      this.infobar_id = 'hoplite';

      if (!this.tf_is_ready) {
        Events.past('keras_face_loaded', ()=>{
          this.tf_is_ready = true;
        });
      }
    },

    src_unit: function() {
      if (!this.tf_is_ready)
        return '';

      let weights = this.unit.img_vector;
      
      let bgcolor = new Color("#000000");
      // let bgcolor = getColor(this.unit), i = 0;
      // while (bgcolor.contrast() == 'black' && i < 8)
      //   bgcolor = bgcolor.shade(-0.15);

      let color = new Color("#ffffff");

      return get_img(weights, color, bgcolor);
    },

    // @temporal:

    unit_background: function(unit) {
      return "background: black";

      let color = getColor(unit), i = 0;
      while (color.contrast() == 'black' && i < 8)
        color = color.shade(-0.15);

      var bg = 'background: ' + color.rgba() + ';';
      var text = 'color: ' + color.contrast() + ';';

      return bg + text;
    },
    

  }
});