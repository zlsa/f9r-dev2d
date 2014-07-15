
var Pad=function(options) {
  this.x=0;
  this.width=0;
  this.height=1;
  this.material="concrete";

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

  prop.ground.pads=[];
}

function ground_init() {
  ground_add_pad({
    x:0,
    width:100,
    height: 1
  });

  ground_add_pad({
    x:200,
    width:200,
    height: 500,
    material:"asphalt"
  });

  ground_add_pad({
    x:-400,
    width:100,
    height: 1
  });

  ground_add_pad({
    x:400,
    width:30,
    height: 50
  });

  ground_add_pad({
    x:600,
    width:30,
    height: 1,
    material: "asphalt"
  });

}

function ground_add_pad(options) {
  prop.ground.pads.push(new Pad(options));
}
