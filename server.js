require('console.table');
const path = require('path');
const gateway = require('express-gateway');
const services = require('express-gateway/lib/services');

services.user.insert(
{
	"username": "vncz",
	"firstname": "Vincenzo",
	"lastname": "Chianese",
	"email": "test@foo.com"
}).then((user)=> {
  // console.table({username: user.username, id: user.id});
  return Promise.all([user, services.application.insert({
	"name": "my-app",
	"redirectUri": "http://example.com"
  }, user.id)])
}).then(([user, app])=>{
  // console.table([{id: app.id, name: app.name, redirectUri: app.redirectUri}])
  
  return Promise.all([
    services.credential.insertCredential(user.id, 'basic-auth'),
    services.credential.insertCredential(app.id, 'oauth2'),
  ]);
}).then((credentials)=>{
  // console.table(credentials.map((c)=>({id: c.id, password: c.password||c.secret})));
  gateway().load(path.join(__dirname, 'config')).run();
});