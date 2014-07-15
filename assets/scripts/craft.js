
var Craft=function(options) {
  this.pos=[0,0];
  this.angle=0;

  this.mass=18000;
  this.fuel=80000;

  // kg of thrust
  this.thrust_peak=[65.40,71.60];

  // kg of fuel per second of a single engine at sea level and in a vacuum
  this.fuel_flow=[150,135];
  
  // max engine vector
  this.vector_max=radians(5);

  this.min_throttle=0.7;
  this.max_throttle=1.03;

  this.throttle=0;

  this.thrust=0;
  this.thrust_vector=0; // angle in radians

  this.engine_number=2;

  this.rocket_body=new p2.Body({
    position: [0,21.5],
    angle: 0.01,
    mass: 1
  });

//  this.rocket_body.damping=0.02;
//  this.rocket_body.fixedRotation=true;

  this.rocket_shape=new p2.Rectangle(3.66, 42);
  this.rocket_body.addShape(this.rocket_shape);

  prop.physics.world.addBody(this.rocket_body);

  this.updateMass=function() {
    this.rocket_body.mass=(this.mass+this.fuel)*0.01;
  };
  
  this.getAltitude=function() {
    return this.pos[1];
  };

  this.updateFuel=function() {
    var single_engine_fuel_flow=trange(0,this.getAltitude(),100000,this.fuel_flow[0],this.fuel_flow[1]);
    var fuel_flow=single_engine_fuel_flow*this.throttle*this.engine_number*delta();
    this.fuel-=fuel_flow;
  };

  this.updateThrust=function() {
    this.thrust=trange(0,this.getAltitude(),100000,this.thrust_peak[0],this.thrust_peak[1])*this.engine_number*this.throttle;
    var v=this.thrust_vector+this.angle;
    var force=[-sin(v)*this.thrust,cos(v)*this.thrust];
    var point=[0,0];
    this.rocket_body.toWorldFrame(point,[0,-22]);
    this.rocket_body.applyForce(force,point);
  };

  this.updateLocal=function() {
    this.pos=this.rocket_body.position;
    this.angle=normalizeAngle(this.rocket_body.angle);
  };

  this.update=function() {
    this.updateFuel();
    this.updateMass();
    this.updateThrust();
    this.updateLocal();
  };

};

function craft_init() {
  prop.craft=new Craft();
}

function craft_update_pre() {
  prop.craft.update();
}
