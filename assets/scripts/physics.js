
function physics_init_pre() {
  prop.physics={};

  prop.physics.world=new p2.World({
    gravity:[0, -9.82]
  });

  prop.physics.ground_body=new p2.Body({ mass: 0 });
  prop.physics.ground_shape=new p2.Plane();
  prop.physics.ground_body.addShape(prop.physics.ground_shape);

  prop.physics.world.addBody(prop.physics.ground_body);

}

function physics_init() {

  prop.physics.world.setGlobalEquationParameters(1,10000);
}

function physics_update() {
  prop.physics.world.step(delta(), 0, 50);
//  prop.physics.world.step(delta(), 0, 50);
//  prop.physics.world.step(delta(), 0, 50);
//  prop.physics.world.step(delta() * 3);
}
