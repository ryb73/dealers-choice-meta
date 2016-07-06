/* global createjs */
/* strict: global */
"use strict";

var WIDTH  = 300,
    HEIGHT = 200;

var assets = require("../assets");

function RpsChoice(choiceKey) {
  this.Container_constructor();

  this.setup(choiceKey);
}

var p = createjs.extend(RpsChoice, createjs.Container);

p.setup = function(choiceKey) {
  this.setBounds(0, 0, WIDTH, HEIGHT);

  this.setUpMainBitmap(choiceKey);
  this.setUpHoverBitmap(choiceKey);
  this.setUpHitArea();
};

p.setUpMainBitmap = function(choiceKey) {
  this.mainBmp = new createjs.Bitmap(assets[choiceKey]);
  this.mainBmp.x = (WIDTH - this.mainBmp.getBounds().width) / 2;
  this.addChild(this.mainBmp);
};

p.setUpHoverBitmap = function(choiceKey) {
  this.hoverBmp = new createjs.Bitmap(assets[choiceKey + "-hover"]);
  this.hoverBmp.x = (WIDTH - this.hoverBmp.getBounds().width) / 2;
  this.hoverBmp.visible = false;
  this.addChild(this.hoverBmp);
};

p.mouseOver = function() {
    this.hoverBmp.visible = true;
    this.mainBmp.visible = false;
};

p.mouseOut = function() {
    this.hoverBmp.visible = false;
    this.mainBmp.visible = true;
};

p.setUpHitArea = function() {
    var rect = new createjs.Shape();
    rect.graphics
        .beginFill("#000")
        .drawRect(0, 0, WIDTH, HEIGHT);
    this.hitArea = rect;
};

module.exports = createjs.promote(RpsChoice, "Container");