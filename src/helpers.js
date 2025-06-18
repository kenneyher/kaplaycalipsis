function angleToVec(angleDegrees) {
  const angleRadians = angleDegrees * (Math.PI / 180);
  return vec2(Math.cos(angleRadians), Math.sin(angleRadians));
}

function sufficientResources(player, cost) {
  switch (player.type) {
    case 'hero':
      return player.heroism >= cost;
    case 'arcanist':
      return player.mana >= cost;
    case 'protector':
      return player.resistance >= cost;
  }
}

export { angleToVec , sufficientResources };