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
  private _backgroundSprite:Phaser.Sprite;

  // stats
  private _maxVelocity:number;
  private _weapon:Weapon.Weapon;
  private _fragmentSrc = [

        "precision mediump float;",

        "uniform float     time;",
        "uniform vec2      resolution;",
        "uniform sampler2D iChannel0;",

        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",

        "#define PI 3.1416",

        "void main( void ) {",

            "//map the xy pixel co-ordinates to be between -1.0 to +1.0 on x and y axes",
            "//and alter the x value according to the aspect ratio so it isn't 'stretched'",

            "vec2 p = (3.3 * gl_FragCoord.xy / resolution.xy - 0.7) * vec2(resolution.x / resolution.y, 1.0);",

            "//now, this is the usual part that uses the formula for texture mapping a ray-",
            "//traced cylinder using the vector p that describes the position of the pixel",
            "//from the centre.",

            "vec2 uv = vec2(atan(p.y, p.x) * 1.0/PI, 0.1 / sqrt(dot(p, p))) * vec2(0.3, 1.0);",

            "//now this just 'warps' the texture read by altering the u coordinate depending on",
            "//the val of the v coordinate and the current time",

            "uv.x += sin(2.3 * uv.y + time * 2.5);",

            "//this divison makes the color value 'darker' into the distance, otherwise",
            "//everything will be a uniform brightness and no sense of depth will be present.",

            "vec3 c = texture2D(iChannel0, uv).xyz / (uv.y * 0.7 + 1.0);",

            "gl_FragColor = vec4(c, 1.0);",

        "}"
    ];
    private _filter:Phaser.Filter;

  constructor(public mapState:GameState, object:any) {
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
    this._maxVelocity = object._maxVelocity ? object._maxVelocity : 300;
    this.maxHealth = object.maxHealth ? object.maxHealth : 1;
    this.health = object.Health ? object.Health : 1;
    this._weapon = object.weapon !== undefined ? Weapon.newWeapon(this, object.weapon) : Weapon.newWeapon(this);
  }

  addSound() {
    var rand = Math.random();
    if (rand < 0.3) {
    this.sfx = this.mapState.add.audio('explosion1');
  }
  else if (rand < 0.65) {
    this.sfx = this.mapState.add.audio('explosion2');
  }
  else {
    this.sfx = this.mapState.add.audio('explosion3');
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

    if (this._filter !== undefined) {
      this._filter.update();
    }
  }

  upgrade(point:number)
  {
    var chance = Math.random();
    if(chance < 0.5){
        this._weapon.setBulletAmount(this._weapon.getBulletAmount() + point);
    }
    else if(chance < 0.6){
        this._weapon.setFireRate(this._weapon.getFireRate() * Math.pow(0.9,point));
    }
    else if(chance < 0.7){
        this._weapon.setBulletSpeed(this._weapon.getBulletSpeed() + point * 5);
    }
    else if(chance < 0.8){
      this._weapon.setFireLength(this._weapon.getFireLength() + point * 5);
    }
    else if(chance < 0.9){
        this._weapon.setFireLength(this._weapon.getFireLength() + point * 5);
        this._weapon.setFireRate(this._weapon.getFireRate() * Math.pow(0.9,point));
        this._weapon.setBulletSpeed(this._weapon.getBulletSpeed() + point * 5);
        this._weapon.setBulletAmount(this._weapon.getBulletAmount() + point);
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
        this.kill();
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
      if (this.sfx != undefined) {
        this.playSound();
        this._backgroundSprite = this.mapState.layers['background'];
        var customUniforms = {
        iChannel0: { type: 'sampler2D', value: this._backgroundSprite, textureData: { repeat: true } }
        };

      this._filter = new Phaser.Filter(this.mapState.game, customUniforms, this._fragmentSrc);
      this._filter.setResolution(1950, 740);
      this._backgroundSprite.filters = [ this._filter ];
      }
    } else {
      super.destroy();
    }
    return this;
  }


}
export = Protagonist;
