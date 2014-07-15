
function ui_init_pre() {
  prop.ui={};

  prop.ui.pan=[0,0]; // pan in pixels
  // if pan is [100,0] you are looking to the right
  // if [0,100] you are looking up
  prop.ui.scale=5; // pixels per meter

}

function km_to_m(kilometers) {
  return kilometers*1000;
}

function m_to_pixel(meters) {
  return meters*prop.ui.scale;
}

function km_to_pixel(kilometers) {
  return m_to_pixel(km_to_m(kilometers));
}

function ui_update() {
  var o=m_to_pixel(prop.craft.offset);
  var a=prop.craft.angle;
  prop.ui.pan[0]=m_to_pixel(prop.craft.pos[0]);//+sin(a)*o;
  prop.ui.pan[1]=m_to_pixel(prop.craft.pos[1]);//+cos(a)*o;
}
