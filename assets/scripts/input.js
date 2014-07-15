
function input_init_pre() {
  prop.input={};

  prop.input.button={
    none:0,
    left:1,
    middle:2,
    right:3
  };

  prop.input.two=false;

  prop.input.keys={};

  prop.input.keysym={
    shift:16,
    control:17,
    a:65,
    r:82,
    x:88,
    left:37,
    up:38,
    right:39,
    down:40,
    1: 49,
    2: 50,
    3: 51,
    9: 57,
  };
}

function input_done() {
  $(window).keydown(function(e) {
    prop.input.keys[e.which]=true;
  });

  $(window).keyup(function(e) {
    prop.input.keys[e.which]=false;
    console.log(e.which);
    input_keyup(e.which);
  });

}

function input_keyup(keycode) {
  if(keycode == prop.input.keysym["r"]) {
    prop.craft.reset();
  }
  if(keycode == prop.input.keysym["1"]) {
    prop.craft.engine_number=1;
  } else if(keycode == prop.input.keysym["2"]) {
    if(prop.input.two) prop.craft.engine_number=2;
  } else if(keycode == prop.input.keysym["3"]) {
    prop.craft.engine_number=3;
  } else if(keycode == prop.input.keysym["9"]) {
//    prop.craft.engine_number=9;
  }
}

function input_update_pre() {
  if(prop.input.keys[prop.input.keysym.up]) {
    prop.craft.throttle+=1*delta();
  } else if(prop.input.keys[prop.input.keysym.down]) {
    prop.craft.throttle-=1*delta();
  }
  if(prop.input.keys[prop.input.keysym.x]) {
    prop.craft.throttle=0;
  }
  if(prop.input.keys[prop.input.keysym.a]) {
    prop.craft.autopilot.enabled=true;
  } else {
    prop.craft.autopilot.disabled=true;
  }
  var t=2; // the number of seconds it takes to vector left to right
  t*=2;
  if(prop.input.keys[prop.input.keysym.left]) {
    prop.craft.thrust_vector-=t*delta();
  } else if(prop.input.keys[prop.input.keysym.right]) {
    prop.craft.thrust_vector+=t*delta();
  } else if(prop.craft.thrust_vector > 0.1){
    prop.craft.thrust_vector-=t*delta();
  } else if(prop.craft.thrust_vector < -0.1){
    prop.craft.thrust_vector+=t*delta();
  } else {
    prop.craft.thrust_vector=0;
  }
}
