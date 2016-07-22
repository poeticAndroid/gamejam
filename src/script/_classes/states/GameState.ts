/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameApp       = require("../GameApp");
import MapState      = require("../lib/MapState");
import MapSprite     = require("../lib/MapSprite");
import Protagonist   = require("../sprites/Protagonist");
import Grunt         = require("../sprites/Grunt");
import Patrol         = require("../sprites/Patrol");
import Text          = require("../sprites/Text");

import Recorder      = require("../lib/Recorder");

/**
 * GameState class
 */
class GameState extends MapState {
  public recorder : Recorder;
  public advanceSpeed : number;
  private _timeText : Phaser.Text;
  private _restarting : number;

  constructor(gameApp:GameApp, mapName?:string, _url?:string) {
    super(gameApp, mapName, _url);
    this.eng.antialias = false;
    this.objectClasses["protagonist"] = Protagonist;
    this.objectClasses["grunt"] = Grunt;
    this.objectClasses["text"] = Text;
    this.objectClasses["patrol"] = Patrol;
    this.joypad.mode = "rpg";
    this.recorder = this.gameApp.recorder;
  }

  preload(showProgress=true) {
    if (this.loaded) return;
    super.preload(showProgress);
    this.eng.load.audio("splat1", "./assets/sounds/splat1.mp3");
    this.eng.load.audio("splat2", "./assets/sounds/splat2.mp3");
    this.eng.load.audio("splat3", "./assets/sounds/splat3.mp3");
    this.eng.load.audio("explosion1", "./assets/sounds/explosion1.wav");
    this.eng.load.audio("explosion2", "./assets/sounds/explosion2.wav");
    this.eng.load.audio("explosion3", "./assets/sounds/explosion3.wav");
    this.eng.load.image("font", "./assets/gfx/VictoriaBold.png");
  }

  create() {
    super.create();
    this.camera.y = this.world.height;

    this.advanceSpeed = -60;

    this.physics.startSystem(Phaser.Physics.ARCADE);

    this._restarting = 0;

    //
    this._timeText = this.eng.add.text(10,10,this._timeInRoom.toString(), {fill: "white"});
    this._timeText.fixedToCamera = true;


    // Set recorder index to 0
    this.gameApp.recorder.resetIndex();

    // Add some ghosts
    for (var i = 0; i < this.gameApp.recorder.getGhostAmount(); i++) {
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
                      "y":9500,
                      "ghostNr":i
                    };
      this.addObject(newGhost);
    }

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
                    "y":9500,
                    "weapon": {
                              "name":"StndBullet"
                              }
                  };
    this.addObject(protag);

    this.gameApp.recorder.addGhostRecord();


    this._timeInRoom = 0;
  }

  update() {
    super.update();

    this.camera.y += this.advanceSpeed / 60;

    // Update time related variables
    this.timeRelatedStuff()


    // Debugging
    this.gameApp.recorder.update();
    if(this.joypad.a == true && this.joypad.deltaA && this.objectType("protagonist").getTop() !== undefined)
    {
      this.objectType("protagonist").getTop().kill();
    }
    if(this.joypad.b == true &&this.joypad.deltaB)
    {
    }
    // Collision detection
    this.checkCollisions();

    // Check if player died and reset if it is
    this.checkPlayerDeath();
  }

  checkCollisions()
  {
    this.game.physics.arcade.overlap(this.objectType("bullet"), this.objectType("grunt"), this._bulletMeetsGrunt, (a:any, b:any)=>{ return a.alive && b.alive;}, this);
    this.game.physics.arcade.overlap(this.objectType("bullet"), this.objectType("patrol"), this._bulletMeetsGrunt, (a:any, b:any)=>{ return a.alive && b.alive;}, this);
    this.game.physics.arcade.overlap(this.objectType("grunt"), this.objectType("protagonist"), this._gruntMeetsProtagonist, (a:any, b:any)=>{ return a.alive && b.alive;}, this);
  }

  timeRelatedStuff()
  {
    this._timeInRoom += this.game.time.physicsElapsed;
    this._timeText.text = "Time: " + parseFloat(this._timeInRoom.toString()).toFixed(1);
  }

  checkPlayerDeath()
  {
    if(this._restarting != 0 || this.objectType("protagonist").getTop().alive == false)
    {
      this._restarting += this.game.time.physicsElapsed;
      if(this._restarting > 2)
      {
        this.game.state.restart();
      }
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

  _bulletMeetsGrunt(bullet:Phaser.Sprite, grunt:Grunt) {
    grunt.gib();
    // grunt.kill();
    bullet.kill();
  }

  _gruntMeetsProtagonist(grunt:Grunt, protagonist:Protagonist) {
    protagonist.kill();
  }

}
export = GameState;
