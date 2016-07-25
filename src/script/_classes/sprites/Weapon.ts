/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import Protagonist = require("./Protagonist");

/**
 * Weapon interface
 */

namespace Weapon {
  export function newWeapon(prot:Protagonist, otherWep?:Weapon)
  {
    var wep:Weapon;
    if(otherWep !== undefined){
      switch (otherWep.name) 
      {
        case "SuperBullet":
          wep = new SuperBullet(prot);
          break;
        default:
          wep = new StndBullet(prot);
          break;
      }
      otherWep.getFireLength   ? wep.setFireLength(otherWep.getFireLength()) : 0;
      otherWep.getFireRate     ? wep.setFireRate(otherWep.getFireRate()) : 0;
      otherWep.getBulletSpeed  ? wep.setBulletSpeed(otherWep.getBulletSpeed()) : 0;
      otherWep.getBulletKey    ? wep.setBulletKey(otherWep.getBulletKey()) : 0;
      otherWep.getBulletAmount ? wep.setBulletAmount(otherWep.getBulletAmount()) : 0;
      return wep;
    }
    else
    {
      return new StndBullet(prot);
    }
  }

  export class Weapon
  {
    protected _weapon:Phaser.Weapon;
    public name:string;

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
      this._weapon.trackSprite(prot, 0, -32);
      this._weapon.bulletAngleOffset = 0;
    }

    shoot()
    {
      this._weapon.fire(null);
    }
  }

  class StndBullet extends Weapon{

    constructor(public prot:Protagonist) {
      super(prot);
      this.name = "StndBullet";
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
      this.name = "SuperBullet";
      this.setBulletAmount(10);
    }
  }
}


export = Weapon;
