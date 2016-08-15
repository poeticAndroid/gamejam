/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import GameApp     = require("../GameApp");
import MapSprite   = require("./MapSprite");
import MapText     = require("./MapText");
import MapButton   = require("./MapButton");
import joypad      = require("./joypad");
import StorageFile = require("./StorageFile");
import MapUtils    = require("./MapUtils");


/**
 * MapState class
 * 
 * @date 15-08-2016
 */

class MapState extends Phaser.State {
  public properties:any;
  public eng:Phaser.Game;
  public objectClasses:Object;
  public loaded:boolean;
  public mapData:any;
  public mapFolder:string;
  public layers:Object;
  public objectTypes:Object;
  public map:Phaser.Tilemap;
  public buttonType:string;
  public focusedButton:number;
  public joypad=joypad;

  constructor(public gameApp:GameApp, public mapName?:string, private _url?:string) {
    super();
    this.eng = gameApp.eng;
    this.objectClasses = {
      "sprite": MapSprite,
      "text":   MapText,
      "button": MapButton
    };
    this.loaded = false;
  }

  init(mapName?:string) {
    if (mapName) {
      this.mapName = mapName;
      this.loaded = false;
    }
    this.mapData = null;
    if (this.eng.cache.checkTilemapKey(this.mapName)) {
      this.mapData = this.eng.cache.getTilemapData(this.mapName).data;
      this._url = null;
    }
  };

  preload(showProgress=true) {
    var txt:Phaser.Text;
    if (!(this.mapName) || this.loaded) {
      return;
    }
    if (showProgress) {
      this.eng.stage.backgroundColor = 0;
      txt = this.eng.add.text(0, this.stage.height, "Loading... 0%", {
        fill: "white"
      });
      txt.anchor.set(.5);
      txt.position.set(this.game.width/2, this.game.height/2);
    }
    this.eng.load.onFileComplete.add(function(progress: number, key: string, success:boolean, loadedFiles:number, totalFiles:number) {
      if (key === this.mapName) {
        this.loadAssets();
      } else if (txt) {
        txt.text = "Loading... "+progress+"%";
      }
      if (loadedFiles === totalFiles) {
        this.loaded = true;
      }
    }, this);
    if (this._url) {
      this.eng.load.tilemap(this.mapName, this._url, null, Phaser.Tilemap.TILED_JSON);
      this._url = null;
    }
    this.gameApp.loadAllStates();
  };

  loadAssets() {
    var layer:any, tileset:any, url:string;
    if (!this.eng.cache.checkTilemapKey(this.mapName)) {
      return;
    }
    url = this.eng.cache.getTilemapData(this.mapName).url;
    this.mapFolder = url.substr(0, url.lastIndexOf("/") + 1);
    this.mapData = this.eng.cache.getTilemapData(this.mapName).data;
    this.properties = MapUtils.decodeProperties(this.mapData.properties);
    for (tileset of this.mapData.tilesets) {
      this.eng.load.spritesheet(tileset.name, this.mapFolder + tileset.image, tileset.tilewidth, tileset.tileheight, tileset.tilecount, tileset.margin, tileset.spacing);
    }
    for (layer of this.mapData.layers) {
      if (layer.type === "imagelayer") {
        this.eng.load.image(this.mapName + "_" + layer.name, this.mapFolder + layer.image);
      }
    }
    if (this.properties["musicKey"] && this.properties["musicUrl"]) {
      this.gameApp.loadMusic(this.properties["musicKey"], this.mapFolder + this.properties["musicUrl"]);
    }
  };

