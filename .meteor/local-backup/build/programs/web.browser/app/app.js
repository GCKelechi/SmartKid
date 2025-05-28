var require = meteorInstall({"client":{"main.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// client/main.js                                                    //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
module.link("../imports/ui/body.js");
module.link("../imports/ui/babyMode.js");
module.link("../imports/ui/explorerMode.js");
module.link("../imports/ui/juniorMode.js");
// Correct path to juniorMode.js

Meteor.startup(() => {
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