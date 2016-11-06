const 
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  BearerStrategy = require('passport-http-bearer').Strategy
  usersController = require('./controllers/usersController');

module.exports = (config, passport) => {

  passport.use(new FacebookStrategy({
      clientID: config.facebook.app_id,
      clientSecret: config.facebook.app_secret,
      callbackURL: config.url + '/auth/facebook/callback',
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
      done(null, {
        access_token: accessToken,
        refresh_token: refreshToken,
        facebook_id: profile.id,
        platform_id: JSON.parse(req.query.state).id
      });
    }
  ));

  passport.use(new BearerStrategy((token, done) => {
    User.findOne({facebook_token: token}, (err, user) => {
      if(err) return done(err);
      if(!user) return done(null, false);
      return done(null, user, {scope: 'all'})
    });
  }));

}

