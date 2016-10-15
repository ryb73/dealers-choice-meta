"use strict";

var CardDisplay = require("./card-display"),
    consts      = require("../constants"),
    assets      = require("../assets");

function InsuranceFront(insurance, fullSize) {
  this.CardDisplay_constructor(drawCard(insurance, fullSize));
}

createjs.extend(InsuranceFront, CardDisplay);

function drawCard(insurance, fullSize) {
  var blankBg = new createjs.Bitmap(assets.insuranceBlank);
  var bounds = blankBg.getBounds();

  var innerContainer = new createjs.Container();
  innerContainer.addChild(blankBg);

  var title = createCenteredText(insurance.title.toUpperCase(), "32px 'Insurance Title'",
    bounds, (insurance.protection) ? 20 : 51);
  innerContainer.addChild(title);

  var subtitle = createCenteredText("insurance", "32px 'Insurance Subtitle'",
    bounds, title.y + 34);
  innerContainer.addChild(subtitle);

  var protectionType;
  if(insurance.protection) {
    var protectionLabel = createCenteredText("Protection against",
      "18px 'Insurance Subtitle'", bounds, subtitle.y + 54);
    innerContainer.addChild(protectionLabel);

    protectionType = createCenteredText(insurance.protection.toUpperCase(),
      "18px 'Insurance Protection'", bounds, protectionLabel.y + 18);
    innerContainer.addChild(protectionType);
  }

  var value = createCenteredText(insurance.value, "18px 'Insurance Subtitle'",
    bounds, 57 + ((insurance.protection) ? protectionType.y : subtitle.y));
  innerContainer.addChild(value);

  var width = (fullSize) ? consts.cardLength : consts.cardLengthSm;
  var height = (fullSize) ? consts.cardBreadth : consts.cardBreadthSm;
  innerContainer.scaleX = width / bounds.width;
  innerContainer.scaleY = height / bounds.height;

  // Protect the inner container from being modified by the outside
  var outerContainer = new createjs.Container();
  outerContainer.addChild(innerContainer);

  // Cache so that shadow doesn't get applied to children
  outerContainer.cache(0, 0, width, height);

  return outerContainer;
}

function createCenteredText(text, font, bounds, y) {
  var textObj = new createjs.Text(text, font, "#53412b");
  var textBounds = textObj.getBounds();
  textObj.x = bounds.width / 2 - textBounds.width / 2;
  textObj.y = y;
  return textObj;
}

module.exports = createjs.promote(InsuranceFront, "CardDisplay");