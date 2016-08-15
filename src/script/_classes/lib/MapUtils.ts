/// <reference path="../../_d.ts/phaser/phaser.d.ts"/>
"use strict";
import MapState = require("./MapState");

/**
 * MapUtils class
 *
 * @date 16-08-2016
 */

module MapUtils {
  export function readFlips(object:any) {
    if (object.gid != null) {
      object.flipH = !!(object.gid & 0x80000000);
      object.flipV = !!(object.gid & 0x40000000);
      object.flipD = !!(object.gid & 0x20000000);
      object.gid  &= ~0xE0000000;
    }
  }

  export function applyPosition(sprite:any, object:any) {
    MapUtils.readFlips(object);
    sprite.width = object.width;
    sprite.height = object.height;
    if (object.flipH) {
      sprite.scale.x *= -1;
    }
    if (object.flipV) {
      sprite.scale.y *= -1;
    }
    sprite.angle = object.rotation;
    sprite.name = ""+object.name;
    sprite.visible = !!(object.visible);
  }

  export function applyTexture(sprite:any, object:any) {
    var tileset:any;
    if (object.gid != null) {
      MapUtils.readFlips(object);
      for (tileset of sprite.mapState.mapData.tilesets) {
        if (tileset.firstgid <= object.gid) {
          sprite.loadTexture(tileset.name, object.gid - tileset.firstgid);
        }
      }
      sprite.anchor.set(0, 1);
    }
  }

  export function moveAnchor(sprite:any, x:number, y=x) {
    sprite.position.x -= sprite.width * sprite.anchor.x;
    sprite.position.y -= sprite.height * sprite.anchor.y;
    sprite.anchor.set(x, y);
    sprite.position.x += sprite.width * sprite.anchor.x;
    sprite.position.y += sprite.height * sprite.anchor.y;
  }

  export function decodeProperties(from:Object, to:Object={}) {
    var key:string;
    for (key in from) {
      try {
        to[key] = JSON.parse(from[key]);
      } catch(err) {
        to[key] = from[key];
      }
    }
    return to;
  }

  export function mergeObjects(from:Object, to:Object) {
    var key:string;
    for (key in from) {
      if (typeof from[key] === typeof to[key]) {
        if (from[key] instanceof Array && to[key] instanceof Array) {
          to[key].splice(to[key].length, 0, ...from[key]);
        } else if (typeof to[key] === "object") {
          MapUtils.mergeObjects(from[key], to[key]);
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
    return to;
  }
}
export = MapUtils;
