
var Pad=function(options) {
  this.x=0;
  this.width=0;
  this.height=1;
  this.material="concrete";

  if("x" in options) this.x=options.x;
  if("width" in options) this.width=options.width;
  if("material" in options) this.material=options.material;

  if(this.height > 0.01) {
    this.shape=new p2.Rectangle(this.width,this.height*2);

    prop.physics.ground_body.addShape(this.shape,[this.x,0]);
  }
};

function ground_init_pre() {
  prop.ground={};

  prop.ground.pads=[];
}

function ground_init() {
  ground_add_pad({
    x:0,
    width:100
  });

  ground_add_pad({
    x:300,
    width:200,
    material:"asphalt"
  });
}

function ground_add_pad(options) {
  prop.ground.pads.push(new Pad(options));
}
