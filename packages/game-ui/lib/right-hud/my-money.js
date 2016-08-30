"use strict";

function MyMoney(player) { // and I need it now
  this.Container_constructor();

  this._addMoney(player);
}

var p = createjs.extend(MyMoney, createjs.Container);

p._addMoney = function(player) {
  this.player = player;
  this.label = new createjs.Text("", "bold 18px 'DC Card Header'", "black");
  this.updateMoney();

  this.addChild(this.label);
};

p.updateMoney = function() {
  this.label.text = "Money: $" + this.player.money;
};

module.exports = createjs.promote(MyMoney, "Container");