// ---------- Hanuman's Leap: a 2D platformer built on Phaser 3 ----------
// Hanuman carries his gada (mace) through the clearing. It smashes rocks
// and generic shadow-imps blocking the path — but it does nothing to the
// three named mind-creatures from the story (Chanchal, Bhaari, Shaan).
// Those only settle the way the story says they do: stand close, stay
// still, and watch.

const WIDTH = 960;
const HEIGHT = 540;
const LEVEL_WIDTH = 3300;
const GROUND_TOP = 500;

const MOVE_SPEED = 220;
const JUMP_VELOCITY = -620;
const GRAVITY = 1500;

const SWING_DURATION = 150; // ms
const ATTACK_COOLDOWN = 350; // ms
const ATTACK_RADIUS = 48;
const WATCH_RANGE = 95;
const CALM_MS = 2400;

// Platform rects given as {x, y, w, h} where (x, y) is the TOP-LEFT corner.
const PLATFORMS = [
  { x: 0, y: 500, w: 480, h: 60 },
  { x: 580, y: 460, w: 220, h: 60 },
  { x: 900, y: 500, w: 450, h: 60 },
  { x: 1450, y: 440, w: 200, h: 60 },
  { x: 1760, y: 500, w: 500, h: 60 },
  { x: 2360, y: 460, w: 220, h: 60 },
  { x: 2680, y: 520, w: 620, h: 60 },
];

const ROCKS = [
  { x: 1250, y: 500 },
  { x: 2450, y: 460 },
];

const IMP_PATROLS = [
  { minX: 130, maxX: 350, y: 500 },
  { minX: 2050, maxX: 2250, y: 500 },
  { minX: 2960, maxX: 3120, y: 520 },
];

const CREATURES = [
  { key: 'chanchal', emoji: '🐒', name: 'Chanchal the monkey', x: 1080, y: 500 },
  { key: 'bhaari', emoji: '🐘', name: 'Bhaari the elephant', x: 1950, y: 500 },
  { key: 'shaan', emoji: '🦚', name: 'Shaan the peacock', x: 2860, y: 520 },
];

const FLAG = { x: 3220, y: 520 };

function charY(platformTopY, height = 52) {
  return platformTopY - height / 2 + 4;
}

class PlayScene extends Phaser.Scene {
  constructor() {
    super('play');
  }

