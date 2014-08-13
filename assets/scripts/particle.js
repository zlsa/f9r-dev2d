
var Particles=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.number    = options.number || 50;
      this.lifetime  = options.lifetime || 3;
      this.damping   = options.damping || 0.8;
      this.random    = options.random || 0.0;

      this.particles = [];

      this.emitter          = [0, 0];
      this.emitter_velocity = [0, 0];
      this.amount           = 1;

      this.createParticles();
    },
    createParticles: function() {
      for(var i=0;i<this.number;i++) {
        this.particles.push([[0, 0], [0, 0], -1, 3, 0]);
      }
    },
    tick: function() {
      for(var i=0;i<this.particles.length;i++) {
        var particle=this.particles[i];
        if(time() - particle[2] >= particle[3] || particle[2] <= 0) {
          // is dead
//          var chance=Math.random() * this.amount;
          var chance=1;
          if(chance > delta()) {
            particle[0][0] = this.emitter[0];
            particle[0][1] = this.emitter[1];
            particle[1][0] = (((Math.random() * 2) - 1) * this.random) + this.emitter_velocity[0];
            particle[1][1] = (((Math.random() * 2) - 1) * this.random) + this.emitter_velocity[1];
            particle[2] = time();
            particle[3] = crange(0, Math.random(), 1, this.lifetime*0.5, this.lifetime);
            particle[4] = clamp(0, this.amount, 1);
          } else {
            particle[2] = -1;
          }
        }
        if(particle[2] <= 0) continue;
        particle[1][0] *= crange(0, delta(), 1, 1, this.damping);
        particle[1][1] *= crange(0, delta(), 1, 1, this.damping);

        particle[0][0] += particle[1][0] * delta();
        particle[0][1] += particle[1][1] * delta();
      }
    }
  };
});
