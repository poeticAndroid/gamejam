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

  // stats
  private _maxVelocity:number;
  private _weapon:any;

  constructor(mapState:GameState, object:any) {
    super(mapState, object);
    this.moveAnchor(.5);

    // POSITION AND VELOCITY
    this._velocity = new Phaser.Point(0,0);
    this._weapon = 0;



    if(object.ghostNr !== undefined)
    {
      this._ghostNr = object.ghostNr;
    }
    else
    {
      this._ghostNr = null;
    }

    // POSITION AND VELOCITY
    this.position = object.x && object.y ? new Phaser.Point(object.x, object.y) : new Phaser.Point(0,0);
    this._velocity = new Phaser.Point(0,0);

    // stats
    this._maxVelocity = 2;
    this.maxHealth = 1;
    this.health = 1;

  }

  update() 
  {
    if (!this.inCamera) {
      return;
    }
    // Calculates velocity and moves the protagonist
    this.handleMovement();

    // Records latest position
    if(this._ghostNr == null) 
    {
      // this.mapState.gameApp.recorder.record(this);
    }
  }

  calculateVelocity()
  {
    if(this._ghostNr)
    {
      // GHOST CONTROLLED
      // Get velocity
      this._velocity = this.mapState.gameApp.recorder.getRecord(this._ghostNr);
      if(this._velocity == null)
      {
        this._velocity = new Phaser.Point(0,0);
      }
    }
    else
    {
      // PLAYER CONTROLLED      
      // Calculate velocity
      var target = this.mapState.objectType("protagonist").getTop();
      this._velocity.set(target.position.x - this.position.x, target.position.y - this.position.y);
      this._velocity = this._velocity.setMagnitude(this._maxVelocity);
    }
  }

  handleMovement()
  {
    // Calculate velocity
    this.calculateVelocity();

    // Move protagonist
    Phaser.Point.add(this.position, this._velocity, this.position);
  }

  getVelocity()
  {
    return this._velocity;
  }


}
export = Grunt;
