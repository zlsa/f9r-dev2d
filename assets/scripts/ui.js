
function ui_init_pre() {
  prop.ui={};
  
  prop.ui.minimap={};

  prop.ui.minimap.enabled=true;
  prop.ui.minimap.show=true;
  prop.ui.minimap.size_factor=0.05;
  prop.ui.minimap.scale=0.5;
  prop.ui.minimap.width=300;
  prop.ui.minimap.height=200;

  prop.ui.pan=[0,0]; // pan in pixels
  // if pan is [100,0] you are looking to the right
  // if [0,100] you are looking up
  prop.ui.scale=5; // pixels per meter

}

function ui_init() {
  $("#help-backdrop").click(function() {
    ui_help_hide();
  });
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
  prop.ui.minimap.height=prop.canvas.size.height;
  prop.ui.minimap.width=prop.canvas.size.width;
  prop.ui.minimap.scale=prop.ui.scale*prop.ui.minimap.size_factor;
  prop.ui.pan[0]=m_to_pixel(prop.craft.pos[0]);
  prop.ui.pan[1]=m_to_pixel(prop.craft.pos[1]);

  if(prop.canvas.size.width < 700) $("html").addClass("touch-mode");

}

function ui_help() {
  $("#help-backdrop").fadeIn(200);
  $("#help").fadeIn(200);
}

function ui_help_hide() {
  $("#help-backdrop").fadeOut(200);
  $("#help").fadeOut(200);
}
