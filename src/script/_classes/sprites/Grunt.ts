/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameState  = require("../states/GameState");
import MapSprite = require("../lib/MapSprite");

/**
 * Grunt class
 */

class Grunt extends MapSprite {
  private _ghostNr:number;
  private _velocity:Phaser.Point;
  private _dead=false;

  // stats
  private _maxVelocity:number;
  private _weapon:any;

  //Destroy emitter:
  private _emitter:Phaser.Particles.Arcade.Emitter;
  private _gibTTL:number;

  //Sound:
  private _splat:Phaser.Sound;

  constructor(mapState:GameState, object:any) {
    super(mapState, object);
    this.moveAnchor(.5);
    this.animations.add("die", [1, 2, 3, 4, 5, 6], 15, false);

    //SOUND
    this._splat = mapState.add.audio('splat1');

    // POSITION AND VELOCITY
    this._weapon = 0;
    this._gibTTL = 1000;


    // POSITION AND VELOCITY
    this.position = object.x && object.y ? new Phaser.Point(object.x, object.y) : new Phaser.Point(0,0);
    this.body.velocity = new Phaser.Point(0,0);

    // stats
    this._maxVelocity = 120;
    this.maxHealth = 1;
    this.health = 1;

  }

  update() 
  {
    if (!this.inCamera || this._dead) {
      return;
    }
    // Calculates velocity and moves the protagonist
    this.handleMovement();
  }

  calculateVelocity()
  {
    // PLAYER CONTROLLED      
    // Calculate velocity
    var target = this.mapState.objectType("protagonist").getTop() !== undefined ? this.mapState.objectType("protagonist").getTop() : this;
    this.body.velocity.set(target.position.x - this.position.x, target.position.y - this.position.y);
    this.body.velocity = this.body.velocity.setMagnitude(this._maxVelocity);
  }

  handleMovement()
  {
    // Calculate velocity
    this.calculateVelocity();

  }

  getVelocity()
  {
    return this.body.velocity;
  }

  destroyGibEmitter() {
    this._emitter.removeChildren();
    this._emitter.kill();

  }

  gib() {
    this._dead = true;
    this.alive = false;
    this._emitter = this.mapState.add.emitter(this.position.x, this.position.y);
    this._emitter.makeParticles('bullet_16x16');
    this._emitter.setAlpha(1,0,5000, Phaser.Easing.Exponential.Out);
    this._emitter.start(true, this._gibTTL,null,5);
    this.mapState.time.events.add(this._gibTTL*2, ()=>{this.destroyGibEmitter(); this.destroy();}, this);
    this.play("die", 15, false, true);
    this._splat.play();
  }

}
export = Grunt;
