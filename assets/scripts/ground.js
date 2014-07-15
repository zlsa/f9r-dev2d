
var Pad=function(options) {
  this.name=null;
  this.x=0;
  this.width=0;
  this.height=1;
  this.material="concrete";

  if("name" in options) this.name=options.name;
  if("x" in options) this.x=options.x;
  if("width" in options) this.width=options.width;
  if("height" in options) this.height=options.height;
  if("material" in options) this.material=options.material;

  if(this.height > 0.01) {
    this.shape=new p2.Rectangle(this.width,this.height*2);

    prop.physics.ground_body.addShape(this.shape,[-this.x,0]);
  }

};

function ground_init_pre() {
  prop.ground={};

  prop.ground.clamp=[-30,0.5];

  prop.ground.pads=[];
}

function ground_init() {

  prop.ground.clamp_height=3;

  prop.ground.clamp_shape=new p2.Rectangle(4,prop.ground.clamp_height);

  prop.physics.ground_body.addShape(prop.ground.clamp_shape,[-prop.ground.clamp[0],prop.ground.clamp_height]);

  ground_add_pad({
    x:-400,
    width:100,
    height: 1,
    name:"the witch of the west lives here"
  });


  ground_add_pad({
    x:-300,
    width:30,
    height: 2,
    name:"moo, i'm a cow",
    material:"asphalt"
  });

  ground_add_pad({
    x:0,
    width:100,
    height: 1,
    name:"start"
  });

  ground_add_pad({
    x:200,
    width:200,
    height: 5,
    material:"asphalt",
    name:"hop 1"
  });

  ground_add_pad({
    x:400,
    width:30,
    height: 50,
    name:"precision landings"
  });

  ground_add_pad({
    x:600,
    width:30,
    height: 1,
    material: "asphalt",
    name:"long-distance"
  });

}

function ground_add_pad(options) {
  prop.ground.pads.push(new Pad(options));
}
