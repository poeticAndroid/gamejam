/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameApp       = require("../GameApp");
import MapState      = require("../lib/MapState");
import MapSprite     = require("../lib/MapSprite");

import Protagonist   = require("../sprites/Protagonist");
import Grunt         = require("../sprites/Grunt");
import Text          = require("../sprites/Text");

import Recorder     = require("../lib/Recorder");
/**
 * GameState class
 */
class GameState extends MapState {

  constructor(gameApp:GameApp, mapName?:string, _url?:string) {
    super(gameApp, mapName, _url);
    this.eng.antialias = false;
    this.objectClasses["protagonist"] = Protagonist;
    this.objectClasses["grunt"] = Grunt;
    this.objectClasses["text"] = Text;
    this.joypad.mode = "rpg";

  }

  preload(showProgress=true) {
    if (this.loaded) return;
    super.preload(showProgress);
    // this.eng.load.audio("body_sfx", "./assets/sfx/body.ogg");
    this.eng.load.image("font", "./assets/gfx/VictoriaBold.png");
  }

  create() {
    super.create();
    this.camera.y = this.world.height;

    this._timeInRoom = 0;
  }

  update() {
    super.update();

    this.camera.y--;

    this._timeInRoom++;

    
  }

  command(command:string, args:any):boolean {
    switch (command) {
      case "noop":
        // code
        break;
      
      default:
        return super.command(command, args);
    }
    return true;
  }

  shutdown() {
    this.physics.arcade.gravity.y = 0;
    return super.shutdown();
  }

  /**
   * Privates
   */
  private _timeInRoom=0;

}
export = GameState;
