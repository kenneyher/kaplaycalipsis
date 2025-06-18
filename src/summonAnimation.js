function summonAnimation() {
  let timer = 0;
  let floatOrigin = null;

  return {
    id: "summonAnimation",
    require: ["opacity", "pos"],
    add() {
      this.opacity = 0; // start invisible
      floatOrigin = this.pos.clone();
    },
    update() {
      timer += dt();

      // Fade-in: first 0.3 seconds
      if (timer < 0.3) {
        this.opacity = timer / 0.3;
      } else {
        this.opacity = 1;
      }

      // Floating: sine wave offset
      const floatOffset = Math.sin(timer * 4) * 2; // fast, small bob
      this.pos.y = floatOrigin.y + floatOffset;
    },
    stopSummonAnimation() {
      // Stop floating and reset y to base position
      if (floatOrigin) this.pos.y = floatOrigin.y;
      destroy(this); // remove this component
    },
  };
}

export default summonAnimation;
