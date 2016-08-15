/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import MapState  = require("./MapState");
import MapUtils  = require("./MapUtils");


/**
 * MapText class
 *
 * @date 16-08-2016
 */

class MapText extends Phaser.Text {
  public properties:any;

  constructor(public mapState:MapState, public object:any) {
    super(mapState.game, object.x, object.y, ""+object.name);
    this.properties = MapUtils.decodeProperties(object.properties);
    MapUtils.applyPosition(this, object);

    if (!this.properties["stretched"]) {
      this.width = this.texture.width;
      this.height = this.texture.height;
      this.wordWrap = true;
      this.setTextBounds(0, 0, object.width, object.height);
      this.wordWrapWidth = object.width;
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
export = MapText;
