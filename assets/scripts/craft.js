
var Craft=function(options) {
  this.pos=[0,0];
  this.angle=0;

  this.autopilot={
    enabled: false
  };

  this.reset=function() {
    this.crashed=false;

    this.mass=18000;
    this.fuel=130000;

    this.throttle=0;

    this.engine_number=3;

    this.rocket_body.position=[0,26.1];
    this.rocket_body.velocity=[0,0];
    this.rocket_body.angle=0;
    this.rocket_body.angularVelocity=0;

  };

  // kg of thrust
  this.thrust_peak=[65.40*0.4,71.60*0.4];

  // kg of fuel per second of a single engine at sea level and in a vacuum
  this.fuel_flow=[150*10,135*10];
  
  // max engine vector
  this.vector_max=radians(5);

  this.min_throttle=0.0;
  this.max_throttle=1.03;

  this.thrust=0;
  this.thrust_vector=0; // angle in radians

  this.engine_number=3;

  this.rocket_body=new p2.Body({
    position: [0,30],
    angle: 0.01,
    mass: 1
  });

//  this.rocket_body.damping=0.02;
//  this.rocket_body.fixedRotation=true;

  this.rocket_shape=new p2.Rectangle(3.66, 42);
  this.rocket_body.addShape(this.rocket_shape);

  this.legs_shape=new p2.Rectangle(15, 0.5);
  this.rocket_body.addShape(this.legs_shape,[0,-24]);

  this.gearDown=true;
//  this.setGear();

  prop.physics.world.addBody(this.rocket_body);

  this.setGear=function() {

  };

  this.updateMass=function() {
    this.rocket_body.mass=(this.mass+this.fuel)*0.01;
  };
  
  this.getAltitude=function() {
    return this.pos[1];
  };

  this.updateAutopilot=function() {
    return;
    if(!this.autopilot.enabled) return;
    this.engine_number=3;

    this.autopilot.target_altitude=1
    this.autopilot.target_vspeed=crange(-1,this.getAltitude()-this.autopilot.target_altitude,1,-0.5,0.5);

    this.throttle+=crange(-1,this.autopilot.target_vspeed,1,-1*delta(),1*delta());
  };

  this.updateFuel=function() {
    var single_engine_fuel_flow=trange(0,this.getAltitude(),100000,this.fuel_flow[0],this.fuel_flow[1]);
    var fuel_flow=single_engine_fuel_flow*this.throttle*this.engine_number*delta();
    this.fuel-=fuel_flow;
    this.fuel=Math.max(0,this.fuel);
  };

  this.updateThrust=function() {
    var throttle=trange(0,this.throttle,1,this.min_throttle,this.max_throttle);
    if(this.throttle <= 0.01) throttle=0;
    this.thrust=trange(0,this.getAltitude(),100000,this.thrust_peak[0],this.thrust_peak[1])*this.engine_number*throttle;
    if(this.fuel <= 0) this.thrust=0;
    var v=(this.thrust_vector*this.vector_max)+this.angle;
    var force=[-sin(v)*this.thrust,cos(v)*this.thrust];
    var point=[0,0];
    this.rocket_body.toWorldFrame(point,[0,-22]);
    this.rocket_body.applyForce(force,point);
  };

  this.updateLocal=function() {
    this.pos=this.rocket_body.position;
    this.angle=normalizeAngle(this.rocket_body.angle);
  };

  this.updateCrash=function() {
    if(this.rocket_body.overlaps(prop.physics.ground_body)) { // touching ground
      if(distance([0,0],this.rocket_body.velocity) > 6) {
        this.crashed=true;
      }
      var angle=normalizeAngle(this.rocket_body.angle+Math.PI);
      if(Math.abs(angle-Math.PI) > radians(10)) this.crashed=true;
    }
    if(this.crashed) {
      this.throttle=0;
    }
  }

  this.update=function() {
    this.throttle=clamp(0,this.throttle,1);
    this.updateCrash();
    this.updateAutopilot();
    this.updateFuel();
    this.updateMass();
    this.updateThrust();
    this.updateLocal();
  };

  this.reset();

};

function craft_init() {
  prop.craft=new Craft();
}

function craft_update() {
  prop.craft.update();
}

function craft_reset() {
  prop.craft.reset();
}
