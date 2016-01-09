"use strict";

var consts = require("./constants"),
    assets = require("./assets");

function BlueBook() {
  this.Container_constructor();

  this._addHolder();
}

var p = createjs.extend(BlueBook, createjs.Container);

p._addHolder = function() {
  var bmp = new createjs.Bitmap(assets.blueBookHolder);
  var bounds = bmp.getBounds();
  bmp.scaleX = bmp.scaleY = consts.cardLengthSm / bounds.width;

  this.addChild(bmp);
};

module.exports = createjs.promote(BlueBook, "Container");