  create() {
    var layer:any,
        object:any,
        tileset:any,
        properties:any;
    if (!this.mapName) { return; }
    this.world.removeChildren();
    this.game.canvas.style.cursor = "inherit";
    this.game.world.setBounds(0, 0, this.stage.width, this.stage.height);
    this.game.stage.backgroundColor = this.mapData.backgroundcolor;
    this.layers = {};
    this.objectTypes = {};
    this.buttonType = "button";
    this.focusedButton = -1;
    this.map = this.add.tilemap(this.mapName);
    this._parallaxLayers = [];
    this._offStageQueue = [];
    this._offstageMode = this.properties["offstage"];
    for (tileset of this.mapData.tilesets) {
      this.map.addTilesetImage(tileset.name);
    }
    this.game.world.setBounds(0, 0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    for (layer of this.mapData.layers) {
      properties = MapUtils.decodeProperties(layer.properties);
      switch (layer.type) {
        case "imagelayer":
          if (properties.tiled) {
            this.layers[layer.name] = this.add.tileSprite(0, 0, this.world.width, this.world.height, this.mapName + "_" + layer.name);
            this.layers[layer.name].tilePosition.set(layer.offsetx, layer.offsety);
          } else {
            this.layers[layer.name] = this.add.sprite(layer.offsetx, layer.offsety, this.mapName + "_" + layer.name);
          }
          if (properties.parallax) {
            this.layers[layer.name]["parallax"] = properties.parallax;
            this._parallaxLayers.push(this.layers[layer.name]);
          }
          this.layers[layer.name].alpha = layer.opacity;
          MapUtils.mergeObjects(properties, this.layers[layer.name]);
        break;
        case "tilelayer":
          this.map.setCollisionByExclusion([]);
          this.layers[layer.name] = this.map.createLayer(layer.name);
          // this.layers[layer.name].resizeWorld();
          MapUtils.mergeObjects(properties, this.layers[layer.name]);
        break;
        case "objectgroup":
          for (object of layer.objects) {
            if (this._offstageMode) {
              this.offstageObject(object, layer.name);
            } else {
              this.addObject(object, layer.name);
            }
          };
        break;
      }
    }
    if (this.properties["musicKey"]) {
      this.gameApp.playMusic(this.properties["musicKey"], this.properties["musicLoop"]);
    }
    this.fadeIn();
    this.gameApp.trackEvent(this.key);
  };

  update() {
    joypad.update();
    var fb:number = this.focusedButton;
    if (fb > -1) {
      if (joypad.fire && this.objectTypes[this.buttonType].getAt(fb).command === "adjust") {
        this.objectTypes[this.buttonType].getAt(fb).position.add(joypad.x*2, joypad.y*2);
      } else
      if (Math.round(joypad.x) !== 0 || Math.round(joypad.y) !== 0) {
        this.objectTypes[this.buttonType].getAt(fb).blur();
        if (joypad.deltaDown === 1 || joypad.deltaRight === 1) {
          fb++;
        }
        if (joypad.deltaUp === 1 || joypad.deltaLeft === 1) {
          fb--;
        }
        if (fb >= this.objectTypes[this.buttonType].length) {
          fb = 0;
        }
        if (fb < 0) {
          fb = this.objectTypes[this.buttonType].length-1;
        }
        this.objectTypes[this.buttonType].getAt(fb).focus();
      }
      if (joypad.deltaFire === 1) {
        this.objectTypes[this.buttonType].getAt(fb).push();
      }
      if (joypad.deltaFire === -1) {
        this.objectTypes[this.buttonType].getAt(fb).release();
      }
      this.focusedButton = fb;
    }
    var obj = this._offStageQueue[this._offStageQueue.length-1];
    if (obj) {
      switch (this._offstageMode) {
        case "left":
          if (obj.x+obj.width > this.camera.x) this.addObject(this._offStageQueue.pop());
          break;
        case "right":
          if (obj.x-obj.width < this.camera.x+this.camera.width) this.addObject(this._offStageQueue.pop());
          break;
        case "top":
          if (obj.y+obj.height > this.camera.y) this.addObject(this._offStageQueue.pop());
          break;
        case "bottom":
          if (obj.y-obj.height < this.camera.y+this.camera.height) this.addObject(this._offStageQueue.pop());
          break;
      }
    }
    super.update();
  }

  render() {
    var layer:Phaser.Sprite;
    for (layer of this._parallaxLayers) {
      layer.position.set(this.camera.x*layer["parallax"], this.camera.y*layer["parallax"]);
    }
    super.render();
  }

  shutdown() {
    super.shutdown();
  }

  addObject(object:any, layerName?:string) {
    var type = object.type || "sprite";
    this.objectType(type, layerName);
    if (this.objectClasses[type] != null) {
      return this.objectTypes[type].add(new this.objectClasses[type](this, object));
    } else if (this.objectClasses["sprite"] != null) {
      return this.objectTypes[type].add(new this.objectClasses["sprite"](this, object));
    }
  }

  offstageObject(object:any, layerName=object.layerName) {
    var i:number, type = object.type || "sprite";
    var place = this._offStageQueue.length;
    this.objectType(type, layerName);
    object.layerName = layerName;
    for (i=0;i<this._offStageQueue.length;i++) {
      switch (this._offstageMode) {
        case "left":
          if (this._offStageQueue[i].x > object.x) place = i;
          break;
        case "right":
          if (this._offStageQueue[i].x < object.x) place = i;
          break;
        case "top":
          if (this._offStageQueue[i].y > object.y) place = i;
          break;
        case "bottom":
          if (this._offStageQueue[i].y < object.y) place = i;
          break;
      }
      if (place < this._offStageQueue.length) i = this._offStageQueue.length;
    }
    this._offStageQueue.splice(place, 0, object);
  }

  objectLayer(layerName:string) {
    if (this.layers[layerName] == null) {
      this.layers[layerName] = this.add.group(this.world, layerName);
    }
    return this.layers[layerName];
  }

  objectType(type:string, layerName="objects") {
    if (this.objectTypes[type] == null) {
      this.objectLayer(layerName);
      this.objectTypes[type] = this.add.group(this.layers[layerName], type);
    }
    return this.objectTypes[type];
  }

  command(command:string, args:any=[]):boolean {
    var file:StorageFile;
    switch (command) {
      case "url":
        location.assign(args.href || args[0]);
        break;

      case "goBack":
        this.gameApp.goBack();
        break;

      case "goTo":
        if (args.file) {
          file = new StorageFile(args.file || args[0]);
          args.state = file.get(args.key);
          if (!this.eng.state.checkState(args.state)) {
            file.delete(args.key);
            location.reload();
          }
        }
        this.gameApp.goTo(args.state || args[0]);
        break;
      
      case "switchTo":
        if (args.file) {
          file = new StorageFile(args.file || args[0]);
          args.state = file.get(args.key);
          if (!this.eng.state.checkState(args.state)) {
            file.delete(args.key);
            location.reload();
          }
        }
        this.gameApp.switchTo(args.state || args[0]);
        break;
      
      case "restart":
        this.game.state.restart(args.clearWorld, args.clearCache);
        break;
      
      default:
        console.log("Unknown command:", command, args);
        return false;
    }
    return true;
  }

  fade(from:number, to:number, duration:number, cb?:Function) {
    var g = this.eng.add.graphics(0, 0);
    g.alpha = from;
    g.fixedToCamera = true;
    g.beginFill(0, 1);
    g.drawRect(0, 0, this.eng.stage.width, this.eng.stage.height);
    g.endFill();
    var t = this.eng.add.tween(g).to({alpha:to}, duration, null, true);
    t.onComplete.add(function(){
      cb && cb();
      if (to == 0) g.destroy();
    }, this);
  }

  fadeIn(cb?:Function) {
    this.fade(1, 0, 512, cb);
  }

  fadeOut(cb?:Function) {
    this.fade(0, 1, 512, cb);
  }


  /**
    Privates
  */

  private _offStageQueue:any[];
  private _offstageMode:string;
  private _parallaxLayers:Phaser.Sprite[];
}
export = MapState;
