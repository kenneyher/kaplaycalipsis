import kaplay from "kaplay";
import "kaplay/global";
import shadowTrail from "./shadowTrail";
import generatePlayer from "./player";
import { sufficientResources } from "./helpers";
import createBar from "./createBar";

kaplay({
  buttons: {
    up: {
      keyboard: ["w"],
    },
    down: {
      keyboard: ["s"],
    },
    left: {
      keyboard: ["a"],
    },
    right: {
      keyboard: ["d"],
    },
    special: {
      keyboard: ["q"],
    },
    special2: {
      keyboard: ["e"],
    },
  },
  background: [0, 0, 10],
  crisp: true,
});

loadRoot("./"); // A good idea for Itch.io publishing later
loadSprite("mark", "src/sprites/mark.png");
loadSprite("bean", "src/sprites/bean.png");
loadSprite("bag", "src/sprites/bag.png");
loadSprite("sword", "src/sprites/sword.png");
loadSprite("lightening", "src/sprites/lightening.png");
loadSprite("weight", "src/sprites/weight.png");
loadSprite("cloud", "src/sprites/cloud.png");
loadBitmapFont("happy", "src/sprites/happy-o.png", 36, 48);

const SCALE = (width() * 0.05) / 100;

scene("play", () => {
  const player = generatePlayer.bag({ SCALE });
  if (player.sprite == "mark") player.spawnHeldSword();

  const healthbar = createBar(
    player.health,
    GREEN,
    width()* 0.25,
    20,
    SCALE,
    vec2(25 * SCALE, 25 * SCALE)
  );
  const energyType =
    player.type == "hero"
      ? "heroism"
      : player.type == "arcanist"
      ? "mana"
      : "resistance";
  const energybar = createBar(
    player.maxEnergy,
    CYAN,
    healthbar.width,
    10,
    SCALE,
    vec2(25 * SCALE, 50 * SCALE)
  );

  add([
    rect(100, 100),
    color(RED),
    pos(randi(100, width() - 100), randi(100, height() - 100)),
    area(),
    "decoy",
  ]);

  player.animate(
    "scale",
    [
      player.scale,
      player.scale.add(0.05, 0.05),
      player.scale,
      player.scale.sub(0.05, 0.05),
      player.scale,
    ],
    {
      duration: 2,
      direction: "forward",
      easing: easings.linear,
    }
  );

  const DIRS = {
    up: vec2(0, -1),
    down: vec2(0, 1),
    left: vec2(-1, 0),
    right: vec2(1, 0),
  };
  for (const dir in DIRS) {
    onButtonDown(dir, () => {
      if (player.type == "protector") player.moving = true;
      player.move(DIRS[dir].scale(player.speed));
    });
    onButtonRelease(dir, () => {
      player.moving = false;
    });
  }

  onKeyPress("q", () => {
    if (!sufficientResources(player, player.specialCost)) {
      return;
    }
    player.activateSpecial();
  });
  onKeyPress("e", () => {
    if (!sufficientResources(player, player.ultimateCost)) {
      return;
    }
    player.activateUltimate();
  });

  onCollide("decoy", "bullet", (d, b) => {
    if (player.type == "hero") {
      player.heroism = Math.min(
        player.heroism + player.heroismPercentage * player.pd,
        player.maxEnergy
      );
    }
    b.destroy();
  });

  let cd = player.atkCD;
  onMouseDown(async () => {
    player.attack();
  });

  onUpdate("sword", (s) => {
    s.angle = mousePos().sub(player.pos).unit().angle() + 90;
  });

  player.onUpdate(() => {
    energybar.set(player[energyType]);
  });
});

go("play");
