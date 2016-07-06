/* global createjs */
/* strict: global */
"use strict";

var PADDING = 20;

var q               = require("q"),
    RpsMoves        = require("dc-constants").RpsMoves,
    consts          = require("../constants"),
    ModalBackground = require("../modal-background"),
    RpsChoice       = require("./rps-choice");

function RpsPrompt() {
  this.Container_constructor();

  this.setup();
}

var p = createjs.extend(RpsPrompt, createjs.Container);

p.setup = function() {
  this.defAnswer = q.defer();

  var choices = this.createChoices();

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

p.createChoices = function() {
  var choices = {
    rock: new RpsChoice("rock"),
    paper: new RpsChoice("paper"),
    scissors: new RpsChoice("scissors")
  };

  choices.rock.on("mouseover", choices.rock.highlight);
  choices.rock.on("mouseout", choices.rock.unhighlight);
  choices.rock.on("click", this.optionSelected.bind(this, RpsMoves.Rock));
  choices.rock.cursor = "pointer";

  choices.paper.on("mouseover", choices.paper.highlight);
  choices.paper.on("mouseout", choices.paper.unhighlight);
  choices.paper.on("click", this.optionSelected.bind(this, RpsMoves.Paper));
  choices.paper.cursor = "pointer";

  choices.scissors.on("mouseover", choices.scissors.highlight);
  choices.scissors.on("mouseout", choices.scissors.unhighlight);
  choices.scissors.on("click", this.optionSelected.bind(this, RpsMoves.Scissors));
  choices.scissors.cursor = "pointer";

  return choices;
};

p.optionSelected = function(selection) {
  this.defAnswer.resolve(selection);
};

p.getSelection = function() {
  return this.defAnswer.promise;
};

function createTitle() {
  return new createjs.Text("ROCK PAPER SCISSORS", "36px 'DC Card Header'", consts.headerColor);
}

p.drawTitle = function(text, containerWidth) {
  text.x = containerWidth / 2 - text.getBounds().width / 2;
  text.y = PADDING;
  this.addChild(text);
};

p.drawBackground = function(containerWidth, containerHeight) {
  this.addChild(new ModalBackground(containerWidth, containerHeight));
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