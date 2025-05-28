var require = meteorInstall({"client":{"main.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// client/main.js                                                    //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
var Meteor;
module.link("meteor/meteor", {
  Meteor: function (v) {
    Meteor = v;
  }
}, 0);
module.link("../imports/ui/body.js");
module.link("../imports/ui/babyMode.js");
module.link("../imports/ui/explorerMode.js");
module.link("../imports/ui/juniorMode.js");
// Correct path to juniorMode.js

Meteor.startup(function () {
  console.log('Client is running...');
});
///////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".html"
  ]
});

require("/client/main.js");