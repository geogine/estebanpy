export let gui = {};
export let overlays = {};



if ($("#app-gui").innerHTML) {
  gui = new Vue({
    el: '#app-gui',
    data: {
      opened_comp: null,
      opened: null,
      opened_type: null,

      infobar_lastpos: defaultdict(list, true)
    },
    methods: {
      child: function(name) {
        return this.$refs[name];
      },

      infobar: function(name, ...params) {
        if (this.opened_comp && this.opened_type != 'infobar') {
          this.opened_comp.show = false;
          this.opened = null;
          this.opened_type = null;
        }

        let child = this.$refs['infobar-'+name];

        if (!child) return;

        child.open(...params);
        child.show = true;
        this.opened_comp = child;
        this.opened = name;
        this.opened_type = 'infobar';

        // set previous x,y location if it was saved
        if (gui.infobar_lastpos[gui.opened]) {
          const [x,y] = gui.infobar_lastpos[gui.opened];
          
          Vue.nextTick(()=>{
            child.$el.style.left = x + 'px';
            child.$el.style.top  = y + 'px';
          });
        }
      
        return child;
      },

      dialog: function(name, ...params) {
        if (this.opened_comp && this.opened_type != 'infobar') {
          this.opened_comp.show = false;
          this.opened = null;
          this.opened_type = null;
        }

        let child = this.$refs['dialog-'+name];

        if (!child) return;

        child.open(...params);
        child.show = true;
        this.opened_comp = child;
        this.opened = name;
        this.opened_type = 'dialog';

        return child;
      },

      overlay: function(name, coord, ...params) {
        if (this.opened_comp && this.opened_type != 'infobar') {
          // hide ol overlay
          if (overlays[this.opened]) {
            overlays[this.opened].setPosition(undefined);
          }

          // hide overlay gui
          this.opened_comp.show = false;
          this.opened = null;
          this.opened_type = null;
        }

        let child = this.$refs['overlay-'+name];

        if (!child) return;

        child.open(...params);
        child.show = true;
        this.opened_comp = child;
        this.opened = name;
        this.opened_type = 'overlay';

        // openlayers overlay
        if (!overlays[name]) {
          // create new openlayers overlay and link it to the gui system 
          const overlay = new ol.Overlay({
            element: gui.$refs['overlay-'+name].$el,
            position: coord,
            autoPan: true,
            autoPanAnimation: {
              duration: 250
            }
          });
          
          // add overlay to both map and GUI
          map.addOverlay(overlay);
          overlays[name] = overlay;
        } else {
          // update overlay GUI with updated vue GUI:
          overlays[name].setPosition(coord);
        }

        return child;
      },

      flash: function(text, theme, iso) {
        this.$refs.flash.display(text, theme, iso);
      },

      quit: function (ref_id) {
        if (ref_id) {
          const ref = this.$refs[ref_id];

          if (!ref) {
            console.error('Trying to close unknown gui element', ref_id);
            return;
          }

          if (ref.close)
            ref.close();
          else
            ref.show = false;
        } else {
          // close all
          for (let rname in this.$refs) {
            this.quit(rname);
          }
        }

        if (this.opened_comp || this.opened) {
          this.opened_comp = null;
          this.opened = null;
        }
      },
    },
    computed: {
      frame: function() {
        return this.$refs.frame;
      }
    },
  });
}