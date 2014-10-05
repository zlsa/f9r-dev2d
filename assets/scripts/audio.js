
function audio_load_file(name,url,callback) {
  var request=new XMLHttpRequest();
  request.open("GET",url,true);
  request.responseType="arraybuffer";

  request.onload=function() {
    prop.audio.context.decodeAudioData(request.response,function(buffer) {
      prop.audio.buffers[name]=buffer;
    },function() {
      console.log("Couldn't decode audio data!");
    });
  }
  request.send();
}

function audio_init_pre() {
  prop.audio={};
  prop.audio.context=null;
  
  prop.audio.enabled=false;
  prop.audio.focused=true;

  prop.audio.buffers={};
  prop.audio.gains={};
  prop.audio.sources=null;
}

function audio_init() {
  
  $(window).blur(function() {
    prop.audio.focused=false;
  });

  $(window).focus(function() {
    prop.audio.focused=true;
  });

  try {
    prop.audio.context=new AudioContext();
    audio_load_file("engine","assets/audio/engine.wav");
  }
  catch(e) {
    console.log("Web Audio API is not supported in this browser; no audio available");
  }
}

function audio_init_sources() {
  prop.audio.sources={};
  var source=prop.audio.context.createBufferSource();
  source.buffer=prop.audio.buffers.engine;

  var gain=prop.audio.context.createGain();
  gain.gain.value=0.0;
  source.connect(gain);
  gain.connect(prop.audio.context.destination);

  source.loop=true;
  source.start(0);
  prop.audio.gains.engine=gain;
  prop.audio.sources.engine=source;
}

function audio_real_update() {
  var v=1;
//  if(!(prop.audio.enabled && prop.audio.focused)) v=0;
  prop.audio.gains.engine.gain.value=crange(0,prop.craft.thrust,prop.craft.thrust_peak[1]*6,0,1)*v;

  prop.audio.sources.engine.playbackRate.value=crange(0,prop.craft.thrust,prop.craft.thrust_peak[1]*prop.craft.engine_number,0.2,1.3);
}


function audio_update() {
  if("engine" in prop.audio.buffers) {
    if(prop.audio.sources == null)
      audio_init_sources();
    audio_real_update();
  }
}
