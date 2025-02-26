/// <reference path="../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import BaseGameApp  = require("./lib/BaseGameApp");
import MapState = require("./lib/MapState");
import GameState = require("./states/GameState");

import Recorder = require("./lib/Recorder");

/**
 * GameApp class
 */

class GameApp extends BaseGameApp {

  public recorder: Recorder;

  constructor(containerId: string, fullScreen?: boolean) {
    super(containerId, 960, 540, fullScreen);
    var maps = [ "start", "settings", "win" ];
    for (var i in maps) {
      this.eng.state.add(maps[i] + "_state", new GameState(this, maps[i] + "_map", "assets/maps/" + maps[i] + ".json"));
    }
    maps = [ "game" ];
    for (var i in maps) {
      this.eng.state.add(maps[i] + "_room", new GameState(this, maps[i] + "_map", "assets/maps/" + maps[i] + ".json"));
    }

    this.recorder = new Recorder();
  }
}
export = GameApp;
