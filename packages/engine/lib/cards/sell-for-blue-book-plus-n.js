"use strict";

var needsCar = require("./mixins/needs-car");

function SellForBlueBookPlusN(n) {
  function play(player, gameData, choiceProvider) {
    return choiceProvider.chooseOwnCar(gameData, player)
      .then(sellCar.bind(player));
  }
  this.play = play;

  function sellCar(player, car) {
    if(!car) return; // user cancelled/no car chosen

    player.credit(player.blueBook.getPrice(car));
    player.lose(car);
  }

  var canPlay = needsCar;
  this.canPlay = canPlay;
}

module.exports = SellForBlueBookPlusN;