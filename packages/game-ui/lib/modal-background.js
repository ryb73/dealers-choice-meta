/* global createjs */
/* strict: global */
"use strict";

function ModalBackground(width, height) {
  this.Container_constructor();

  this.setup(width, height);
}

var p = createjs.extend(ModalBackground, createjs.Container);

p.setup = function(width, height) {
  var rect = new createjs.Shape();
  rect.graphics
    .beginFill("rgba(255, 249, 229, 0.75)")
    .drawRect(0, 0, width, height);
  this.addChild(rect);
};

module.exports = createjs.promote(ModalBackground, "Container");