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
  console.table([user]);
  return services.application.insert({
	"name": "my-app",
	"redirectUri": "http://example.com"
  }, user.id);
}).then((app)=>{
  console.table([app])
  
}).then(()=>{
  gateway().load(path.join(__dirname, 'config')).run();
});


