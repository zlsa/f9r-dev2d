
var Setting=function(options) {
  this.name=options.name[0];
  this.type=options.type;
  this.value=options.value;
  this.callback=options.callback;
  this.tooltip=options.name[1];

  this.clean=function() {
    return this.name.replace(" ","-").replace("%","");
  };

  if(this.clean() in localStorage && this.type != "button") {
    this.value=JSON.parse(localStorage[this.clean()]);
    this.callback();
  }

  this.html=$("<div id='"+this.clean()+"' class='setting type-"+this.type+"' title='"+this.tooltip+"'></div>");
  $("#settings").append(this.html);

  this.html.append("<span class='name'>"+this.name+"</span>");

  if(this.value) this.html.addClass("on");
  else this.html.removeClass("on");
  
  this.toggle=function() {
    this.value=!this.value;
    if(this.value) this.html.addClass("on");
    else this.html.removeClass("on");
    this.callback();
    this.save();
  };

  this.save=function() {
    localStorage[this.clean()]=JSON.stringify(this.value);
  };

  var that=this;
  if(this.type == "bool") {
    this.html.click(function() {
      that.toggle.call(that);
    });
  } else if(this.type == "button") {
    this.html.click(function() {
      that.callback.call(that);
      that.save();
    });
  }
 
};

function settings_init_pre() {
  prop.settings=[];
}

function settings_init() {
  setting_add(["reset","reset the simulation"],"button",null,function() {
    craft_reset();
  });
  setting_add(["f9r-dev1","three engines, 1/3 fuel"],"button",null,function() {
    craft_reset("f9r-dev1");
  });
  setting_add(["f9r-dev2","nine engines, full fuel"],"button",null,function() {
    craft_reset("f9r-dev2");
  });
  setting_add(["limit engine thrust to 70%","enable for realism"],"bool",true,function() {
    if(this.value) prop.craft.min_throttle=0.7;
    else prop.craft.min_throttle=0;
  });
//  setting_add(["allow two engines","allow two engine usage in addition to one and three engines"],"bool",false,function() {
//    if(this.value) prop.input.two=true;
//    else prop.input.two=false;
//  });
  setting_add(["sound effects","moo"],"bool",false,function() {
    if(this.value) prop.audio.enabled=true;
    else prop.audio.enabled=false;
  });
}

function setting_add(name,type,value,callback) {
  prop.settings.push(new Setting({
    name:name,
    type:type,
    value:value,
    callback:callback
  }));
}