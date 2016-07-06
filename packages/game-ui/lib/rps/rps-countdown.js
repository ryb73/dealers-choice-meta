/* global createjs */
/* strict: global */
"use strict";

var WIDTH  = 300,
    HEIGHT = 200;

var q      = require("q"),
    consts = require("../constants");

function RpsCountdown() {
  this.Container_constructor();

  this.setup();
}

var p = createjs.extend(RpsCountdown, createjs.Container);

p.setup = function() {
  this.setBounds(0, 0, WIDTH, HEIGHT);

  this.drawNum(3)
    .then(this.drawNum.bind(this, 2))
    .done(this.drawNum.bind(this, 1));
};

p.drawNum = function(num) {
  var text = new createjs.Text(num, "108px 'DC Card Header'", consts.headerColor);
  var textBounds = text.getBounds();
  text.x = WIDTH / 2 - textBounds.width / 2;
  text.y = HEIGHT / 2 - textBounds.height / 2;
  this.addChild(text);

  return q.delay(1000)
    .tap(function() {
      this.removeChild(text);
    }.bind(this));
};

module.exports = createjs.promote(RpsCountdown, "Container");