
var Craft=function(options) {
  this.pos=[0,0];
  this.angle=0;

  this.landed=false;

  this.mission_start=0;
  this.mission_end=0;
  this.mission_elapsed=0;
  this.mission=false;

  this.model="f9r-dev";

  this.leg_max_mass=80000; // almost a fully fueled dev-1

  this.scenario="f9r-dev1";

  this.crash_velocity=2;
  this.crash_angle=radians(5);

  this.hard_mode=false;

  this.scenarios={
    "f9r-dev1": {
      position: [0,0],
      velocity: [0,0],
      ballast:20000,
      engine_number:3,
      max_engines: 3,
      angle: 0,
      angular_velocity: 0,
      rcs_fuel:0,
      fuel: 55000,
      gear_down:false,
      clamp:true,
      model:"f9r-dev"
    },
    "f9r-dev2": {
      position: [0,0],
      velocity: [0,0],
      engine_number:9,
      ballast:10000,
      max_engines: 9,
      angle: 0,
      angular_velocity: 0,
      rcs_fuel:1000,
      fuel: 350000,
      gear_down:false,
      clamp:true,
      model:"f9r-dev-high"
    },
    "f9r-rtls": {
      position: [-1000,10000],
      velocity: [25,-300],
      engine_number: 1,
      ballast: 0,
      max_engines: 1,
      angle: radians(7),
      angular_velocity: radians(-0.3),
      rcs_fuel:300,
      fuel: 6000,
      gear_down:false,
      clamp:false,
      model:"f9r"
    },
    "f9r-boostback": {
      position: [-120000,80000],
      velocity: [-1800,400],
      engine_number: 3,
      ballast: 0,
      max_engines: 3,
      angle: radians(70),
      angular_velocity: radians(0.1),
      rcs_fuel:1000,
      fuel: 35000,
      gear_down:false,
      clamp:false,
      model:"f9r"
    }
  };

  this.g_force=0;

  this.autopilot={
    enabled: false
  };

  this.rcs_enabled=false;
  this.rcs_force=0;
  this.rcs_fuel=1000;
  this.rcs_full_fuel=1000;

  this.clamped=false;
  
  this.reset=function(scenario) {
    if(!scenario) scenario=this.scenario;
    this.scenario=scenario;
    var s=this.scenarios[scenario];
    this.start=time()

    this.clamped=s.clamp;

    this.crashed=false;
    this.crash_time=null;

    this.mass=16000;
    this.mass+=s.ballast; // ballast
    this.fuel=s.fuel;
    this.rcs_fuel=s.rcs_fuel;

    this.model=s.model;

    this.mission_start=0;
    this.mission_end=0;
    this.mission_elapsed=0;
    this.mission=false;

    this.rcs_enabled=false;
    this.rcs_fuel=1000;

    this.thrust=0;

    if(s.gear_down) {
      this.gear_down=true;
      this.gear_animation=new Animation({
        value:1,
        start_value:1,
        end_value:0,
        duration:6
      });
    } else {
      this.gear_down=false;
      this.gear_animation=new Animation({
        value:0,
        start_value:0,
        end_value:1,
        duration:6
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

    this.rocket_body.position[1]+=25;//-this.offset;
    this.updateOffset();
    
    if(s.clamp) this.clamp();

    if(!s.clamp) this.startMission();

    this.update();
  
  };

  this.full_fuel=350000;
  // kg of thrust
  this.thrust_peak=[6340,7160];

  // kg of fuel per second of a single engine at sea level and in a vacuum
  this.fuel_flow=[210,240];
  
  // max engine vector
  this.vector_max=radians(5);

  this.min_throttle=0.7;
  this.max_throttle=1.03;

  this.thrust=0;
  this.vector=0;
  this.thrust_vector=0; // angle in radians

  this.engine_number=9;

  this.rocket_body=new p2.Body({
    position: [0,30],
    angle: 0.01,
    mass: 1
  });
  
  this.rocket_shape=new p2.Rectangle(3.66, 42);
  this.rocket_body.addShape(this.rocket_shape);

  this.mass_distribution=[2,20];

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
    duration:6
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
    if(!this.clamped) return;
    this.startMission();
    this.clamped=false;
    this.rocket_body.position=[-prop.ground.clamp[0],prop.ground.clamp[1]+26-this.offset];
  };

  this.startMission=function() {
    if(this.mission == true) return;
    this.mission=true;
    this.mission_start=time();
  };

  this.stopMission=function() {
    if(this.mission == false) return;
    this.mission=false;
    this.mission_elapsed+=time()-this.mission_start;
    this.mission_start=0;
  };

  this.getMissionTime=function() {
    if(!this.mission) return this.mission_elapsed;
    return this.mission_elapsed+(time()-this.mission_start);
  };

  this.toggleGear=function() {
    if(this.crashed || this.landed) return;
    this.setGear(!this.gear_down);
  };

  this.raiseGear=function() {
    if(this.crashed || this.landed) return;
    this.setGear(false);
  };

  this.lowerGear=function() {
    if(this.crashed || this.landed) return;
    this.setGear(true);
  };

  this.updateOffset=function() {
    this.offset=trange(0,this.fuel,this.full_fuel,this.mass_distribution[0],this.mass_distribution[1]);
    this.rocket_body.shapeOffsets[0][0]=0;
    this.rocket_body.shapeOffsets[0][1]=this.offset;
    this.rocket_body.shapeOffsets[1][0]=-6.5;
    this.rocket_body.shapeOffsets[2][0]=6.5;
    this.rocket_body.shapeOffsets[1][1]=this.offset+this.leg_offset;
    this.rocket_body.shapeOffsets[2][1]=this.offset+this.leg_offset;
  };

  this.updateMass=function() {
    if(this.clamped) {
      this.rocket_body.position=[-prop.ground.clamp[0],prop.ground.clamp[1]+26-this.offset];
      this.rocket_body.mass=0;
      return;
    }
    this.rocket_body.mass=(this.mass+this.fuel)*0.01;
    this.updateOffset();
    if(this.gear_down) {
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
//    if(this.gear_down) d=0.06;
    this.rocket_body.damping=crange(0,this.getAltitude(),120000,d,0.0);
    var speed=distance([0,0],this.rocket_body.velocity);
    this.rocket_body.angularDamping=crange(0,this.getAltitude(),120000,d,0.01);
  };
  
  this.getAltitude=function() {
    return this.pos[1]+this.offset-22;
  };

  this.getVspeed=function() {
    return this.rocket_body.velocity[1];
  };

  this.updateAutopilot=function() {
    if(!this.autopilot.enabled) return;
    this.engine_number=crange(this.mass,this.rocket_body.mass,this.mass+this.full_fuel/2,1,9);
    if(this.engine_number < 0.5) this.engine_number=1;
    else if(this.engine_number > 6) this.engine_number=3;
    else this.engine_number=9;
    this.engine_number=1;

    if(!this.gear_down)
      this.lowerGear();

    this.autopilot.target_altitude=-5;
    this.autopilot.target_vspeed=trange(140,this.getAltitude()-this.autopilot.target_altitude,-140,-100,100);

    this.autopilot.target_angle=-crange(-1,this.rocket_body.velocity[0],1,-radians(50),radians(50));

    this.throttle=trange(0,this.autopilot.target_vspeed-this.getVspeed(),10,0,1);
    this.throttle=clamp(0.2,this.throttle,1);
    var lookahead=crange(0,Math.abs(this.rocket_body.angularVelocity),Math.PI,2,100);
    this.vector=(mod((((this.angle-Math.PI)-this.autopilot.target_angle)+(this.rocket_body.angularVelocity*lookahead)),Math.PI*2)-Math.PI)*100;
  };

  this.updateFuel=function() {
    this.rcs_fuel-=Math.abs(this.rcs_force)*delta()*(1000/50); // about 50 second RCS time
    if(this.rcs_fuel < 0) this.rcs_fuel=0;

    if(this.throttle < 0.01) return;
    var single_engine_fuel_flow=trange(0,this.getAltitude(),100000,this.fuel_flow[0],this.fuel_flow[1]);
    var fuel_flow=single_engine_fuel_flow*crange(0,this.throttle,1,this.min_throttle,this.max_throttle)*this.engine_number*delta();
    this.fuel-=fuel_flow;
    this.fuel=Math.max(0,this.fuel);
  };

  this.updateThrust=function() {
    // MAIN ENGINES
    this.engine_number=clamp(1,this.engine_number,this.max_engines);
    
    // VECTOR
    this.vector=clamp(-1,this.vector,1);

    // to fix GUI
    if(this.crashed) this.throttle=0;
    var throttle=trange(0,this.throttle,1,this.min_throttle,this.max_throttle);
    if(this.throttle <= 0.01) throttle=0;
    var thrust=trange(0,this.getAltitude(),100000,this.thrust_peak[0],this.thrust_peak[1])*this.engine_number*throttle;
    if(this.crashed) {
      this.thrust=0;
      thrust=0;
    }
    if(this.fuel <= 0) thrust=0;
    var v=(this.thrust_vector*this.vector_max)+this.angle;
    var force=[-sin(v)*this.thrust,cos(v)*this.thrust];
    var point=[0,0];
    if(!this.clamped) {
      this.rocket_body.toWorldFrame(point,[0,-22]);
      this.rocket_body.applyForce(force,point);
    }
    var mix=0.6;
    this.thrust=thrust*(1-mix)+this.thrust*mix;
    mix=0.2;
    this.thrust_vector=this.vector*(1-mix)+this.thrust_vector*mix;

    // RCS
    
    if(!this.rcs_enabled) {
      this.rcs_force=0;
      return;
    }
    if(this.crashed || this.rcs_fuel <= 0 || this.clamped) {
      this.rcs_force=0;
      return;
    }

    this.rcs_force=this.vector;
    this.rocket_body.angularForce=-this.rcs_force*3000;
  };

  this.updateLocal=function() {
    this.pos=this.rocket_body.position;
    this.angle=normalizeAngle(this.rocket_body.angle);
    this.g_force=distance([0,0],this.rocket_body.force)*0.001;
  };

  this.updateCrash=function() {
    if(time()-this.start < 1) return; // do not crash in the first few seconds
    if(!this.crashed) {
      this.landed=false;
      if(this.rocket_body.overlaps(prop.physics.ground_body)) { // touching ground
        this.landed=true;
        if(this.rocket_body.mass*100 > this.leg_max_mass && this.hard_mode) this.crashed=true; // too much weight on legs
        if(!this.gear_down) this.crashed=true; // crash if gear up
        if(distance([0,0], this.rocket_body.velocity) > this.crash_velocity) {
          this.crashed=true;
        }
        var angle=normalizeAngle(this.rocket_body.angle+Math.PI);
        if(Math.abs(angle-Math.PI) > this.crash_angle) this.crashed=true;
      }
      if(this.crashed) {
        this.throttle=0;
        this.crash_time=time();
      }
    }
  }

  this.update=function() {
    if(this.hard_mode) {
      this.min_throttle=0.6;
      this.vector_max=radians(0.5);
      this.crash_velocity=6.0;
      this.crash_angle=radians(5);
    } else {
      this.min_throttle=0;
      this.vector_max=radians(1.2);
      this.crash_velocity=12.0;
      this.crash_angle=radians(10);
    }
    this.throttle=clamp(0,this.throttle,1);
    this.updateCrash();
    this.updateAutopilot();
    this.updateFuel();
    this.updateMass();
    this.updateThrust();
    this.updateLocal();

    if(this.landed || this.crashed || this.clamped) this.stopMission();
    else if(!this.landed && !this.crashed && !this.clamped) this.startMission();

//    var direction=-mod((Math.atan2(this.rocket_body.velocity[0],this.rocket_body.velocity[1])+Math.PI),Math.PI);
//    this.rocket_body.angularForce+=(direction)*100*Math.abs(distance([0,0],this.rocket_body.velocity));
  };

  this.reset();

};

function craft_init() {
  prop.craft=new Craft();
}

function craft_update() {
  prop.craft.update();
  $("#touch-buttons div").removeClass("active");
  if(prop.craft.engine_number == 1) $("#1-engine").addClass("active");
  if(prop.craft.engine_number == 3) $("#3-engine").addClass("active");
  if(prop.craft.engine_number == 9) $("#9-engine").addClass("active");
}

function craft_reset(scenario) {
  prop.craft.reset(scenario);
}
