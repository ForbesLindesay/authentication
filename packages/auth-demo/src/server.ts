import GoogleAuthentication from '@authentication/google';
import express = require('express');
const app: express.Express = express();

const googleAuthentication = new GoogleAuthentication({
  callbackURL: '/__/auth/google',
});

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url);
  console.dir(req.headers);
  next();
});
app.get('/__/auth/google', async (req, res, next) => {
  try {
    if (!googleAuthentication.isCallbackRequest(req)) {
      const url = await googleAuthentication.authenticateInit(req);
      return res.redirect(url.href);
    }
    if (googleAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken,
      refreshToken,
      profile,
    } = await googleAuthentication.authenticateCallback(req);
    console.log({accessToken, refreshToken});
    res.json(profile);
  } catch (ex) {
    next(ex);
  }
});
export default app;
