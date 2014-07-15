
function canvas_init_pre() {
  prop.canvas={};

  prop.canvas.contexts={};

  // resize canvas to fit window?
  prop.canvas.resize=true;
  prop.canvas.size={ // all canvases are the same size
    height:480,
    width:640
  };
}

function canvas_init() {
  canvas_add("background");
  canvas_add("ground");
  canvas_add("craft");
}

function canvas_resize() {
  if(prop.canvas.resize) {
    prop.canvas.size.width=$(window).width();
    prop.canvas.size.height=$(window).height();
  }
  for(var i in prop.canvas.contexts) {
    prop.canvas.contexts[i].canvas.height=prop.canvas.size.height;
    prop.canvas.contexts[i].canvas.width=prop.canvas.size.width;
  }
}

function canvas_add(name) {
  $("#canvases").append("<canvas id='"+name+"-canvas'></canvas>");
  prop.canvas.contexts[name]=$("#"+name+"-canvas").get(0).getContext("2d");
}

function canvas_get(name) {
  return(prop.canvas.contexts[name]);
}

function canvas_clear(cc) {
  cc.clearRect(0,0,prop.canvas.size.width,prop.canvas.size.height);
}

// DRAW

// background

function canvas_draw_background(cc) {
  var gradient=cc.createLinearGradient(0,-km_to_pixel(10)+prop.ui.pan[1],0,prop.ui.pan[1]);
  gradient.addColorStop(0,"#000");
  gradient.addColorStop(0.96,"#3288C9");
  gradient.addColorStop(0.99,"#def");
  gradient.addColorStop(1,"#eef");
  cc.fillStyle=gradient;
  cc.fillRect(0,0,prop.canvas.size.width,prop.canvas.size.height);
}

// ground

function canvas_draw_ground(cc) {
  cc.fillStyle="#2CBC64";
  cc.fillRect(0,prop.canvas.size.height/2+prop.ui.pan[1],
              prop.canvas.size.width,m_to_pixel(3));

  cc.fillStyle="#663322";
  cc.fillRect(0,Math.max(prop.canvas.size.height/2+m_to_pixel(3)+prop.ui.pan[1],0),
              prop.canvas.size.width,prop.canvas.size.height);

  for(var i=prop.ui.pan[0]-m_to_pixel(20);i<prop.canvas.size.width+m_to_pixel(20);i+=m_to_pixel(5)) {
    cc.fillRect(i,Math.max(prop.canvas.size.height/2+m_to_pixel(2)+prop.ui.pan[1],0),
                m_to_pixel(2),m_to_pixel(2));
  }

}

// craft

function canvas_draw_craft(cc) {
  cc.fillStyle="#fff";
  cc.strokeStyle="#222";

  var w=m_to_pixel(3.66);
  var h=m_to_pixel(42);

  var nosecone_height=m_to_pixel(0.8);

  cc.translate(prop.canvas.size.width/2,prop.canvas.size.height/2);
//  cc.translate(m_to_pixel(prop.craft.pos[0]),-m_to_pixel(prop.craft.pos[1]));
  cc.rotate(prop.craft.angle);
//  cc.translate(-prop.ui.pan[0],prop.ui.pan[1]);

  cc.beginPath();
  cc.moveTo(0,    -h/2);
  cc.lineTo(w/2,  -h/2+nosecone_height);
  cc.lineTo(w/2,   h/2);
  cc.lineTo(-w/2,  h/2);
  cc.lineTo(-w/2, -h/2+nosecone_height);
  cc.lineTo(0,    -h/2);
  cc.fill();

  cc.fillStyle="#ddd";

  var s=w/2/3;

  cc.beginPath();
  cc.moveTo(0,   -h/2);
  cc.lineTo(w/2, -h/2+nosecone_height);
  cc.lineTo(w/2,  h/2);
  cc.lineTo(s,    h/2);
  cc.lineTo(s,   -h/2+nosecone_height);
  cc.lineTo(0,   -h/2);
  cc.fill();

  cc.beginPath();
  cc.moveTo(0,    -h/2);
  cc.lineTo(w/2,  -h/2+nosecone_height);
  cc.lineTo(w/2,   h/2);
  cc.lineTo(-w/2,  h/2);
  cc.lineTo(-w/2, -h/2+nosecone_height);
  cc.lineTo(0,    -h/2);
  cc.stroke();
}

function canvas_update_post() {
  var cc=canvas_get("background");
  cc.save();
  canvas_clear(cc);
  canvas_draw_background(cc);
  cc.restore();

  var cc=canvas_get("ground");
  cc.save();
  canvas_clear(cc);
  canvas_draw_ground(cc);
  cc.restore();

  var cc=canvas_get("craft");
  cc.save();
  canvas_clear(cc);
  canvas_draw_craft(cc);
  cc.restore();
}
