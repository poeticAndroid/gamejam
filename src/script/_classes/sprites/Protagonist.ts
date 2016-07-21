/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameState  = require("../states/GameState");
import MapSprite = require("../lib/MapSprite");
import joypad    = require("../lib/joypad");
import LeadingCamera = require("../lib/LeadingCamera");
import Weapon = require("../sprites/Weapon");
import Recorder = require("../lib/Recorder");

/**
 * Protagonist class
 */

class Protagonist extends MapSprite {
  private _camera:LeadingCamera;
  private _ghostNr:number;
  private _velocity:Phaser.Point;
  private _recorder: Recorder;

  // stats
  private _maxVelocity:number;
  private _weapon:any;

  constructor(mapState:GameState, object:any) {
    super(mapState, object);
    this.moveAnchor(.5);

    this._recorder = this.mapState.gameApp.recorder;


    if(object.ghostNr !== undefined)
    {
      this._ghostNr = object.ghostNr;
      console.log("Created ghost with ghostNr: " + this._ghostNr);
      this.alpha = (this._ghostNr+2) / (this._recorder.getGhostAmount()+2);
    }
    else
    {
      this._ghostNr = null;
      this.tint = 0x66ccff;
      joypad.start();
    }

    // POSITION AND VELOCITY
    this.position = object.x && object.y ? new Phaser.Point(object.x, object.y) : new Phaser.Point(0,0);

    // stats
    this._maxVelocity = 300;
    this.maxHealth = 1;
    this.health = 1;

    this._weapon = 0;

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
    if(this._ghostNr === null) 
    {
      this.mapState.gameApp.recorder.record(this);
    }
  }

  calculateVelocity()
  {
    if(this._ghostNr >= 0 && this._ghostNr !== null)
    {
      // GHOST CONTROLLED
      // Get velocity
      this.body.velocity = this.mapState.gameApp.recorder.getRecord(this._ghostNr);
      //console.log(this._velocity)
      //this.mapState.gameApp.recorder.print();
      if(this.body.velocity === null)
      {
        this.body.velocity = new Phaser.Point(0,-60);
      }
    }
    else
    {
      // PLAYER CONTROLLED      
      // Calculate velocity
      this.body.velocity.set(joypad.x * this._maxVelocity, joypad.y * this._maxVelocity - 60);
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
    this.checkCameraBounds();
  }

  getVelocity()
  {
    return new Phaser.Point(this.body.velocity.x, this.body.velocity.y);
  }


}
export = Protagonist;
