export const template = `
<div v-if="show" id="flash">
  <div class="gui-flash-wrapper">
    <div class="gui-flash">
      <div :class="'d-inline-block flag border border-dark rounded flag-sm flag-'+iso"></div>

      <div class="gui-flash-text">
        <span :class="'gui-text text-'+theme">{{ text }}</span>
      </div>
    </div>
  </div>
</div>
`;