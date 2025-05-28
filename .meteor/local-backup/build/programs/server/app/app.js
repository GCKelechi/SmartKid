Package["core-runtime"].queue("null",function () {/* Imports for global scope */

ECMAScript = Package.ecmascript.ECMAScript;
MongoInternals = Package.mongo.MongoInternals;
Mongo = Package.mongo.Mongo;
Blaze = Package.blaze.Blaze;
UI = Package.blaze.UI;
Handlebars = Package.blaze.Handlebars;
meteorInstall = Package.modules.meteorInstall;
Promise = Package.promise.Promise;
HTML = Package.htmljs.HTML;

var require = meteorInstall({"imports":{"startup":{"server":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/startup/server/index.js                                                         //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let Meteor;
    module1.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    let UserProgress;
    module1.link("../../api/userProgress.js", {
      UserProgress(v) {
        UserProgress = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // Adjust path if needed

    Meteor.startup(() => {
      console.log('Server is running...');
      if (UserProgress.find().count() === 0) {
        UserProgress.insert({
          childId: 'child1',
          progress: 0
        });
        UserProgress.insert({
          childId: 'child2',
          progress: 0
        });
        UserProgress.insert({
          childId: 'child3',
          progress: 0
        });
        UserProgress.insert({
          childId: 'child1',
          module: 'Baby Play',
          progress: 75
        });
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////

}}},"api":{"userProgress.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/userProgress.js                                                             //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      UserProgress: () => UserProgress
    });
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const UserProgress = new Mongo.Collection('userProgress');
    // Optional: Add a schema or helper functions if needed later
    // Example helper (to be used on the server or client)
    UserProgress.helpers({
      displayName() {
        return "Progress for ".concat(this.childId);
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// server/main.js                                                                          //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module1.export({
      UserProgress: () => UserProgress
    });
    let Meteor;
    module1.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    let Mongo;
    module1.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 1);
    module1.link("../imports/startup/server");
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const UserProgress = new Mongo.Collection('userProgress');
    Meteor.startup(() => {
      // Code to run on server startup
      console.log('Server is running...');

      // Initialize some data if the collection is empty
      if (UserProgress.find().count() === 0) {
        UserProgress.insert({
          childId: 'child1',
          progress: 0
        });
        UserProgress.insert({
          childId: 'child2',
          progress: 0
        });
        UserProgress.insert({
          childId: 'child3',
          progress: 0
        });

        // Example of saving specific module progress
        UserProgress.insert({
          childId: 'child1',
          module: 'Baby Play',
          progress: 75 // percentage
        });
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/server/main.js"
  ]
}});

//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zdGFydHVwL3NlcnZlci9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvdXNlclByb2dyZXNzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvbWFpbi5qcyJdLCJuYW1lcyI6WyJNZXRlb3IiLCJtb2R1bGUxIiwibGluayIsInYiLCJVc2VyUHJvZ3Jlc3MiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsInN0YXJ0dXAiLCJjb25zb2xlIiwibG9nIiwiZmluZCIsImNvdW50IiwiaW5zZXJ0IiwiY2hpbGRJZCIsInByb2dyZXNzIiwibW9kdWxlIiwiX19yZWlmeV9hc3luY19yZXN1bHRfXyIsIl9yZWlmeUVycm9yIiwic2VsZiIsImFzeW5jIiwiZXhwb3J0IiwiTW9uZ28iLCJDb2xsZWN0aW9uIiwiaGVscGVycyIsImRpc3BsYXlOYW1lIiwiY29uY2F0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLElBQUlBLE1BQU07SUFBQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUMsZUFBZSxFQUFDO01BQUNGLE1BQU1BLENBQUNHLENBQUMsRUFBQztRQUFDSCxNQUFNLEdBQUNHLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJQyxZQUFZO0lBQUNILE9BQU8sQ0FBQ0MsSUFBSSxDQUFDLDJCQUEyQixFQUFDO01BQUNFLFlBQVlBLENBQUNELENBQUMsRUFBQztRQUFDQyxZQUFZLEdBQUNELENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJRSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVsSzs7SUFFMURMLE1BQU0sQ0FBQ00sT0FBTyxDQUFDLE1BQU07TUFDbkJDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLHNCQUFzQixDQUFDO01BRW5DLElBQUlKLFlB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UUFDckNOLFlBQVksQ0FBQ08sTUFBTSxDQUFDO1VBQUVDLE9BQU8sRUFBRSxRQUFRO1VBQUVDLFFBQVEsRUFBRTtRQUFFLENBQUMsQ0FBQztRQUN2RFQsWUFBWSxDQUFDTyxNQUFNLENBQUM7VUFBRUMsT0FBTyxFQUFFLFFBQVE7VUFBRUMsUUFBUSxFQUFFO1FBQUUsQ0FBQyxDQUFDO1FBQ3ZEVCxZQUFZLENBQUNPLE1BQU0sQ0FBQztVQUFFQyxPQUFPLEVBQUUsUUFBUTtVQUFFQyxRQUFRLEVBQUU7UUFBRSxDQUFDLENBQUM7O1FBRXZEO1FBQ0FULFlBQVksQ0FBQ08sTUFBTSxDQUFDO1VBQ2xCQyxPQUFPLEVBQUUsUUFBUTtVQUNqQkUsTUFBTSxFQUFFLFdBQVc7VUFDbkJELFFBQVEsRUFBRSxFQUFFLENBQUM7UUFDZixDQUFDLENBQUM7TUFDSjtJQUNGLENBQUMsQ0FBQztJQUFDRSxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHIiwiZmlsZSI6Ii9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnRzL3N0YXJ0dXAvc2VydmVyL2luZGV4LmpzXG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFVzZXJQcm9ncmVzcyB9IGZyb20gJy4uLy4uL2FwaS91c2VyUHJvZ3Jlc3MuanMnOyAvLyBBZGp1c3QgcGF0aCBpZiBuZWVkZWRcblxuTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICBjb25zb2xlLmxvZygnU2VydmVyIGlzIHJ1bm5pbmcuLi4nKTtcblxuICBpZiAoVXNlclByb2dyZXNzLmZpbmQoKS5jb3VudCgpID09PSAwKSB7XG4gICAgVXNlclByb2dyZXNzLmluc2VydCh7IGNoaWxkSWQ6ICdjaGlsZDEnLCBwcm9ncmVzczogMCB9KTtcbiAgICBVc2VyUHJvZ3Jlc3MuaW5zZXJ0KHsgY2hpbGRJZDogJ2NoaWxkMicsIHByb2dyZXNzOiAwIH0pO1xuICAgIFVzZXJQcm9ncmVzcy5pbnNlcnQoeyBjaGlsZElkOiAnY2hpbGQzJywgcHJvZ3Jlc3M6IDAgfSk7XG5cbiAgICBVc2VyUHJvZ3Jlc3MuaW5zZXJ0KHtcbiAgICAgIGNoaWxkSWQ6ICdjaGlsZDEnLFxuICAgICAgbW9kdWxlOiAnQmFieSBQbGF5JyxcbiAgICAgIHByb2dyZXNzOiA3NVxuICAgIH0pO1xuICB9XG59KTtcbiIsImltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcblxuLy8gRGVmaW5lIHRoZSBNb25nbyBjb2xsZWN0aW9uXG5leHBvcnQgY29uc3QgVXNlclByb2dyZXNzID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3VzZXJQcm9ncmVzcycpO1xuXG4vLyBPcHRpb25hbDogQWRkIGEgc2NoZW1hIG9yIGhlbHBlciBmdW5jdGlvbnMgaWYgbmVlZGVkIGxhdGVyXG4vLyBFeGFtcGxlIGhlbHBlciAodG8gYmUgdXNlZCBvbiB0aGUgc2VydmVyIG9yIGNsaWVudClcblVzZXJQcm9ncmVzcy5oZWxwZXJzKHtcbiAgZGlzcGxheU5hbWUoKSB7XG4gICAgcmV0dXJuIGBQcm9ncmVzcyBmb3IgJHt0aGlzLmNoaWxkSWR9YDtcbiAgfVxufSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcbi8vIHNlcnZlci9tYWluLmpzXG5pbXBvcnQgJy4uL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXInO1xuLy8gQ3JlYXRlIGEgY29sbGVjdGlvbiBmb3IgdXNlciBwcm9ncmVzc1xuZXhwb3J0IGNvbnN0IFVzZXJQcm9ncmVzcyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCd1c2VyUHJvZ3Jlc3MnKTtcblxuTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICAvLyBDb2RlIHRvIHJ1biBvbiBzZXJ2ZXIgc3RhcnR1cFxuICBjb25zb2xlLmxvZygnU2VydmVyIGlzIHJ1bm5pbmcuLi4nKTtcblxuICAvLyBJbml0aWFsaXplIHNvbWUgZGF0YSBpZiB0aGUgY29sbGVjdGlvbiBpcyBlbXB0eVxuICBpZiAoVXNlclByb2dyZXNzLmZpbmQoKS5jb3VudCgpID09PSAwKSB7XG4gICAgVXNlclByb2dyZXNzLmluc2VydCh7IGNoaWxkSWQ6ICdjaGlsZDEnLCBwcm9ncmVzczogMCB9KTtcbiAgICBVc2VyUHJvZ3Jlc3MuaW5zZXJ0KHsgY2hpbGRJZDogJ2NoaWxkMicsIHByb2dyZXNzOiAwIH0pO1xuICAgIFVzZXJQcm9ncmVzcy5pbnNlcnQoeyBjaGlsZElkOiAnY2hpbGQzJywgcHJvZ3Jlc3M6IDAgfSk7XG5cbiAgICAvLyBFeGFtcGxlIG9mIHNhdmluZyBzcGVjaWZpYyBtb2R1bGUgcHJvZ3Jlc3NcbiAgICBVc2VyUHJvZ3Jlc3MuaW5zZXJ0KHtcbiAgICAgIGNoaWxkSWQ6ICdjaGlsZDEnLFxuICAgICAgbW9kdWxlOiAnQmFieSBQbGF5JyxcbiAgICAgIHByb2dyZXNzOiA3NSAvLyBwZXJjZW50YWdlXG4gICAgfSk7XG4gIH1cbn0pO1xuIl19
