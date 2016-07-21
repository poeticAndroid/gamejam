/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameState  = require("../states/GameState");
import MapSprite = require("../lib/MapSprite");
import joypad    = require("../lib/joypad");
import LeadingCamera = require("../lib/LeadingCamera");
import Weapon = require("../sprites/Weapon");

/**
 * Protagonist class
 */

class Protagonist extends MapSprite {
  private _camera:LeadingCamera;
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
    this._maxVelocity = 25;
    this._weapon = 0;



    if(object.ghostNr !== undefined)
    {
      this._ghostNr = object.ghostNr;
    }
    else
    {
      this._ghostNr = null;
      joypad.start();
    }

    // POSITION AND VELOCITY
    this.position = object.position ? object.position : new Phaser.Point(0,0);
    this._velocity = new Phaser.Point(0,0);

    // stats
    this._maxVelocity = 25;
    this.maxHealth = 1;
    this.health = 1;

    if(object.weapon instanceof Weapon)
    {
      this._weapon = object.weapon;
    }
    else
    {                      
      this._weapon = new Weapon(this);
    }                     

  }

  update() 
  {
    // Calculates velocity and moves the protagonist
    this.handleMovement();
    // Shoots continually
     this._weapon.shoot();

    // Records latest position
    if(this._ghostNr == null) 
    {
      this.mapState.gameApp.recorder.record(this);
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
      this._velocity.set(joypad.x * this._maxVelocity, joypad.y * this._maxVelocity);
    }
  }

  checkCameraBounds()
  {
      var XSize = this.mapState.camera.width;
      var YSize = this.mapState.camera.height;
      var x = this.position.x;
      var y = this.position.y;
      var camX = this.mapState.camera.x;
      var camY = this.mapState.camera.y;

      // Right side of camera
      if(x > camX + XSize)
      {
        this.position.x = XSize + camX;
      }
      // Left side of camera
      else if(x < camX)
      {
        this.position.x = camX;
      }

      // Top of camera
      if(y > camY + YSize)
      {
        this.position.y = YSize + camY;
      }
      // Bottom side of camera
      else if(y < camY)
      {
        this.position.y = camY;
      }
  }

  handleMovement()
  {
    // Calculate velocity
    this.calculateVelocity();

    // Move protagonist
    Phaser.Point.add(this.position, this._velocity, this.position);
    this.checkCameraBounds();
  }

  getVelocity()
  {
    return this._velocity;
  }


}
export = Protagonist;
