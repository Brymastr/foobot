const
  FacebookStrategy = require('passport-facebook').Strategy,
  BearerStrategy = require('passport-http-bearer').Strategy,
  usersController = require('./controllers/usersController');

module.exports = (config, passport) => {

  passport.use(new FacebookStrategy({
      clientID: config.facebook.app_id,
      clientSecret: config.facebook.app_secret,
      callbackURL: config.url + '/auth/facebook/callback',
      passReqToCallback: true,
      profileFields: ['id', 'birthday', 'email', 'first_name', 'last_name', 'gender', 'hometown']
    }, (req, accessToken, refreshToken, profile, done) => {
      let params = JSON.parse(decodeURIComponent(req.query.state));
      usersController.getUser(params.user_id, user => {
        if(user) {
          user.facebook_id = profile.id;
          user.facebook_token = accessToken;
          if(!user.first_name) user.first_name = profile.name.givenName;
          if(!user.last_name) user.last_name = profile.name.familyName;
          if(!user.gender) user.gender = profile.gender;
          user.save((err, doc) => {
            doc.chat_id = params.chat_id;
            // TODO: figure out what to do with the existing messages from this user. Maybe change messages so they have a platform_id instead of a mongo user_id
            usersController.consolidateUsers(doc, consolidated => done(null, consolidated));
          });
        } else {
          done();
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

