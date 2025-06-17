import { angleToVec } from "./helpers";
import shadowTrail from "./shadowTrail";
import orbitAndLaunch from "./orbitLaunch";

const generatePlayer = {
  mark: function (opts = { SCALE: (width() * 0.05) / 100 }) {
    return add([
      sprite("mark"),
      pos(center()),
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
              shadowTrail(0.05, [rgb(255, 93, 123), rgb(255, 112, 222), rgb(255, 77, 77), rgb(255, 110, 73),]),
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
};

export default generatePlayer;
