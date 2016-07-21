/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import Protagonist = require("./Protagonist");

/**
 * Weapon class
 */

class Weapon {

  private weapon;

  constructor(public prot:Protagonist) {
    this.weapon = this.prot.mapState.add.weapon(1, 'bullet_16x16');
    this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.weapon.bulletSpeed = 400;
    this.weapon.trackSprite(prot, 14, 0);
  }

  shoot()
  {
    this.weapon.fire();
  }
}
export = Weapon;
