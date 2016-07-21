/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameState  = require("../states/GameState");
import MapSprite = require("../lib/MapSprite");
import joypad    = require("../lib/joypad");
import LeadingCamera = require("../lib/LeadingCamera");

/**
 * Protagonist class
 */

class Protagonist extends MapSprite {
  private _camera:LeadingCamera;

  constructor(mapState:GameState, object:any) {
    super(mapState, object);
    this.moveAnchor(.5);

    this._camera = new LeadingCamera(this, 160, 0);

    joypad.start();
  }

  update() {

    this._camera.update();
  }


}
export = Protagonist;
