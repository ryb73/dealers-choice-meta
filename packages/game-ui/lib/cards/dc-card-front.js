"use strict";

var CardDisplay = require("./card-display"),
    consts      = require("../constants"),
    assets      = require("../assets");

function DcCardFront(dcCard, fullSize) {
  this.CardDisplay_constructor(drawCard(dcCard, fullSize));
}

function drawCard(dcCard, fullSize) {
  var blankBg = new createjs.Bitmap(assets.dcCardBlank);
  var bounds = blankBg.getBounds();

  var title = new createjs.Text(dcCard.title.toUpperCase(),
    "36px 'DC Card Header'", "#53412b");
  title.lineWidth = bounds.width - 32;
  title.x = 16;
  title.y = 10;

  var description = new createjs.Text(dcCard.description,
    "18px 'DC Card Body'", "#53412b");
  description.lineWidth = bounds.width - 32;
  description.x = 16;
  description.y = 90;

  var innerContainer = new createjs.Container();
  innerContainer.addChild(blankBg);
  innerContainer.addChild(title);
  innerContainer.addChild(description);

  var width = (fullSize) ? consts.cardBreadth : consts.cardBreadthSm;
  var height = (fullSize) ? consts.cardLength : consts.cardLengthSm;
  innerContainer.scaleX = width / bounds.width;
  innerContainer.scaleY = height / bounds.height;

  // Protect the inner container from being modified by the outside
  var outerContainer = new createjs.Container();
  outerContainer.addChild(innerContainer);

  // Cache so that shadow doesn't get applied to children
  outerContainer.cache(0, 0, bounds.width, bounds.height);

  return outerContainer;
}

createjs.extend(DcCardFront, CardDisplay);

module.exports = createjs.promote(DcCardFront, "CardDisplay");