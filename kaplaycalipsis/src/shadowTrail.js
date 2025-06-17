function shadowTrail(delay = 0.05, colors = []) {
  let timer = 0;
  let cloneIndex = 0;

  const rainbowColors = [
    rgb(255, 111, 111),     // Red
    rgb(255, 111, 157), // Pink
    rgb(188, 121, 255),  // Purple
    rgb(155, 112, 255),    // Indigo
    rgb(127, 127, 255),     // Blue
    rgb(132, 188, 255), // Baby blue
    rgb(141, 255, 226), // Baby blue
    rgb(137, 255, 137),     // Green
    rgb(253, 255, 134),     // Green
    rgb(255, 182, 133),     // Green
  ];
  if (colors.length == 0) {
    colors = rainbowColors;
  }

  function getNextColor() {
    const color = colors[cloneIndex % colors.length];
    cloneIndex++;
    return color;
  }

  return {
    id: "shadowTrail",
    update() {
      timer += dt();

      if (timer >= delay) {
        timer = 0;

        const cloneColor = getNextColor();

        // Create shadow clone inline
        add([
          pos(this.pos),
          sprite(this.sprite),
          rotate(this.angle),
          scale(this.scale),
          anchor("center"),
          color(cloneColor.r, cloneColor.g, cloneColor.b),
          z(0),
          {
            id: "fadeAndDie",
            require: ["color"],
            add() {
              this._timer = 0;
            },
            update() {
              this._timer += dt();
              const t = this._timer / 0.5;
              this.opacity = 0.5 - t;
              if (t >= 1) destroy(this);
            },
          },
        ]);
      }
    },
  };
}

export default shadowTrail;
