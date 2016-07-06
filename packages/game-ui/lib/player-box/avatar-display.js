/* global createjs */
/* strict: global */
"use strict";

var IMAGE_WIDTH  = 100,
    IMAGE_HEIGHT = 100;

function AvatarDisplay(user) {
  this.Container_constructor();

  this.setup(user);
}

var p = createjs.extend(AvatarDisplay, createjs.Container);

p.setup = function(user) {
  // Consider the bounds of the object to be the picture. Put
  // the reg point at the center.
  this.setBounds(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  this.regX = 50;
  this.regY = 50;

  if(user.imgSrc) {
    this._addUserImage(user.imgSrc);
  } else {
    this._addPlaceholderRect();
  }

  var text = new createjs.Text(user.name, "bold 16px 'DC Card Header'", "black");
  text.textAlign = "center";
  text.textBaseline = "bottom";
  text.x = 50;
  text.y = -10;
  this.addChild(text);
};

p._addPlaceholderRect = function() {
  var rect = new createjs.Shape();
  rect.graphics
    .beginFill("#CCC")
    .beginStroke("#444")
    .drawRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  this.addChild(rect);
};

p._addUserImage = function(imgSrc) {
  var bmp = new createjs.Bitmap(imgSrc);
  bmp.image.addEventListener("load", function() {
    var bounds = bmp.getBounds();
    var rect = new createjs.Shape();
    rect.graphics
      .beginStroke("#777")
      .drawRect(bounds.x - 1, bounds.x - 1, bounds.width + 2, bounds.width + 2);
    this.addChild(rect);
  }.bind(this));
  this.addChild(bmp);
};

module.exports = createjs.promote(AvatarDisplay, "Container");