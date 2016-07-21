/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameState  = require("../states/GameState");
import MapSprite = require("../lib/MapSprite");
import joypad    = require("../lib/joypad");
import LeadingCamera = require("../lib/LeadingCamera");

/**
 * Body class
 */

class Protagonist extends MapSprite {
  public climbing=false;
  public grabbing=true;
  private _camera:LeadingCamera;
  private _framePos=0;
  private _groundPos=0;

  constructor(mapState:GameState, object:any) {
    super(mapState, object);
    this.moveAnchor(.5, 1);

    this.animations.add("idle",   [0], 15, true);
    this.animations.add("walk",   [1, 2, 3, 4], 1, true);
    this.animations.add("hang",   [5, 6, 7, 6], 1, true);
    this.animations.add("leap",   [8], 6, true);
    this._camera = new LeadingCamera(this, 160, 0);
    this._groundPos = this.position.y;

    joypad.start();
  }

  update() {
    if (this.body.onFloor()) {
      if (this.climbing) {
        this.body.velocity.x = joypad.x*48;
        if (this.animations.name !== "hang") {
          this.play("hang");
          this.animations.stop();
        }
        if (joypad.x) {
          if (Math.abs(this._framePos - this.position.x) > 8) {
            this.animations.next();
            this._framePos = this.position.x;
          }
          if (joypad.x > 0) {
            this.scale.x = Math.abs(this.scale.x);
          } else {
            this.scale.x = -Math.abs(this.scale.x);
          }
        }
      } else {
        this.body.velocity.x = joypad.x*64;
        if (joypad.x) {
          if (Math.abs(this._framePos - this.position.x) > 24) {
            this.animations.next();
            this._framePos = this.position.x;
          } else if (this.animations.name !== "walk") {
            this.play("walk");
            this.animations.stop();
          }
          if (joypad.x > 0) {
            this.scale.x = Math.abs(this.scale.x);
          } else {
            this.scale.x = -Math.abs(this.scale.x);
          }
        } else {
          this.play("idle");
        }
      }
      if (joypad.deltaUp === 1) {
        this.climbing = true;
        this.grabbing = false;
        this.body.setSize(8, 4, 28, -4);
        this.play("leap");
        this.body.velocity.x *= 3.3;
        this.body.velocity.y = -512;
      }
    } else if (this.position.y > this._groundPos) {
      this.position.y = this._groundPos;
      this.body.velocity.set(1, -32);
      this.body.setSize(4, 4, 30, 124);
      this.climbing = false;
      this.grabbing = true;
    } else if (this.climbing && this.body.velocity.y > 0) {
      this.grabbing = true;
    }

    this._camera.update();
  }


}
export = Protagonist;
