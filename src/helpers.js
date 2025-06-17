function angleToVec(angleDegrees) {
  const angleRadians = angleDegrees * (Math.PI / 180);
  return vec2(Math.cos(angleRadians), Math.sin(angleRadians));
}

export { angleToVec };