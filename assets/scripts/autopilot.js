
var Autopilot = function(craft) {
  this.craft = craft;

  this.target_altitude = 1;

  this.sim = null;

  this.started = false;

  this.times = 0;

  this.start_time = 0;
  this.start_time_at = 0;

  this.reset = function() {
    this.times = 0;
    this.started = false;
    this.start_time = 0;
    this.start_time_at = 0;
    this.landed = false;
    this.down = false;
    
    this.pid = new PID(0.50, 0.3, 0);
  }

  this.get_suicide_alt = function(alt, vspeed, twr) {
    var step = 0.03;
    while(vspeed < 0) {
      vspeed += ((twr - 1) * 9.81) * step;
      alt += vspeed * step;
    }
    return alt;
  }

  this.run = function() {

    if(this.landed) {
      this.craft.throttle = 0;
      return;
    }

    if(this.times < 5) {
      this.times += 1;
      return
    }
    
    var twr = (this.craft.mass + this.craft.fuel) / this.craft.thrust_peak[0];
    var hit_time = Math.abs(this.craft.getAltitude() / this.craft.getVspeed());
    var suicide_time = Math.abs(this.craft.getVspeed() / ((twr - 1) * 9.81));
    
    var suicide_alt = this.get_suicide_alt(this.craft.getAltitude() - 0.2 - this.target_altitude, this.craft.getVspeed(), crange(0, 0.5, 1, 0.7, 1) * twr);

    if(suicide_alt < 0 && !this.started) {
      this.started = true;
      this.start_time = time();
      this.start_time_at = hit_time;
    }

    this.craft.throttle = 0;

    if(this.started && !this.landed) {
      hit_time = this.start_time_at - (time() - this.start_time);
      this.pid.target = 0;
      this.pid.input  = suicide_alt;
      this.pid.tick();
      
      this.craft.throttle = crange(-5, this.pid.get(), 5, 0.015, 1);
      //      this.craft.throttle = clamp(0.7, this.craft.throttle, 1);

      if(hit_time < 1 && !this.down) {
        this.craft.lowerGear();
        this.down = true;
      }
    }

    if(this.craft.getVspeed() > -0.5) {
      this.landed = true;
      this.craft.throttle = 0;
    }

    if(this.landed) this.craft.throttle = true;

  };

};
