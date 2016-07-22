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

  //sound
  private _explosion:Phaser.Sound;

  constructor(mapState:GameState, object:any) {
    super(mapState, object);
    this.moveAnchor(.5);
    this.animations.add("die", [1, 2, 3, 4, 5, 6], 15, false);

    if(object.ghostNr !== undefined)
    {
      this._ghostNr = object.ghostNr;
      // linear alpha drop from 0.9 to 0.1
      this.alpha = 0.2 + ((this._ghostNr + 1) / this.mapState.gameApp.recorder.getGhostAmount() * 0.7);
      // Slight blue tint
      this.tint = 0xA0A0FF;
      //console.log("Created ghost with ghostNr: " + this._ghostNr);
    }
    else
    {
      this._ghostNr = null;
      this.addSound();
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

  addSound() {
    var rand = Math.random();
    if (rand < 0.3) {
    this._explosion = this.mapState.add.audio('explosion1');
  }
  else if (rand < 0.65) {
    this._explosion = this.mapState.add.audio('explosion2');
  }
  else {
    this._explosion = this.mapState.add.audio('explosion3');
  }
  }

  update() 
  {
    if (!this.alive) {
      return;
    }
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
        this.destroy();
        //this.body.velocity = new Phaser.Point(0,-60);
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

    // Move protagonist if out of bounds
    this.checkCameraBounds();
  }

  getVelocity()
  {
    return new Phaser.Point(this.body.velocity.x, this.body.velocity.y);
  }

  kill() {
    if (this.alive) {
      this.alive = false;
      this.play("die", 10, false, true);
      this._explosion.play();
    } else {
      super.destroy();
    }
    return this;
  }


}
export = Protagonist;
