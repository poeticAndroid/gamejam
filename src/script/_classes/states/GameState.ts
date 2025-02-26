/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameApp       = require("../GameApp");
import MapState      = require("../lib/MapState");
import MapSprite     = require("../lib/MapSprite");

import Recorder      = require("../lib/Recorder");

import Protagonist   = require("../sprites/Protagonist");
import Grunt         = require("../sprites/Grunt");
import Patrol        = require("../sprites/Patrol");
import Powerup       = require("../sprites/Powerup");

/**
 * GameState class
 */
class GameState extends MapState {
  public recorder : Recorder;
  public advanceSpeed : number;
  private _timeText : Phaser.Text;
  private _bestTimeText : Phaser.Text;
  private _ghostText : Phaser.Text;
  private _restarting : number;

  constructor(gameApp:GameApp, mapName?:string, _url?:string) {
    super(gameApp, mapName, _url);
    this.eng.antialias = false;
    this.objectClasses["protagonist"] = Protagonist;
    this.objectClasses["grunt"] = Grunt;
    this.objectClasses["patrol"] = Patrol;
    this.objectClasses["powerup"] = Powerup;
    this.joypad.mode = "legacy";
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
    this.eng.load.audio("upgrade1", "./assets/sounds/upgrade.wav");
  }

  create() {
    super.create();
    if(this.mapName == "game_map"){
      this.camera.y = this.world.height;

      this.advanceSpeed = -60;

      this.physics.startSystem(Phaser.Physics.ARCADE);

      this._restarting = 0;

      /* // Time
      this._timeText = this.eng.add.text(10,10,this._timeInRoom.toString(), {fill: "white"});
      this._timeText.fixedToCamera = true;

      // Best time
      this._bestTimeText = this.eng.add.text(10,34, "Best time: "+this.gameApp.saveFile.get("bestTime"), {fill: "white"});
      this._bestTimeText.fixedToCamera = true;

      // Ghost amount
      this._ghostText = this.eng.add.text(10,58,this._timeInRoom.toString(), {fill: "white"});
      this._ghostText.fixedToCamera = true; */
      
      // Update ghost text
      this.objectType("bitmapText").getByName("Deaths").text = "Deaths: " + (this.gameApp.recorder.getGhostAmount()).toString();

      // Update best time
      this.objectType("bitmapText").getByName("Best time").text = "Best time: "+this.gameApp.saveFile.get("bestTime");


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
                        "x":this.world.centerX,
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
                      "x":this.world.centerX,
                      "y":9500,
                      "weapon": {
                                "name":"StndBullet"
                                }
                    };
      this.addObject(protag);

      this.gameApp.recorder.addGhostRecord();

      this._timeInRoom = 0;
    }
    else if(this.mapName == "win_map")
    {
      this.objectType("bitmapText").getByName("died").text = "You died " + (this.gameApp.recorder.getGhostAmount() - 1).toString() + " times.";
      this.objectType("bitmapText").getByName("record").visible = false;
      if (this.gameApp.saveFile.get("bestDeaths") == null || this.gameApp.saveFile.get("bestDeaths") > (this.gameApp.recorder.getGhostAmount() - 1)) {
        if (this.gameApp.saveFile.get("bestDeaths") != null) {
          this.objectType("bitmapText").getByName("record").visible = true;
        }
        this.gameApp.saveFile.set("bestDeaths", this.gameApp.recorder.getGhostAmount() - 1);
      }
      if (this.gameApp.saveFile.get("bestDeaths") < 1) {
        this.gameApp.saveFile.set("bestDeaths", null);
      }
      this.gameApp.trackEvent("won_"+(this.gameApp.recorder.getGhostAmount() - 1));
    }
  }

  update() {
    super.update();

    if(this.mapName == "game_map")
    {
      this.camera.y += this.advanceSpeed / 60;

      // Update time related variables
      this.timeRelatedStuff()

      // Debugging
      this.gameApp.recorder.update();
 /*     if(this.joypad.a == true && this.joypad.deltaA && this.objectType("protagonist").getTop() !== undefined)
      {
        this.objectType("protagonist").getTop().kill();
      }
      if(this.joypad.b == true &&this.joypad.deltaB)
      {
        this.objectType("protagonist").getTop().upgrade(5);
      }
*/      // Collision detection
      this.checkCollisions();

      // Check if player died and reset if it is
      this.checkPlayerDeath();

      // GAME OVER, YOU WIN. HACK!
      if(this.camera.y == 0)
      {
        this.gameApp.saveFile.set("bestTime", null);
        this.gameApp.switchTo("win_state");
        // YOU WIN!
      }
    }
  }

  checkCollisions()
  {
    this.game.physics.arcade.overlap(this.objectType("patrol"), this.objectType("protagonist"), this._gruntMeetsProtagonist, (a:any, b:any)=>{ return a.alive && b.alive;}, this);
    this.game.physics.arcade.overlap(this.objectType("bullet"), this.objectType("grunt"), this._bulletMeetsGrunt, (a:any, b:any)=>{ return a.alive && b.alive;}, this);
    this.game.physics.arcade.overlap(this.objectType("bullet"), this.objectType("patrol"), this._bulletMeetsGrunt, (a:any, b:any)=>{ return a.alive && b.alive;}, this);
    this.game.physics.arcade.overlap(this.objectType("grunt"), this.objectType("protagonist"), this._gruntMeetsProtagonist, (a:any, b:any)=>{ return a.alive && b.alive;}, this);
    this.game.physics.arcade.overlap(this.objectType("protagonist"), this.objectType("powerup"), this._ProtagonistMeetsPowerup, (a:any, b:any)=>{ return a.alive && b.alive;}, this);
  }

  timeRelatedStuff()
  {
  //  this._timeInRoom += this.game.time.physicsElapsed;
    //this._timeText.text = "Countdown: " + parseFloat(this._timeInRoom.toString()).toFixed(1);
    this.objectType("bitmapText").getByName("countdown").text = "Countdown: " + Math.floor(this.camera.y / 60);
 
  }

  checkPlayerDeath()
  {
    if(this._restarting != 0 || this.objectType("protagonist").getTop().alive == false)
    {
      this._restarting += this.game.time.physicsElapsed;
      if(this._restarting > 2)
      {
        this.gameApp.trackEvent("died_"+(Math.round(this.camera.y/600)*10));
        if (this.gameApp.saveFile.get("bestTime") == null || this.gameApp.saveFile.get("bestTime") > Math.floor(this.camera.y / 60)) {
          this.gameApp.saveFile.set("bestTime", Math.floor(this.camera.y / 60));
        }
        this.command("restart");
      }
    }
  }

  command(command:string, args={}):boolean {
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
    
    var chance = Math.random();
    if(chance < 0.1)
    {
      // Spawn protag
      var powerup = {
                  "gid":34,
               "height":32,
                   "name":"",
               "rotation":0,
                   "type":"powerup",
                "visible":true,
                  "width":32,
                      "x":grunt.position.x,
                      "y":grunt.position.y
                    };
      this.addObject(powerup);
    }

    grunt.gib();
    // grunt.kill();
    bullet.kill();
  }

  _gruntMeetsProtagonist(grunt:Grunt, protagonist:Protagonist) {
    protagonist.kill();
    if (this.objectType("protagonist").getTop() === protagonist) {
      this.fade(0, 1, 2000);
    }
  }

  _ProtagonistMeetsPowerup(protagonist:Protagonist, powerup:Powerup) {
    powerup.gib();
    this.objectType("protagonist").getTop().upgrade(1);
  }

}
export = GameState;
