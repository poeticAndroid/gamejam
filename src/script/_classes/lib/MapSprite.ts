/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import MapState  = require("./MapState");
import MapUtils  = require("./MapUtils");


/**
 * MapSprite class
 *
 * @date 14-08-2016
 */

class MapSprite extends Phaser.Sprite {
  public sfx: Phaser.Sound;
  public properties:any;

  constructor(public mapState:MapState, public object:any) {
    super(mapState.game, object.x, object.y);
    MapUtils.applyTexture(this, object);
    MapUtils.applyPosition(this, object);

    this.game.physics.enable(this);
    this.properties = MapUtils.decodeProperties(object.properties);
    MapUtils.mergeObjects(this.properties, this);
  }

  moveAnchor(x:number, y?:number) {
    MapUtils.moveAnchor(this, x, y);
  }

  playSound(marker?: string, position?: number, loop?: boolean, forceRestart?: boolean) {
    if (this.mapState.gameApp.prefs.data["sfx"]["enabled"]) {
      this.sfx.play(marker, position, this.mapState.gameApp.prefs.data["sfx"]["volume"], loop, forceRestart);
    }
  }
}
export = MapSprite;
