function createBar(maxVal, clr, w = 100, h = 20, scale = (width()*0.05)/100, p) {
  const border = add([
    pos(p),
    rect(w*scale, h*scale, {
      fill: false
    }),
    z(999),
    outline(scale * 5, rgb(45, 25, 50)),
    fixed(),
  ]);
  const bar = add([
    rect(w*scale, h*scale),
    color(clr),
    fixed(),
    pos(p),
    z(998),
    {
      maxWidth: w*scale,
      max: maxVal,
      set(newVal) {
        this.width = this.maxWidth * newVal / this.max;
      },
    }
  ]);

  return bar;
}

export default createBar;