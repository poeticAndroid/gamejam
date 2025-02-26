/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameState  = require("../states/GameState");
import MapSprite = require("../lib/MapSprite");

/**
 * Powerup class
 */

class Powerup extends MapSprite {

  //Destroy emitter:
  private _emitter:Phaser.Particles.Arcade.Emitter;
  private _gibTTL:number;

  constructor(public mapState:GameState, object:any) {
    super(mapState, object);
    this.moveAnchor(.5);
    this.animations.add("glisten", [0, 1, 2, 3], 10, true);
    this.play("glisten");

    // POSITION AND VELOCITY
    this._gibTTL = 3000;


    // POSITION AND VELOCITY
    this.position = object.x && object.y ? new Phaser.Point(object.x, object.y) : new Phaser.Point(0,0);
    this.body.velocity = new Phaser.Point(0,0);

    this.sfx = this.mapState.add.audio('upgrade1');
  }

  destroyGibEmitter() {
    this._emitter.removeChildren();
    this._emitter.kill();
  }

  gib() 
  {
    this.alive = false;
    this._emitter = this.mapState.add.emitter(this.position.x, this.position.y);
    this._emitter.makeParticles('bullet_16x16');
    this._emitter.setAlpha(1,0,5000, Phaser.Easing.Exponential.Out);
    this._emitter.gravity = 600;
    this._emitter.setYSpeed(-600,-100);
    this._emitter.setXSpeed(-200,200);
    this._emitter.setRotation(-5000,5000);
    this._emitter.start(true, this._gibTTL,null,Math.floor(Math.random()*100) + 50);
    this.visible = false;
    this.mapState.time.events.add(this._gibTTL, ()=>{this.destroyGibEmitter();}, this);
    this.playSound();
  }

}
export = Powerup;
