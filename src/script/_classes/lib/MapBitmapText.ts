/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import MapState  = require("./MapState");
import MapUtils  = require("./MapUtils");


/**
 * MapBitmapText class
 *
 * @date 16-08-2016
 */

class MapBitmapText extends Phaser.BitmapText {
  public properties:any;

  constructor(public mapState:MapState, public object:any) {
    super(mapState.game, object.x, object.y, object.properties.font, object.name);
    this.properties = MapUtils.decodeProperties(object.properties);
    MapUtils.applyPosition(this, object);

    if (!this.properties["stretched"]) {
      this.scale.set(1, 1);
      this.maxWidth = object.width;
    }
    MapUtils.mergeObjects(this.properties, this);
  }

  update() {
    super.update();
    if (this.properties["instructions"] && this._shownInstruction !== this.mapState.joypad.device) {
      if (this.properties["instructions"][this.mapState.joypad.device]) {
        this.text = this.properties["instructions"][this.mapState.joypad.device];
      } else {
        this.text = this.properties["text"];
      }
      this._shownInstruction = this.mapState.joypad.device;
    }
  }

  moveAnchor(x:number, y?:number) {
    MapUtils.moveAnchor(this, x, y);
  }

  /*
    privates
  */

  private _shownInstruction:string;
}
export = MapBitmapText;
