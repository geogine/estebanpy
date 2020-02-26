
export const template = `


  <div @mousedown="infobar_mousedown" @mouseup="infobar_mouseup" @mousemove="infobar_mousemove($event, infobar_id)" class="infobar-header unselectable" :style="iso ? area_background(iso) : ''">
    <div v-if="iso" :class="'border border-dark rounded d-inline-block flag flag-xs flag-'+iso"></div>

    {{ content }}

    <span v-if="subcontent" class="small">{{ subcontent }}</span>

    <button type="button" class="close" aria-label="Close" @click="close_infobar(infobar_id)">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>

`;