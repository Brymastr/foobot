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
      console.dir(profile)
      console.dir(accessToken)
      console.dir(req.query.code)
      // TODO: Get user id from request somehow
      // usersController.getUser(req.params.user_id, user => {
      //   user.facebook_id = profile.id;
      //   user.facebook_token = accessToken;
      //   user.save((err, doc) => {done(err, doc)})
      // });
      done('Facebook auth not complete');
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

