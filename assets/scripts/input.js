
function input_init_pre() {
  prop.input={};

  prop.input.touch={
    enabled:false,
    start:[0,0],
    throttle:0,
    vector:0
  };

  prop.input.button={
    none:0,
    left:1,
    middle:2,
    right:3
  };

  prop.input.vector_flip=true;

  prop.input.two=false;

  prop.input.keys={};

  prop.input.keysym={
    shift:16,
    control:17,
    space:32,
    backspace: 8,
    a:65,
    b:66,
    c:67,
    d:68,
    g:71,
    h:72,
    i:73,
    j:74,
    k:75,
    l:76,
    m:77,
    n:78,
    o:79,
    p:80,
    q:81,
    r:82,
    s:83,
    t:84,
    x:88,
    y:89,
    z:90,
    left:37,
    up:38,
    right:39,
    down:40,
    1:49,
    2:50,
    3:51,
    9:57,
  };
}

function input_done() {
  $(window).keydown(function(e) {
//    console.log(e.which);
    prop.input.keys[e.which]=true;
    if(e.which == 8) {
      e.preventDefault();
      return false;
    }
  });

  $(window).keyup(function(e) {
    prop.input.keys[e.which]=false;
//    console.log(e.which);
    input_keyup(e.which);
//    e.preventDefault();
//    return false;
  });

  $(window).bind("touchstart",function(event) {
    var position=[event.originalEvent.targetTouches[0].pageX,event.originalEvent.targetTouches[0].pageY];

    prop.input.touch.enabled=true;
    prop.craft.hard_mode=false;

    $("html").addClass("touch-mode");

    prop.input.touch.start=position;
  });

  $(window).bind("touchmove",function(event) {
    var smallest=Math.min(prop.canvas.size.width,prop.canvas.size.height)*0.6;

    var position=[event.originalEvent.targetTouches[0].pageX,event.originalEvent.targetTouches[0].pageY];

    prop.input.touch.throttle=crange(0,prop.input.touch.start[1]-position[1],smallest,0,1);
    if(prop.input.touch.start[1]-position[1] > smallest/2 && prop.craft.clamped) prop.craft.unclamp();
    if(prop.input.touch.start[1]-position[1] < -smallest/2 && prop.craft.gear_animation.animating == false) prop.craft.toggleGear();

    prop.input.touch.vector=crange(-smallest/2,prop.canvas.size.width/2-position[0],smallest/2,1,-1);

    prop.craft.throttle=prop.input.touch.throttle;
    prop.craft.vector=prop.input.touch.vector;

    event.preventDefault();
    return false;
  });

  $(window).bind("touchend",function(event) {
    prop.input.touch.throttle=0;
    prop.input.touch.vector=0;

    prop.craft.throttle=prop.input.touch.throttle;
    prop.craft.vector=prop.input.touch.vector;

  });

}

function input_keyup(keycode) {
  if(keycode == prop.input.keysym.m) {
    prop.ui.minimap.show=!prop.ui.minimap.show;
  }

  if(keycode == prop.input.keysym["space"]) {
    prop.craft.unclamp();
  } else if(keycode == prop.input.keysym["p"]) {
    prop.paused = !prop.paused;
  } else if(keycode == prop.input.keysym["q"]) {
    prop.craft.rcs_enabled = !prop.craft.rcs_enabled;
  } else if(keycode == prop.input.keysym["r"]) {
    prop.craft.reset();
  } else if(keycode == prop.input.keysym["g"]) {
    prop.craft.toggleGear();
  } else if(keycode == prop.input.keysym["1"]) {
    prop.craft.engine_number=1;
  } else if(keycode == prop.input.keysym["2"]) {
    if(prop.input.two) prop.craft.engine_number=2;
  } else if(keycode == prop.input.keysym["3"]) {
    prop.craft.engine_number=3;
  } else if(keycode == prop.input.keysym["9"]) {
    if(prop.craft.max_engines == 9)
      prop.craft.engine_number=9;
  }
}

function input_update_pre() {

  if(prop.input.keys[prop.input.keysym.up]) {
    prop.craft.throttle+=1*delta();
  } else if(prop.input.keys[prop.input.keysym.down]) {
    prop.craft.throttle-=1*delta();
  }
  if(prop.input.keys[prop.input.keysym.shift]) {
    prop.craft.throttle+=1*delta();
  } else if(prop.input.keys[prop.input.keysym.control]) {
    prop.craft.throttle-=1*delta();
  }

  if(prop.input.keys[prop.input.keysym.x]) {
    prop.craft.throttle=0;
  }

  if(prop.input.keys[prop.input.keysym.z]) {
    prop.craft.throttle=1;
  }

  if(prop.input.keys[prop.input.keysym.j]) {
//    prop.craft.autopilot.enabled=true;
  } else {
//    prop.craft.autopilot.enabled=false;
  }

  var flip=1;
  if(prop.input.vector_flip) flip=-1;

  if(prop.input.keys[prop.input.keysym.left]) {
    prop.craft.vector = -1*flip;
  } else if(prop.input.keys[prop.input.keysym.right]) {
    prop.craft.vector = 1*flip;

  } else if(prop.input.keys[prop.input.keysym.d]) {
    prop.craft.vector = 1*flip;
  } else if(prop.input.keys[prop.input.keysym.a]) {
    prop.craft.vector = -1*flip;
  } else if(!prop.input.touch.enabled) {
    prop.craft.vector = 0;
  }
}
