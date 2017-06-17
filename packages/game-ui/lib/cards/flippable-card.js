"use strict";

const FRONT = 1,
      BACK = 2;

function FlippableCard(back, front) {
  this.Container_constructor();

  back.x = back.regX;
  back.y = back.regY;
  this.addChild(back);

  front.x = front.regX;
  front.y = front.regY;
  front.scaleX = 0;
  this.addChild(front);

  this._back = back;
  this._front = front;
  this._orientation = BACK;
  this._updateBounds();
}

var p = createjs.extend(FlippableCard, createjs.Container);

p._updateBounds = function() {
  var bounds = this._back.getBounds();
  this.setBounds(0, 0, bounds.width, bounds.height);
  this.regX = bounds.width / 2;
  this.regY = bounds.height / 2;
};

p.flip = function(delay) {
  if(!delay) delay = 0;

  if(this._orientation === BACK) {
    createjs.Tween.get(this._back)
      .to({scaleX: 0}, delay / 2)
      .call(this._flipToFront.bind(this, delay));
  } else {
    createjs.Tween.get(this._front)
      .to({scaleX: 0}, delay / 2)
      .call(this._flipToBack.bind(this, delay));
  }
};

p._flipToFront = function(delay) {
  this._orientation = FRONT;
  createjs.Tween.get(this._front)
    .to({ scaleX: 1 }, delay / 2);
};

p._flipToBack = function(delay) {
  this._orientation = BACK;
  createjs.Tween.get(this._back)
    .to({ scaleX: 1 }, delay / 2);
};

p.highlight = function() {
  this._back.highlight();
  this._front.highlight();
};

p.unhighlight = function() {
  this._back.unhighlight();
  this._front.unhighlight();
};

p.isHighlighted = function() {
  return this._back.isHighlighted();
};

module.exports = createjs.promote(FlippableCard, "Container");