  create() {
    this.gameEnded = false;
    this.calmedCount = 0;
    this.impsDefeated = 0;
    this.totalImps = IMP_PATROLS.length;
    this.attackCooldown = 0;
    this.isSwinging = false;
    this.swingElapsed = 0;
    this.flagNudged = false;
    this.lastGroundX = 80;
    this.lastGroundY = charY(500);

    this.physics.world.gravity.y = GRAVITY;
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, HEIGHT + 400);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, HEIGHT);
    this.cameras.main.setBackgroundColor('#58C4F0');

    this.drawBackground();
    this.buildPlatforms();
    this.buildRocks();
    this.buildImps();
    this.buildCreatures();
    this.buildFlag();
    this.buildPlayer();
    this.buildMace();
    this.buildHUD();

    this.physics.add.collider(this.player, this.platformGroup);
    this.physics.add.collider(this.player, this.rockGroup);
    this.physics.add.collider(this.impGroup, this.platformGroup);
    this.physics.add.collider(this.rockGroup, this.platformGroup);
    this.physics.add.overlap(this.player, this.impGroup, (player, imp) => this.onPlayerHitImp(imp));
    this.physics.add.overlap(this.player, this.flagSprite, () => this.onReachFlag());

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ A: 'A', D: 'D', W: 'W', X: 'X', E: 'E', SPACE: 'SPACE' });

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, -WIDTH * 0.3, 0);

    this.started = false;
    window.__delveStart = () => { this.started = true; };
  }

  drawBackground() {
    const sky = this.add.graphics().setScrollFactor(0).setDepth(-20);
    sky.fillGradientStyle(0x58c4f0, 0x58c4f0, 0xa8e4fa, 0xa8e4fa, 1);
    sky.fillRect(0, 0, WIDTH, HEIGHT);

    const hills = this.add.graphics().setScrollFactor(0.35).setDepth(-10);
    hills.fillStyle(0x7cc98b, 1);
    hills.beginPath();
    hills.moveTo(0, HEIGHT);
    for (let x = 0; x <= LEVEL_WIDTH * 0.5; x += 160) {
      hills.lineTo(x, HEIGHT - 90 - 40 * Math.sin(x * 0.004));
    }
    hills.lineTo(LEVEL_WIDTH * 0.5, HEIGHT);
    hills.closePath();
    hills.fillPath();

    const hills2 = this.add.graphics().setScrollFactor(0.6).setDepth(-9);
    hills2.fillStyle(0x58b368, 1);
    hills2.beginPath();
    hills2.moveTo(0, HEIGHT);
    for (let x = 0; x <= LEVEL_WIDTH * 0.7; x += 120) {
      hills2.lineTo(x, HEIGHT - 55 - 26 * Math.cos(x * 0.006));
    }
    hills2.lineTo(LEVEL_WIDTH * 0.7, HEIGHT);
    hills2.closePath();
    hills2.fillPath();
  }

  buildPlatforms() {
    this.platformGroup = this.physics.add.staticGroup();
    PLATFORMS.forEach((p) => {
      const rect = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, 0x4a3d2a);
      rect.setStrokeStyle(3, 0x2c2318);
      this.physics.add.existing(rect, true);
      this.platformGroup.add(rect);
      const top = this.add.rectangle(p.x + p.w / 2, p.y + 4, p.w, 8, 0x58b368);
      top.setDepth(1);
    });
  }

  buildRocks() {
    this.rockGroup = this.physics.add.staticGroup();
    this.rocks = [];
    ROCKS.forEach((r) => {
      const sprite = this.add.text(r.x, charY(r.y, 44), '🪨', { fontSize: '40px' }).setOrigin(0.5);
      this.physics.add.existing(sprite, true);
      sprite.body.setSize(32, 30).setOffset(4, 8);
      this.rockGroup.add(sprite);
      this.rocks.push(sprite);
    });
  }

  buildImps() {
    this.impGroup = this.physics.add.group({ allowGravity: true, bounceX: 0 });
    this.imps = [];
    IMP_PATROLS.forEach((patrol) => {
      const sprite = this.add.text(patrol.minX, charY(patrol.y), '👹', { fontSize: '38px' }).setOrigin(0.5);
      this.physics.add.existing(sprite);
      sprite.body.setSize(28, 34).setOffset(5, 4);
      sprite.body.setCollideWorldBounds(true);
      sprite.dir = 1;
      sprite.patrol = patrol;
      sprite.body.setVelocityX(70);
      this.impGroup.add(sprite);
      this.imps.push(sprite);
    });
  }

  buildCreatures() {
    this.creatures = CREATURES.map((c) => {
      const sprite = this.add.text(c.x, charY(c.y), c.emoji, { fontSize: '46px' }).setOrigin(0.5);
      const label = this.add.text(c.x, charY(c.y) - 42, c.name, {
        fontFamily: 'Baloo 2', fontSize: '13px', color: '#3A2E45',
        backgroundColor: '#FFF6E8', padding: { x: 6, y: 3 },
      }).setOrigin(0.5).setAlpha(0.9);
      const ring = this.add.graphics();
      return { ...c, sprite, label, ring, calmed: false, calmProgress: 0, baseY: charY(c.y) };
    });
  }

  buildFlag() {
    this.flagSprite = this.add.text(FLAG.x, charY(FLAG.y, 60), '🏁', { fontSize: '52px' }).setOrigin(0.5);
    this.physics.add.existing(this.flagSprite, true);
  }

  buildPlayer() {
    this.player = this.add.text(80, charY(500), '🐒', { fontSize: '50px' }).setOrigin(0.5);
    this.physics.add.existing(this.player);
    this.player.body.setSize(30, 40).setOffset(10, 8);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setMaxVelocity(MOVE_SPEED, 1000);
    this.player.facing = 1;

    this.crown = this.add.text(80, charY(500) - 34, '👑', { fontSize: '20px' }).setOrigin(0.5).setDepth(4);
  }

  buildMace() {
    const g = this.add.graphics();
    g.fillStyle(0x8a5a2b, 1);
    g.fillRect(0, -4, 32, 8);
    g.lineStyle(3, 0x3a2e45, 1);
    g.strokeRect(0, -4, 32, 8);
    g.fillStyle(0xffa92c, 1);
    g.fillCircle(32, 0, 12);
    g.strokeCircle(32, 0, 12);
    this.mace = this.add.container(80, charY(500), [g]);
    this.mace.setDepth(5);
  }

  buildHUD() {
    this.hudText = this.add.text(16, 14, '', {
      fontFamily: 'Baloo 2', fontSize: '15px', color: '#FFF6E8',
      backgroundColor: 'rgba(58,46,69,0.55)', padding: { x: 10, y: 6 },
    }).setScrollFactor(0).setDepth(20);

    this.promptText = this.add.text(WIDTH / 2, 54, '', {
      fontFamily: 'Baloo 2', fontSize: '15px', color: '#3A2E45',
      backgroundColor: '#FFD166', padding: { x: 12, y: 6 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20).setAlpha(0);

    this.toastText = this.add.text(WIDTH / 2, HEIGHT - 70, '', {
      fontFamily: 'Baloo 2', fontSize: '16px', color: '#FFD166',
      backgroundColor: 'rgba(58,46,69,0.82)', padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20).setAlpha(0);
  }

  showToast(msg, ms = 2600) {
    this.toastText.setText(msg);
    this.tweens.killTweensOf(this.toastText);
    this.toastText.setAlpha(1);
    this.tweens.add({ targets: this.toastText, alpha: 0, delay: ms, duration: 400 });
  }

  breakRock(rock) {
    this.showToast('The gada shatters the rock. 💥', 1200);
    rock.destroy();
    this.rocks = this.rocks.filter((r) => r !== rock);
  }

  defeatImp(imp) {
    imp.destroy();
    this.imps = this.imps.filter((i) => i !== imp);
    this.impsDefeated++;
  }

  onPlayerHitImp(imp) {
    if (!imp.active) return;
    const dir = this.player.x < imp.x ? -1 : 1;
    this.player.body.setVelocity(dir * 220, -260);
    this.showToast('Ouch — that one bites back. Try the gada!', 1400);
  }

  maceBounce(creature) {
    this.showToast(`The gada does nothing to ${creature.name}. Try watching instead. 🙏`, 2000);
  }

  calmCreature(c) {
    c.calmed = true;
    this.calmedCount++;
    c.label.setText(`${c.name} — settled 🌙`);
    this.tweens.add({ targets: c.sprite, alpha: 0.55, scale: 0.9, duration: 500 });
    this.showToast(`${c.name} sat down beside you. ✨`, 2400);
  }

  onReachFlag() {
    if (this.gameEnded) return;
    if (this.calmedCount >= this.creatures.length) {
      this.triggerWin();
    } else if (!this.flagNudged) {
      this.flagNudged = true;
      this.showToast('You found the end — but some friends are still waiting to be noticed. 🐒🐘🦚', 3200);
      this.time.delayedCall(2000, () => { this.flagNudged = false; });
    }
  }

  triggerWin() {
    this.gameEnded = true;
    this.player.body.setVelocity(0, 0);
    this.physics.pause();
    const winOverlay = document.getElementById('winOverlay');
    winOverlay.hidden = false;
  }

  swingMace() {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = ATTACK_COOLDOWN;
    this.isSwinging = true;
    this.swingElapsed = 0;

    const hitX = this.player.x + this.player.facing * 42;
    const hitY = this.player.y;

    this.rocks.slice().forEach((rock) => {
      if (Phaser.Math.Distance.Between(hitX, hitY, rock.x, rock.y) < ATTACK_RADIUS) this.breakRock(rock);
    });
    this.imps.slice().forEach((imp) => {
      if (imp.active && Phaser.Math.Distance.Between(hitX, hitY, imp.x, imp.y) < ATTACK_RADIUS) this.defeatImp(imp);
    });
    this.creatures.forEach((c) => {
      if (!c.calmed && Phaser.Math.Distance.Between(hitX, hitY, c.sprite.x, c.sprite.y) < ATTACK_RADIUS) this.maceBounce(c);
    });
  }

  updateImps(delta) {
    this.imps.forEach((imp) => {
      if (imp.x <= imp.patrol.minX) imp.dir = 1;
      if (imp.x >= imp.patrol.maxX) imp.dir = -1;
      imp.body.setVelocityX(70 * imp.dir);
      imp.setFlipX(imp.dir < 0);
    });
  }

  updateCreatures(delta) {
    const onFloor = this.player.body.onFloor();
    const standingStill = Math.abs(this.player.body.velocity.x) < 8;
    const watching = this.keys.E.isDown;

    let nearestUncalmed = null;
    let nearestDist = Infinity;

    this.creatures.forEach((c) => {
      if (c.calmed) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, c.sprite.x, c.sprite.y);
      const inRange = dist < WATCH_RANGE;

      if (inRange && dist < nearestDist) { nearestDist = dist; nearestUncalmed = c; }

      if (inRange && standingStill && onFloor && watching) {
        c.calmProgress = Math.min(1, c.calmProgress + delta / CALM_MS);
        if (c.calmProgress >= 1) this.calmCreature(c);
      } else {
        c.calmProgress = Math.max(0, c.calmProgress - delta / (CALM_MS * 0.5));
      }

      c.sprite.y = c.baseY + Math.sin(this.time.now / 500 + c.x) * 3;
      c.ring.clear();
      if (c.calmProgress > 0) {
        c.ring.lineStyle(4, 0xffd166, 1);
        c.ring.beginPath();
        c.ring.arc(c.sprite.x, c.sprite.y, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * c.calmProgress);
        c.ring.strokePath();
      }
    });

    if (nearestUncalmed && !nearestUncalmed.calmProgress) {
      this.promptText.setText(`Hold E and stand still to watch ${nearestUncalmed.name}`);
      this.promptText.setAlpha(1);
    } else if (nearestUncalmed && nearestUncalmed.calmProgress > 0) {
      this.promptText.setText(`Settling… ${Math.round(nearestUncalmed.calmProgress * 100)}%`);
      this.promptText.setAlpha(1);
    } else {
      this.promptText.setAlpha(0);
    }
  }

  updateHUD() {
    this.hudText.setText(`🙏 Settled: ${this.calmedCount}/${this.creatures.length}    🏏 Imps cleared: ${this.impsDefeated}/${this.totalImps}`);
  }

  handleFallSafety() {
    if (this.player.body.onFloor()) {
      this.lastGroundX = this.player.x;
      this.lastGroundY = this.player.y;
    }
    if (this.player.y > HEIGHT + 300) {
      this.player.setPosition(this.lastGroundX, this.lastGroundY);
      this.player.body.setVelocity(0, 0);
    }
  }

  update(time, delta) {
    if (!this.started || this.gameEnded) return;

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const jumpPressed = this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown;

    if (left) {
      this.player.body.setVelocityX(-MOVE_SPEED);
      this.player.facing = -1;
      this.player.setFlipX(true);
    } else if (right) {
      this.player.body.setVelocityX(MOVE_SPEED);
      this.player.facing = 1;
      this.player.setFlipX(false);
    } else {
      this.player.body.setVelocityX(0);
    }

    if (jumpPressed && this.player.body.onFloor()) {
      this.player.body.setVelocityY(JUMP_VELOCITY);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.X)) this.swingMace();
    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    this.crown.setPosition(this.player.x, this.player.y - 34);

    if (this.isSwinging) {
      this.swingElapsed += delta;
      const t = Math.min(1, this.swingElapsed / SWING_DURATION);
      this.mace.setAngle(Phaser.Math.Linear(-70, 70, t));
      if (t >= 1) this.isSwinging = false;
    } else {
      this.mace.setAngle(18);
    }
    this.mace.setPosition(this.player.x, this.player.y);
    this.mace.setScale(this.player.facing, 1);

    this.updateImps(delta);
    this.updateCreatures(delta);
    this.updateHUD();
    this.handleFallSafety();
  }
}

function launch() {
  const config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    parent: 'game-root',
    backgroundColor: '#58C4F0',
    physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY }, debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [PlayScene],
  };
  const game = new Phaser.Game(config);
  window.__delveGame = game; // exposed for debugging / QA — not required for gameplay

  const beginBtn = document.getElementById('beginBtn');
  const introOverlay = document.getElementById('introOverlay');
  beginBtn.addEventListener('click', () => {
    introOverlay.hidden = true;
    if (window.__delveStart) window.__delveStart();
  });
}

const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
fontsReady.then(launch).catch(launch);
