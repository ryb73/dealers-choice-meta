/* global createjs */
/* strict: global */
"use strict";

var PADDING = 20,
    CHOICE_WIDTH = 300,
    CHOICE_HEIGHT = 200;

var _               = require("lodash"),
    oxfordJoin      = require("oxford-join"),
    RpsConclusion   = require("dc-constants").RpsConclusion,
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
  this.users = users;

  var title = createTitle();
  var titleHeight = title.getBounds().height;

  var nameHeaderHeight = this.drawNameHeaders(users, titleHeight);
  this.drawMyChoice(myChoice, PADDING * 3 + titleHeight + nameHeaderHeight);

  var containerWidth = PADDING * 2 + users.length * CHOICE_WIDTH;

  var resultRowHeight = this.addResultRow(
    containerWidth, PADDING * 4 + titleHeight + nameHeaderHeight + CHOICE_HEIGHT
  );

  var containerHeight = PADDING * 5 + titleHeight + nameHeaderHeight + CHOICE_HEIGHT + resultRowHeight;

  this.drawTitle(title, containerWidth);

  this.setBounds(0, 0, containerWidth, containerHeight);
  this.regX = containerWidth / 2;
  this.regY = containerHeight / 2;
  this.drawBackground(containerWidth, containerHeight);
};

p.addResultRow = function(containerWidth, yOffset) {
  this.resultRow = new createjs.Text("Placeholder", "24px 'DC Card Header'", consts.headerColor);
  var textBounds = this.resultRow.getBounds();
  this.resultRow.visible = false;
  this.resultRow.x = containerWidth / 2 - textBounds.width / 2;
  this.resultRow.y = yOffset;
  this.addChild(this.resultRow);
  return textBounds.height;
};

p.beginCountdown = function() {
  var yOffset = this.myChoiceDisp.y;
  this.drawCountdowns(this.users.length, yOffset);
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

p.setAnswers = function(answers, survivors, conclusion) {
  this.updateResultRow(survivors, conclusion);

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

p.updateResultRow = function(survivors, conclusion) {
  var newText;

  switch(conclusion) {
    case RpsConclusion.Winner:
      newText = this.getWinnerText(survivors);
      break;
    case RpsConclusion.ShowDown:
      newText = this.getShowdownText(survivors);
      break;
    case RpsConclusion.DoOver:
      newText = "No winners.";
      break;
    case RpsConclusion.NextRound:
      newText = this.getNextRoundText(survivors);
      break;
  }

  this.resultRow.text = newText;
  var textBounds = this.resultRow.getBounds();
  this.resultRow.x = this.getBounds().width / 2 - textBounds.width / 2;
  this.resultRow.visible = true;
};

p.getWinnerText = function(survivors) {
  var playerIndex = this.findPlayerIndexById(survivors[0]);
  var player = this.users[playerIndex];
  return player.name + " is the winner!";
};

p.getShowdownText = function(survivors) {
  var playerNames = survivors.map(function(survivor) {
    var playerIndex = this.findPlayerIndexById(survivor);
    var player = this.users[playerIndex];
    return player.name;
  });

  return oxfordJoin(playerNames) + " will show down.";
};

p.getNextRoundText = function(survivors) {
  var playerIndex = this.findPlayerIndexById(survivors[0]);
  var player = this.users[playerIndex];
  return player.name + " won this round.";
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
  return _.findIndex(this.users,
    { player: {
        id: playerId
      }
    }
  );
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