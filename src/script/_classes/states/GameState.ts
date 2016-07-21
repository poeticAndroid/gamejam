/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameApp       = require("../GameApp");
import MapState      = require("../lib/MapState");
import MapSprite     = require("../lib/MapSprite");

import Protagonist   = require("../sprites/Protagonist");
import Text          = require("../sprites/Text");

import Recorder      = require("../lib/Recorder");

/**
 * GameState class
 */
class GameState extends MapState {
  public recorder : Recorder;

  constructor(gameApp:GameApp, mapName?:string, _url?:string) {
    super(gameApp, mapName, _url);
    this.eng.antialias = false;
    this.objectClasses["protagonist"] = Protagonist;
    this.objectClasses["text"] = Text;
    this.joypad.mode = "rpg";
    this.recorder = this.gameApp.recorder;
  }

  preload(showProgress=true) {
    if (this.loaded) return;
    super.preload(showProgress);
    // this.eng.load.audio("body_sfx", "./assets/sfx/body.ogg");
    this.eng.load.image("font", "./assets/gfx/VictoriaBold.png");
  }

  create() {
    super.create();

    this.gameApp.recorder.resetIndex();
    console.log("Add ghosts");
    for (var i = 0; i < this.gameApp.recorder.getGhostAmount(); i++) {
      console.log("ghostNr: " + i);
      // SPAWN GHOSTS
      var newGhost = {
                    "gid":7,
                 "height":64,
    //               "id":119,
                   "name":"",
               "rotation":0,
                   "type":"protagonist",
                "visible":true,
                  "width":64,
                      "x":400,
                      "y":376,
                      "ghostNr":i
                    };
      this.addObject(newGhost);
    }
    console.log("Done ghosts");

     // Spawn protag
    var protag = {
                "gid":7,
             "height":64,
                 "name":"",
             "rotation":0,
                 "type":"protagonist",
              "visible":true,
                "width":64,
                    "x":400,
                    "y":376
                  };
    this.addObject(protag);

    this.gameApp.recorder.addGhostRecord();


    this._timeInRoom = 0;
  }

  update() {
    super.update();

    this.camera.x++;

    this._timeInRoom++;

    this.gameApp.recorder.update();
    if(this.joypad.a == true &&this.joypad.deltaA)
    {
      this.game.state.restart();
    }
    if(this.joypad.b == true &&this.joypad.deltaB)
    {
    this.gameApp.recorder.printEntireRecord(0);
    }

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
