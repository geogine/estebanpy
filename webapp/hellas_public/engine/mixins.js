import {getColor} from '/engine/colors.js';
import {has_texture} from '/engine/flags.js';

let offset = [0,0];
let infobar_isDown = false;

Vue.mixin({
  methods: {
    open_dialog: function(name, ...params) {
      gui.dialog(name, ...params);
    },

    open_infobar: function(name, ...params) {
      gui.infobar(name, ...params);
    },

    close_infobar: function(name) {
      if (gui.$refs['infobar-'+name] && gui.$refs['infobar-'+name].onclose)
        gui.$refs['infobar-'+name].onclose();

      gui.quit('infobar-'+name);
    },

    infobar_mousedown: function(e) {
      const div = e.target.parentElement;

      if (div.className.substr(0,8) != 'infobar ')
        return;
      
      infobar_isDown = true;
      
      offset = [
        div.offsetLeft - e.clientX,
        div.offsetTop - e.clientY
      ];
    },
    infobar_mouseup: function(e) {
      infobar_isDown = false;
    },
    infobar_mousemove: function(e, infobar_id) {
      e.preventDefault();

      if (infobar_isDown) {
        const div = e.target.parentElement;
        const x = e.clientX + offset[0];
        const y = e.clientY + offset[1];
        
        div.style.left = x + 'px';
        div.style.top  = y + 'px';

        // update last position in gui
        gui.infobar_lastpos[infobar_id] = [x,y];
      }
    },

    maxHeight: function () {
      var h = $('#app-map').offsetHeight;
      return 'max-height: ' + (h - 220) + 'px;';
    },

    area_color: function(area) {
      var color = getColor(area);
      return 'color: ' + color.contrast() + ';';
    },

    area_background: function(area) {
      var color = getColor(area);
      var bg = 'background: ' + color.rgba() + ';';
      var text = 'color: ' + color.contrast() + ';';

      return bg + text;
    },

    unit_background: function(unit) {
      let color = getColor(unit), i = 0;
      while (color.contrast() == 'black' && i < 8)
        color = color.shade(-0.15);

      var bg = 'background: ' + color.rgba() + ';';
      var text = 'color: ' + color.contrast() + ';';

      return bg + text;
    },
    
    herald: function(area) {
      let iso;
      if (typeof area == 'string') iso = area;
      else if (area.get || area.getProperties) iso = area.get('iso');
      else iso = area.iso;

      if (has_texture.has(iso)) {
        var background = "url('/img/flags/flag_"+iso+".png')";
        var bg = 'background-image: ' + background + ';background-position:center;';
      } else {
        var color = getColor(area);
        var bg = 'background-color: ' + color.rgb() + ';';
      }

      return bg;
    },
  }
});