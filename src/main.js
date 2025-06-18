import kaplay from "kaplay";
import "kaplay/global";
import shadowTrail from "./shadowTrail";
import generatePlayer from "./player";

kaplay({
  buttons: {
    "up": {
      keyboard: ['w']
    },
    "down": 
    {
      keyboard: ['s']
    },
    "left":
    {
      keyboard: ['a']
    },
    "right":
    {
      keyboard: ['d']
    },
    "special":
    {
      keyboard: ['q']
    },
    "special2":
    {
      keyboard: ['e']
    }
  },
  background: [0, 0, 10],
  crisp: true,
});

loadRoot("./"); // A good idea for Itch.io publishing later
loadSprite("mark", "src/sprites/mark.png");
loadSprite("bean", "src/sprites/bean.png");
loadSprite("sword", "src/sprites/sword.png");
loadSprite("lightening", "src/sprites/lightening.png");
loadSprite("cloud", "src/sprites/cloud.png");
loadBitmapFont("happy", "src/sprites/happy-o.png", 36, 48);

const SCALE = (width() * 0.05) / 100;

scene("play", () => {
  const player = generatePlayer.bean({ SCALE });
  if (player.sprite == 'mark') player.spawnHeldSword();

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
      player.move(DIRS[dir].scale(player.speed));
    });
  }

  onKeyPress('q', () => {
    player.activateSpecial();
  })
  onKeyPress('e', () => {
    player.activateUltimate()
  })

  let cd = player.atkCD;
  onMouseDown(async () => {
    player.attack();
  });

  onUpdate("sword", (s) => {
    s.angle = mousePos().sub(player.pos).unit().angle() + 90;
  });
});

go("play");
