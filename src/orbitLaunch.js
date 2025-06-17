function orbitAndLaunch(player, initialAngle, radius, duration = 1) {
  let angle = initialAngle; // in degrees
  let timer = 0;

  return {
    id: "orbitAndLaunch",
    require: ["pos", 'scale'],
    update() {
      timer += dt();
      angle += 180 * (dt()*3); 

      const rad = angle * (Math.PI / 180);
      const offset = vec2(Math.cos(rad), Math.sin(rad)).scale(radius*this.scale.x);
      this.pos = player.pos.add(offset).add(15 * this.scale.x, 15 * this.scale.x);
      this.angle += 360 * dt();

      if (timer >= duration) {
        // Launch in current direction
        const dir = offset.unit();
        this.use(move(dir, 800));
        this.unuse("orbitAndLaunch");
      }
    },
  };
}

export default orbitAndLaunch;