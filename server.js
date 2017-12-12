require('console.table');
const path = require('path');
const gateway = require('express-gateway');
const idGen = require('uuid-base62');

const services = require('express-gateway/lib/services');
const credentialService = services.credential;
const userService = services.user;
const appService = services.application;

const appCredential = { secret: idGen.v4() };

credentialService.insertScopes(['read', 'write'])
  .then(() => userService.insert({
    username: idGen.v4(),
    firstname: 'Clark',
    lastname: 'Kent',
    email: 'test@example.com'
  }))
  .then((user) => Promise.all([user, credentialService.insertCredential(user.id, 'basic-auth', {})]))
  .then(([user, cred]) => {console.table('User credentials', [cred]); return user;})
  .then((user) => appService.insert({ name: 'appy', 'redirectUri': 'http://haha.com' }, user.id))
  .then((app) => credentialService.insertCredential(app.id, 'oauth2', appCredential))
  .then(credential => credentialService.addScopesToCredential(credential.id, 'oauth2', ['read', 'write']).then(() => credential))
  .then(credential => Object.assign(appCredential, credential))
  .then((credential) => {
    console.table('Application credentials',[credential]);
    gateway().load(path.join(__dirname, 'config')).run()
  });

// Sample token: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1rVkJSa0ZFTkVGRVJVRXdNVVEyTURrNE1EazJNRVJETWpCR05FUTVPREEyTnpFeVF6QkZSUSJ9.eyJpc3MiOiJodHRwczovL2ZldGlzaC5hdXRoMC5jb20vIiwic3ViIjoiUnA1RzEyYktpWTlrSWJZMFZkdmFzYklrQk9kNmJHcUtAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vZmV0aXNoLmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNTEzMDgyNDQwLCJleHAiOjE1MTMxNjg4NDAsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.XNKOEnZuO_2ze4B9IePb3LANE8bjT6LQ1-bRrl0Ka2nDY3Z3ppi5wEbj7pqrdJ7dquzvmIdjQl3YwaamVbkuK5Myr6UGSQ1954syJx2GpWFtwoLZsdO3DDdpSmixYmUtpZG9MaEZ8Kx84cKBlmAje38qNfKn-40Ar72qTCYLXhpW-lIe7LbdCnd-0vB4WzAozm7wgfS05kjf6KGTcf5IbKhazbAD_wlugDIIbCo1Ewv6_uTTPYy8FiRlfuIBz1VMAzH8r2EDdqBI2tjUwfRC1X3ZY13Dr4vJ93YBQbB6cjb-dbZgCOTlPVsxjGuHmnfiQDtNIPKxb7pM02QrgifnBQ