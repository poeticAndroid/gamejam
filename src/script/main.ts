"use strict";
import GameApp  = require("./_classes/GameApp");
import joypad   = require("./_classes/lib/joypad");

/**
 * main.ts
 * Main script for Shapeshift
 */
var game: GameApp,
    gameContainer: HTMLElement,
    information: HTMLElement;

function init() {
  gameContainer = document.getElementById("game");
  information = document.getElementsByTagName("article")[0];

  document.body.addEventListener("touchstart", setJoypad);
  game = window["game"] = new GameApp("game", true);
}

function setJoypad(e:TouchEvent) {
  console.log(e.target);
  if (e.target instanceof HTMLButtonElement) {
    joypad.suspend();
  } else if (gameContainer.contains(<Node>e.target)) {
    joypad.resume();
  } else {
    joypad.suspend();
  }
};

if (location.search === "?nojs") {
  let tags = document.getElementsByTagName("noscript");
  for (let i = 0; i < tags.length; i++) {
    let tag = document.createElement("span");
    tag.classList.add("noscript");
    tag.innerHTML = tags[i].innerHTML;
    tags[i].parentElement.insertBefore(tag, tags[i]);
  }
} else {
  addEventListener("DOMContentLoaded", init);
}
