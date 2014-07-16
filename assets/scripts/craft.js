
var Craft=function(options) {
  this.pos=[0,0];
  this.angle=0;

  this.scenario="f9r-dev1";

  this.scenarios={
    "f9r-dev1": {
      position: [0,0],
      velocity: [0,0],
      engine_number:3,
      max_engines: 3,
      angle: 0,
      angular_velocity: 0,
      fuel: 90000,
      gear_down:true,
      clamp:true
    },
    "f9r-dev2": {
      position: [0,0],
      velocity: [0,0],
      engine_number:9,
      max_engines: 9,
      angle: 0,
      angular_velocity: 0,
      fuel: 350000,
      gear_down:false,
      clamp:true
    },
    "f9-reentry": {
      position: [0,7000],
      velocity: [0,-300],
      engine_number:9,
      max_engines: 9,
      angle: 0,
      angular_velocity: 0,
      fuel: 30000,
      gear_down:false,
      clamp:false
    }
  };

  this.g_force=0;

  this.autopilot={
    enabled: false
  };

  this.clamped=false;
  
  this.reset=function(scenario) {
    if(!scenario) scenario=this.scenario;
    this.scenario=scenario;
    var s=this.scenarios[scenario];
    this.start=time()

    this.clamped=s.clamp;

    this.crashed=false;
    this.crash_time=null;

    this.mass=18000;
    this.mass=20000;
    this.fuel=s.fuel;

    if(s.gear_down) {
      this.gear_down=true;
      this.gear_animation=new Animation({
        value:1,
        start_value:1,
        end_value:0,
        duration:4
      });
    } else {
      this.gear_down=false;
      this.gear_animation=new Animation({
        value:0,
        start_value:0,
        end_value:1,
        duration:4
      });
    }
//    this.fuel=350000;

    this.throttle=0;

    this.engine_number=s.engine_number;
    this.max_engines=s.max_engines;

    this.rocket_body.position=[s.position[0],s.position[1]];
    this.rocket_body.velocity=[s.velocity[0],s.velocity[1]];
    this.rocket_body.angle=s.angle;
    this.rocket_body.angularVelocity=s.angular_velocity;

    this.offset=trange(0,this.fuel,this.full_fuel,this.mass_distribution[0],this.mass_distribution[1]);
    this.rocket_body.position[1]+=25-this.offset;
    this.rocket_body.shapeOffsets[0][0]=0;
    this.rocket_body.shapeOffsets[0][1]=0;
    this.rocket_body.shapeOffsets[1][0]=-6.5;
    this.rocket_body.shapeOffsets[2][0]=6.5;
    this.rocket_body.shapeOffsets[1][1]=this.leg_offset;
    this.rocket_body.shapeOffsets[2][1]=this.leg_offset;

    if(s.clamp) this.clamp();

    this.update();
  
  };

  this.full_fuel=350000;
  // kg of thrust
  this.thrust_peak=[6540,7160];

  // kg of fuel per second of a single engine at sea level and in a vacuum
  this.fuel_flow=[600,450];
  
  // max engine vector
  this.vector_max=radians(5);

  this.min_throttle=0.7;
  this.max_throttle=1.03;

  this.thrust=0;
  this.thrust_vector=0; // angle in radians

  this.engine_number=9;

  this.rocket_body=new p2.Body({
    position: [0,30],
    angle: 0.01,
    mass: 1
  });
  
  this.rocket_shape=new p2.Rectangle(3.66, 42);
  this.rocket_body.addShape(this.rocket_shape);

  this.mass_distribution=[-2,-20];

  this.leg_offset=-23;

  this.right_leg_shape=new p2.Rectangle(2, 0.5);
  this.left_leg_shape=new p2.Rectangle(2, 0.5);
  this.rocket_body.addShape(this.right_leg_shape,[-6.5,this.leg_offset]);
  this.rocket_body.addShape(this.left_leg_shape,[6.5,this.leg_offset]);

  this.rocket_body.updateBoundingRadius();

  this.gear_down=true;
  this.gear_animation=new Animation({
    value:1,
    start_value:1,
    end_value:0,
    duration:4
  });

  prop.physics.world.addBody(this.rocket_body);

  this.setGear=function(down) {
    this.gear_down=down;
    if(down) {
      this.left_leg_shape.sensor=false;
      this.right_leg_shape.sensor=false;
      this.gear_animation.set(1);
    } else {
      this.left_leg_shape.sensor=true;
      this.right_leg_shape.sensor=true;
      this.gear_animation.set(0);
    }
  };

  this.clamp=function() {
    this.rocket_body.position=[-prop.ground.clamp[0],prop.ground.clamp[1]+26-this.offset];
    this.rocket_body.mass=0;
  };

  this.unclamp=function() {
    this.clamped=false;
    this.rocket_body.position=[-prop.ground.clamp[0],prop.ground.clamp[1]+26-this.offset];
  };

  this.toggleGear=function() {
    this.setGear(!this.gear_down);
  };

  this.raiseGear=function() {
    this.setGear(false);
  };

  this.lowerGear=function() {
    this.setGear(true);
  };

  this.updateMass=function() {
    if(this.clamped) {
      return;
    }
    this.offset=trange(0,this.fuel,this.full_fuel,this.mass_distribution[0],this.mass_distribution[1]);
    this.rocket_body.mass=(this.mass+this.fuel)*0.01;
    this.rocket_body.shapeOffsets[0][1]=this.offset;
    if(this.gear_down) {
      this.rocket_body.shapeOffsets[1][0]=-6.5;
      this.rocket_body.shapeOffsets[2][0]=6.5;
      this.rocket_body.shapeOffsets[1][1]=this.leg_offset+this.offset;
      this.rocket_body.shapeOffsets[2][1]=this.leg_offset+this.offset;
      this.left_leg_shape.sensor=false;
      this.right_leg_shape.sensor=false;
    } else {
      this.rocket_body.shapeOffsets[1][0]=0;
      this.rocket_body.shapeOffsets[1][1]=0;
      this.rocket_body.shapeOffsets[2][0]=0;
      this.rocket_body.shapeOffsets[2][1]=0;
      this.left_leg_shape.sensor=true;
      this.right_leg_shape.sensor=true;
    }
    this.rocket_body.updateMassProperties();
    var d=0.05;
    if(this.gear_down) d=0.06;
    this.rocket_body.damping=crange(0,this.getAltitude(),100000,d,0.0);
    this.rocket_body.angular_damping=crange(0,this.getAltitude(),100000,d,0.0);
  };
  
  this.getAltitude=function() {
    return this.pos[1]-this.offset-8;
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
    if(this.throttle < 0.01) return;
    var single_engine_fuel_flow=trange(0,this.getAltitude(),100000,this.fuel_flow[0],this.fuel_flow[1]);
    var fuel_flow=single_engine_fuel_flow*crange(0,this.throttle,1,this.min_throttle,this.max_throttle)*this.engine_number*delta();
    this.fuel-=fuel_flow;
    this.fuel=Math.max(0,this.fuel);
  };

  this.updateThrust=function() {
    this.thrust_vector=clamp(-1,this.thrust_vector,1);
    if(this.crashed) this.throttle=0;
    var throttle=trange(0,this.throttle,1,this.min_throttle,this.max_throttle);
    if(this.throttle <= 0.01) throttle=0;
    var thrust=trange(0,this.getAltitude(),100000,this.thrust_peak[0],this.thrust_peak[1])*this.engine_number*throttle;
    if(this.fuel <= 0) thrust=0;
    var v=(this.thrust_vector*this.vector_max)+this.angle;
    var force=[-sin(v)*this.thrust,cos(v)*this.thrust];
    var point=[0,0];
    if(!this.clamped) {
      this.rocket_body.toWorldFrame(point,[0,-22]);
      this.rocket_body.applyForce(force,point);
    }
    var mix=0.7;
    this.thrust=thrust*(1-mix)+this.thrust*mix;
  };

  this.updateLocal=function() {
    this.pos=this.rocket_body.position;
    this.angle=normalizeAngle(this.rocket_body.angle);
    this.g_force=distance([0,0],this.rocket_body.force)*0.001;
  };

  this.updateCrash=function() {
    if(time()-this.start < 1) return; // do not crash in the first few seconds
    if(!this.crashed) {
      if(this.rocket_body.overlaps(prop.physics.ground_body)) { // touching ground
        if(!this.gear_down) this.crashed=true; // crash if gear up
        if(distance([0,0],this.rocket_body.velocity) > 1.5) {
          this.crashed=true;
        }
        var angle=normalizeAngle(this.rocket_body.angle+Math.PI);
        if(Math.abs(angle-Math.PI) > radians(4)) this.crashed=true;
      }
      if(this.crashed) {
        this.throttle=0;
        this.crash_time=time();
      }
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

function craft_init_pre() {
  prop.craft=new Craft();
}

function craft_update() {
  prop.craft.update();
}

function craft_reset(scenario) {
  prop.craft.reset(scenario);
}
