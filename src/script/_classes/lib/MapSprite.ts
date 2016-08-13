/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import MapState = require("./MapState");

/**
 * MapSprite class
 *
 * @date 13-08-2016
 */

class MapSprite extends Phaser.Sprite {
  public sfx: Phaser.Sound;
  public properties:any;

  constructor(public mapState:MapState, public object:any) {
    super(mapState.game, object.x, object.y);
    var tileset:any,
        key:string,
        val:any,
        subkey:string;
    if (this.object.gid != null) {
      this.object.flipH = !!(this.object.gid & 0x80000000);
      this.object.flipV = !!(this.object.gid & 0x40000000);
      this.object.flipD = !!(this.object.gid & 0x20000000);
      this.object.gid  &= ~0xE0000000;
      for (tileset of this.mapState.mapData.tilesets) {
        if (tileset.firstgid <= this.object.gid) {
          this.loadTexture(tileset.name, this.object.gid - tileset.firstgid);
        }
      }
      this.anchor.set(0, 1);
    }
    this.width = this.object.width;
    this.height = this.object.height;
    if (this.object.flipH) {
      this.scale.x *= -1;
    }
    if (this.object.flipV) {
      this.scale.y *= -1;
    }
    this.rotation = this.object.rotation * (Math.PI / 180);
    this.name = this.object.name;
    this.visible = this.object.visible;

    this.game.physics.enable(this);
    this._decodeProperties();
    this._mergeObjects(this.properties, this);
  }

  moveAnchor(x:number, y?:number) {
    this.position.x -= this.width * this.anchor.x;
    this.position.y -= this.height * this.anchor.y;
    this.anchor.set(x, y);
    this.position.x += this.width * this.anchor.x;
    this.position.y += this.height * this.anchor.y;
  }

  playSound(marker?: string, position?: number, loop?: boolean, forceRestart?: boolean) {
    if (this.mapState.gameApp.prefs.data["sfx"]["enabled"]) {
      this.sfx.play(marker, position, this.mapState.gameApp.prefs.data["sfx"]["volume"], loop, forceRestart);
    }
  }

  /*
    privates
  */

  private _decodeProperties() {
    var key:string;
    this.properties = {};
    if (this.object.properties) {
      for (key in this.object.properties) {
        try {
          this.properties[key] = JSON.parse(this.object.properties[key]);
        } catch(err) {
          this.properties[key] = this.object.properties[key];
        }
      }
    }
  }

  private _mergeObjects(from:Object, to:Object) {
    var key:string;
    for (key in from) {
      if (typeof from[key] === typeof to[key]) {
        if (from[key] instanceof Array && to[key] instanceof Array) {
          to[key].splice(to[key].length, 0, ...from[key]);
        } else if (typeof to[key] === "object") {
          this._mergeObjects(from[key], to[key]);
        } else {
          to[key] = from[key];
        }
      } else if (typeof to[key] === "function") {
        if (from[key] instanceof Array) {
          to[key].apply(to, from[key]);
        } else {
          to[key].call(to, from[key]);
        }
      }
    }
  }
}
export = MapSprite;
