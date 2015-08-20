"use strict";

var q = require("q");

function loadUser(userId) {
  var deferred = q.defer();

  FB.api("/" + userId,
    {
      fields: [ "id", "first_name", "name", "picture" ]
    },
    function(response) {
      if(response.error) {
        deferred.reject(response.error);
        return;
      }

      var user = new User(response);
      deferred.resolve(user);
    }
  );

  return deferred.promise;
}

function User($response) {
  var id = $response.id;
  var name = $response.name;
  var firstName = $response.firstName;
  var imgSrc = $response.picture.data.url;
  $response = null;

  Object.defineProperties(this, {
    id: {
      enumerable: true,
      get: function() { return id; }
    },
    name: {
      enumerable: true,
      get: function() { return name; }
    },
    imgSrc: {
      enumerable: true,
      get: function() { return imgSrc; }
    },
    firstName: {
      enumerable: true,
      get: function() { return firstName; }
    }
  });
}

module.exports = loadUser;