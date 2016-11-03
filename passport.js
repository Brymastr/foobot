const 
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  BearerStrategy = require('bearer-strategy').Strategy
  User = require('./models/User');

module.exports = (config, passport) => {

  passport.use(new FacebookStrategy({
      clientID: config.facebook.app_id,
      clientSecret: config.facebook.app_secret,
      callbackURL: config.url + '/auth/facebook/callback'
    }, (accessToken, refreshToken, profile, done) => {
      User.findOrCreate({facebook_id: profile.id}, (err, user) => {
        if(user) {
          user.facebook_token = accessToken;
          user.save((err, doc) => {
            done(err, doc);
          });
        } else {
          done(err, result);
        }
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

