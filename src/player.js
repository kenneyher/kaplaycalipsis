import { angleToVec } from "./helpers";
import shadowTrail from "./shadowTrail";
import orbitAndLaunch from "./orbitLaunch";
import summonAnimation from "./summonAnimation";

const generatePlayer = {
  mark: function (opts = { SCALE: (width() * 0.05) / 100 }) {
    return add([
      sprite("mark"),
      pos(center()),
      anchor("center"),
      scale(opts.SCALE),
      area(),
      body(),
      animate(),
      "player",
      {
        speed: 200,
        xDir: 1,
        yDir: 1,
        cd: 0.7,
        atkCD: 0.7,
        atkSprite: "sword",
        activePassive: false,
        passive: "enhance-atk",
        heldSword: null,
        lastHitTime: time(), // store current game time
        spawnHeldSword: function () {
          let dir = mousePos().sub(this.pos).unit().angle() + 90;
          this.heldSword = this.add([
            pos(0, 10),
            anchor("center"),
            sprite("sword"),
            rotate(dir),
            z(1),
            "sword",
          ]);
        },
        update() {
          // Check if enough time passed since last hit
          if (!this.activePassive && time() - this.lastHitTime >= 10) {
            this.activePassive = true;
            // Optional: visual/sound feedback
            debug.log("Passive activated!");
          }
        },
        createSword: function (direction, xcomps = []) {
          const comps = [
            pos(this.pos),
            sprite(this.atkSprite),
            area(),
            scale(opts.SCALE),
            anchor("center"),
            move(direction, 800),
            rotate(direction.angle() + 90),
            offscreen({ destroy: true }),
            z(1),
          ];
          if (this.activePassive) comps.push(shadowTrail());
          if (xcomps.length > 0) comps.push(...xcomps);
          add([...comps, "bullet"]);
        },
        attack: async function () {
          // Get direction vector from player to mouse
          const direction = mousePos().sub(this.pos).unit(); // Normalize to get direction

          this.cd += dt();

          if (this.cd >= this.atkCD) {
            this.heldSword.destroy();
            this.heldSword = null;
            this.cd = 0;
            this.createSword(direction);
            await wait(0.3, this.spawnHeldSword);
          }
        },
        activateSpecial: function () {
          const angles = [...Array(12).keys()].map((i) => i * 30); // [0, 30, ..., 330]
          const swords = [];
          let index = 0;

          function summonNextSword() {
            const player = get("player")[0];
            if (index >= angles.length) {
              // After all swords are summoned, launch them after a short delay
              wait(0.25, () => {
                swords.forEach((sword, i) => {
                  const dir = sword.dir;
                  sword.use(move(dir, 400));

                  if (sword.has("summonAnimation")) {
                    sword.unuse("summonAnimation");
                  }
                });
              });
              return;
            }

            const angle = angles[index];
            const dir = angleToVec(angle);
            const posOffset = dir
              .scale(100 * opts.SCALE)
              .add(25 * opts.SCALE, 20 * opts.SCALE); // small radius around player

            const sword = add([
              pos(player.pos.add(posOffset)),
              sprite(player.atkSprite),
              rotate(angle + 90),
              scale(opts.SCALE),
              area(),
              opacity(0),
              summonAnimation(),
              offscreen({ destroy: true }),
              "bullet",
              {
                dir,
              },
            ]);

            swords.push(sword);
            index++;

            // Wait and summon next
            wait(0.1, summonNextSword);
          }
          summonNextSword();
        },
        activateUltimate: function () {
          const player = get("player")[0];
          const radius = 100 * opts.SCALE;
          const baseScale = opts.SCALE * 1.5;

          [45, 225].map((initialAngle) => {
            return add([
              pos(player.pos.add(10, 10)),
              sprite(this.atkSprite),
              rotate(initialAngle + 90),
              scale(baseScale),
              anchor("center"),
              shadowTrail(0.05, [
                rgb(255, 93, 123),
                rgb(255, 112, 222),
                rgb(255, 77, 77),
                rgb(255, 110, 73),
              ]),
              area(),
              opacity(1),
              offscreen({ destroy: true }),
              orbitAndLaunch(player, initialAngle, radius, 2),
              "bullet",
            ]);
          });
        },
      },
    ]);
  },
  bean: function (opts = { SCALE: (width() * 0.05) / 100 }) {
    return add([
      sprite("bean"),
      pos(center()),
      scale(opts.SCALE),
      anchor("center"),
      area(),
      body(),
      animate(),
      "player",
      {
        speed: 300,
        xDir: 1,
        yDir: 1,
        cd: 0.25,
        atkCD: 0.25,
        atkSprite: "lightening",
        passive: "lightning-chain",
        activePassive: false,
        passiveCD: 10,
        lastPassiveTime: -9999,
        activatePassive: async function () {
          this.activePassive = true;

          const orbiters = [];
          const angles = [0, 120, 240];
          const radius = 80;

          angles.map(async (a) =>
            orbiters.push(
              add([
                pos(this.pos),
                sprite("lightening"),
                scale(this.scale),
                anchor("center"),
                orbitAndLaunch(this, a, radius, 5),
                opacity(1),
                shadowTrail(0.01, [
                  rgb(255, 247, 93),
                  rgb(141, 255, 112),
                  rgb(77, 255, 205),
                  rgb(77, 196, 255),
                ]),
                z(1),
                "lighteningOrbiter",
                {
                  angle: a,
                },
              ])
            )
          );

          await wait(5, () => {
            this.activePassive = false;
            this.lastPassiveTime = time();
          });
        },
        attack: async function () {
          const direction = mousePos().sub(this.pos).unit(); // Normalize to get direction

          this.cd += dt();

          if (this.cd >= this.atkCD) {
            this.cd = 0;
            add([
              sprite(this.atkSprite),
              pos(this.pos),
              anchor("center"),
              rotate(direction.angle() + 90),
              scale(opts.SCALE),
              area(),
              move(direction, 800),
              offscreen({ destroy: true }),
              z(1),
              "bullet",
            ]);
          }
        },
        activateSpecial: async function () {
          const dashSpeed = 1200;
          const angleOffsets = [45, 225];
          const lightnings = [];

          const destination = mousePos();
          const dir = destination.sub(this.pos).unit();

          let dashTime = destination.dist(this.pos) / dashSpeed;

          this.use(shadowTrail(0.01));
          this.use(move(dir, dashSpeed));
          const l = loop(dashTime / 5, () => {
            angleOffsets.map((a) => {
              const angle = dir.angle() + a;
              lightnings.push(
                add([
                  sprite("lightening"),
                  pos(this.pos),
                  anchor("center"),
                  rotate(angle + 90),
                  scale(opts.SCALE),
                  area(),
                  opacity(0),
                  summonAnimation(),
                  // move(angleToVec(angle), 800),
                  offscreen({ destroy: true }),
                  z(1),
                  "bullet",
                  {
                    dir: angleToVec(angle),
                  },
                ])
              );
            });

            lightnings.forEach(async (l) => {
              await wait(0.75, () => {
                l.unuse("summonAnimation");
                l.use(move(l.dir, 800));
              });
            });
          });

          await wait(dashTime, () => {
            this.unuse("move");
            this.unuse("shadowTrail");
            l.cancel();
          });
        },
        createShield: function () {
          const shield = this.add([
            pos(0, 0),
            circle(this.width * 0.8),
            color(0, 200, 255),
            opacity(0.4),
            z(0),
            animate(),
            "shieldEffect",
          ]);

          shield.animate('opacity', [
            0.4,
            0.5,
            0.4,
            0.3
          ], {
            duration: 1,
            direction: 'ping-pong',
            easing: easings.easeInCubic
          })
          
          return shield;
        },
        activateUltimate: function () {
          const originalSpeed = this.speed;
          const boostAmount = 2.5;
          const duration = 5;

          // Apply shield state
          this.use(shadowTrail(0.01, [
            rgb(65, 65, 176),
            rgb(118, 51, 162),
            rgb(149, 44, 152),
            rgb(76, 33, 131),
          ]))
          this.shielded = true;
          this.speed *= boostAmount;

          // Visual shield
          const shield = this.createShield();

          // Cancel after duration
          wait(duration, () => {
            this.shielded = false;
            this.unuse('shadowTrail')
            this.speed = originalSpeed;
            destroy(shield);
          });
        },
        update() {
          if (
            !this.activePassive &&
            time() - this.lastPassiveTime >= this.passiveCD
          ) {
            this.activatePassive();
          }
        },
      },
    ]);
  },
};

export default generatePlayer;
