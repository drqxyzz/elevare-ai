const { auth0 } = require('./src/lib/auth0');

console.log('Has handleProfile?', !!auth0.handleProfile);
console.log('Has handleCallback?', !!auth0.handleCallback);
console.log('Has handleLogin?', !!auth0.handleLogin);
console.log('Has handleLogout?', !!auth0.handleLogout);

if (auth0.authClient) {
    console.log('authClient.handleProfile?', !!auth0.authClient.handleProfile);
    console.log('authClient.handleCallback?', !!auth0.authClient.handleCallback);
}
