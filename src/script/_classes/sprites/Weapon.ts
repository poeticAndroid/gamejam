/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import Protagonist = require("./Protagonist");

/**
 * Weapon class
 */

class Weapon {

  private _weapon:Phaser.Weapon;

  constructor(public prot:Protagonist) {
    this._weapon = this.prot.mapState.add.weapon();
    this._weapon.createBullets(1, 'bullet_16x16');
    this._weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
    this._weapon.bulletKillDistance = 350;
    this._weapon.bulletSpeed = 400;
    this._weapon.fireRate = 100;
    this._weapon.trackSprite(prot, 14, 0);
    this._weapon.bulletAngleOffset = 90;
    this.prot.mapState.objectType("bullet").add(this._weapon.bullets);
  }

  shoot()
  {
    this._weapon.fire(this.prot);
  }
}
export = Weapon;
