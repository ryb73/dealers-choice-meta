/* global createjs */
/* strict: global */
"use strict";

var PADDING = 20;

var assets    = require("../assets"),
    consts    = require("../constants"),
    RpsChoice = require("./rps-choice");

function RpsPrompt() {
  this.Container_constructor();

  this.setup();
}

var p = createjs.extend(RpsPrompt, createjs.Container);

p.setup = function() {
  var choices = createChoices();
  var title = createTitle();
  var titleHeight = title.getBounds().height;

  var choiceBounds = choices.rock.getBounds();
  var containerWidth = choiceBounds.width * 3 + PADDING * 2;
  var containerHeight = choiceBounds.height + PADDING * 3 + titleHeight;

  this.setBounds(0, 0, containerWidth, containerHeight);
  this.regX = containerWidth / 2;
  this.regY = containerHeight / 2;
  this.drawBackground(containerWidth, containerHeight);

  this.drawTitle(title, containerWidth);
  this.drawChoices(choices, titleHeight + PADDING);
};

function createChoices() {
  return {
    rock: new RpsChoice(assets.rock),
    paper: new RpsChoice(assets.paper),
    scissors: new RpsChoice(assets.scissors)
  };
}

function createTitle() {
  return new createjs.Text("ROCK PAPER SCISSORS", "36px 'DC Card Header'", consts.headerColor);
}

p.drawTitle = function(text, containerWidth) {
  text.x = containerWidth / 2 - text.getBounds().width / 2;
  text.y = PADDING;
  this.addChild(text);
};

p.drawBackground = function(containerWidth, containerHeight) {
  var rect = new createjs.Shape();
  rect.graphics
    .beginFill("rgba(255, 249, 229, 0.75)")
    .drawRect(0, 0, containerWidth, containerHeight);
  this.addChild(rect);
};

p.drawChoices = function(choices, yOffset) {
  choices.rock.x = PADDING;
  choices.rock.y = PADDING + yOffset;
  this.addChild(choices.rock);

  choices.paper.x = PADDING + choices.rock.getBounds().width;
  choices.paper.y = PADDING + yOffset;
  this.addChild(choices.paper);

  choices.scissors.x = PADDING + choices.rock.getBounds().width + choices.paper.getBounds().width;
  choices.scissors.y = PADDING + yOffset;
  this.addChild(choices.scissors);
};

module.exports = createjs.promote(RpsPrompt, "Container");