"use strict";

function CardDisplay(dispObj) {
  this.Container_constructor();

  this._dispObj = addShadow(dispObj);
  this.addChild(this._dispObj);
  this._updateBounds();
}

var p = createjs.extend(CardDisplay, createjs.Container);

p._updateBounds = function() {
  var bounds = this._dispObj.getBounds();
  this.setBounds(0, 0, bounds.width, bounds.height);
  this.regX = bounds.width / 2;
  this.regY = bounds.height / 2;
};

function addShadow(dispObj) {
  dispObj.shadow = new createjs.Shadow("#807E73", 2, 2, 5);
  return dispObj;
}

p.highlight = function() {
  this._dispObj.shadow = new createjs.Shadow("#32c9fb", 0, 0, 40);
};

p.unhighlight = function() {
  addShadow(this._dispObj);
};

module.exports = createjs.promote(CardDisplay, "Container");