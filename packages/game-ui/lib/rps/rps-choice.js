/* global createjs */
/* strict: global */
"use strict";

var WIDTH  = 300,
    HEIGHT = 200;

function RpsChoice(img) {
  this.Container_constructor();

  this.setup(img);
}

var p = createjs.extend(RpsChoice, createjs.Container);

p.setup = function(img) {
  this.setBounds(0, 0, WIDTH, HEIGHT);

  var bmp = new createjs.Bitmap(img);
  bmp.x = (WIDTH - bmp.getBounds().width) / 2;
  this.addChild(bmp);
};

module.exports = createjs.promote(RpsChoice, "Container");