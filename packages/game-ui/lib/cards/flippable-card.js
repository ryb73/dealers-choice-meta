"use strict";

function FlippableCard(back, front) {
  this.Container_constructor();

  back.x = back.regX;
  back.y = back.regY;
  front.x = front.regX;
  front.y = front.regY;
  this.addChild(back);

  this._back = back;
  this._front = front;
  this._updateBounds();
}

var p = createjs.extend(FlippableCard, createjs.Container);

p._updateBounds = function() {
  var bounds = this._back.getBounds();
  this.setBounds(0, 0, bounds.width, bounds.height);
  this.regX = bounds.width / 2;
  this.regY = bounds.height / 2;
};

// Only support back to front for now
p.flip = function(delay) {
  if(!delay) delay = 0;

  createjs.Tween.get(this._back)
    .to({ scaleX: 0 }, delay / 2)
    .call(this._flipToFront.bind(this, delay));
};

p._flipToFront = function(delay) {
  this._front.scaleX = 0;
  this.addChild(this._front);
  createjs.Tween.get(this._front)
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

module.exports = createjs.promote(FlippableCard, "Container");
