/* global createjs */
/* strict: global */
"use strict";

var PADDING = 20,
    CHOICE_WIDTH = 300,
    CHOICE_HEIGHT = 200;

var q               = require("q"),
    _               = require("lodash"),
    RpsMoves        = require("dc-constants").RpsMoves,
    consts          = require("../constants"),
    ModalBackground = require("../modal-background"),
    RpsChoice       = require("./rps-choice"),
    RpsCountdown    = require("./rps-countdown");

function RpsResults(users, myChoice) {
  this.Container_constructor();

  this.setup(users, myChoice);
}

var p = createjs.extend(RpsResults, createjs.Container);

p.setup = function(users, myChoice) {
  this.userIds = _.map(users, "player.id");

  var title = createTitle();
  var titleHeight = title.getBounds().height;

  var nameHeaderHeight = this.drawNameHeaders(users, titleHeight);
  this.drawMyChoice(myChoice, PADDING * 3 + titleHeight + nameHeaderHeight);
  this.drawCountdowns(users.length, PADDING * 3 + titleHeight + nameHeaderHeight);

  var containerWidth = PADDING * 2 + users.length * CHOICE_WIDTH;
  var containerHeight = PADDING * 4 + titleHeight + nameHeaderHeight + CHOICE_HEIGHT;

  this.drawTitle(title, containerWidth);

  this.setBounds(0, 0, containerWidth, containerHeight);
  this.regX = containerWidth / 2;
  this.regY = containerHeight / 2;
  this.drawBackground(containerWidth, containerHeight);
};

p.drawNameHeaders = function(users, titleHeight) {
  var textHeight = 0;

  users.forEach(function(user, index) {
    var text = new createjs.Text(user.name, "24px 'DC Card Header'", consts.headerColor);
    var textBounds = text.getBounds();
    text.x = PADDING + (CHOICE_WIDTH / 2 - textBounds.width / 2) + CHOICE_WIDTH * index;
    text.y = PADDING * 2 + titleHeight;
    textHeight = textBounds.height;
    this.addChild(text);
  }.bind(this));

  return textHeight;
};

p.drawMyChoice = function(choice, yOffset) {
  this.myChoiceDisp = new RpsChoice(choiceIdToKey(choice));
  this.myChoiceDisp.x = PADDING;
  this.myChoiceDisp.y = yOffset;
  this.addChild(this.myChoiceDisp);
};

p.drawCountdowns = function(numPlayers, yOffset) {
  this.countdowns = [];

  for(var i = 1; i < numPlayers; ++i) { // start from 1 to skip current player
    var countdown = new RpsCountdown();
    countdown.x = PADDING + CHOICE_WIDTH * i;
    countdown.y = yOffset;
    this.addChild(countdown);

    this.countdowns.push(countdown);
  }
};

p.setAnswers = function(answers, survivors) {
  var yOffset = this.myChoiceDisp.y;

  this.removeChild(this.myChoiceDisp);
  this.countdowns.forEach(function(countdown) {
    this.removeChild(countdown);
  }.bind(this));

  answers.forEach(function(answer) {
    var playerIndex = this.findPlayerIndexById(answer.playerId);
    var isSurvivor = survivors.includes(answer.playerId);
    this.drawAnswerAtIndex(playerIndex, answer.move, isSurvivor, yOffset);
  }.bind(this));
};

p.drawAnswerAtIndex = function(index, move, isSurvivor, yOffset) {
  var rpsChoice = new RpsChoice(choiceIdToKey(move));
  rpsChoice.x = PADDING + CHOICE_WIDTH * index;
  rpsChoice.y = yOffset;
  if(isSurvivor)
    rpsChoice.highlight();
  this.addChild(rpsChoice);
};

p.findPlayerIndexById = function(playerId) {
  return this.userIds.indexOf(playerId);
};

function choiceIdToKey(choiceId) {
  var choiceMap = {
    1: "rock",
    2: "paper",
    3: "scissors"
  };
  return choiceMap[choiceId];
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
  this.addChildAt(new ModalBackground(containerWidth, containerHeight), 0);
};

module.exports = createjs.promote(RpsResults, "Container");