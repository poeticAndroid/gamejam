/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import Protagonist = require("./Protagonist");

/**
 * Weapon interface
 */

namespace Weapon {
  export function newWeapon(prot:Protagonist, name?:string)
  {
    switch (name) 
    {
      case "SuperBullet":
        return new SuperBullet(prot);
      
      default:
        return new StndBullet(prot);
    }
  }
  
  class Weapon
  {
    protected _weapon:Phaser.Weapon;

    // Firerate
    getFireRate(){ return this._weapon.fireRate;}
    setFireRate(newRate:number){ this._weapon.fireRate = newRate}

    // Range before bullets disappear
    getFireLength(){ return this._weapon.bulletKillDistance;}
    setFireLength(newLength:number){ this._weapon.bulletKillDistance = newLength;}

    // How many bullets that can fly at once
    getBulletAmount(){ return this._weapon.bullets.length}
    setBulletAmount(newAmount:number)
    {
      this._weapon.bullets = null;
      this._weapon.createBullets(newAmount, this.getBulletKey());
      this.prot.mapState.objectType("bullet").add(this._weapon.bullets);
    }

    getBulletSpeed(){return this._weapon.bulletSpeed;}
    setBulletSpeed(newSpeed:number){ this._weapon.bulletSpeed = newSpeed;}

    // Sprite for bullets
    getBulletKey(){return this._weapon.bulletKey;}
    setBulletKey(newBulletKey:string){this._weapon.bulletKey = newBulletKey;}

    constructor(public prot:Protagonist) {
      this._weapon = this.prot.mapState.add.weapon();
      this._weapon.bullets = null;
      this._weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
      this._weapon.bulletKillDistance = 0;
      this._weapon.bulletSpeed = 0;
      this._weapon.fireRate = 0;
      this._weapon.trackSprite(prot, 14, 0);
      this._weapon.bulletAngleOffset = 0;
    }

    shoot()
    {
      this._weapon.fire(this.prot);
    }
  }

  class StndBullet extends Weapon{

    constructor(public prot:Protagonist) {
      super(prot);
      this.setBulletKey('bullet_16x16');
      this.setBulletAmount(1);
      this.setFireLength(350);
      this.setBulletSpeed(400);
      this.setFireRate(100);
      this._weapon.bulletAngleOffset = 90;
    }
  }

  class SuperBullet extends StndBullet
  {
    constructor(public prot:Protagonist)
    {
      super(prot);
      this.setBulletAmount(10);
    }
  }
}


export = Weapon;
