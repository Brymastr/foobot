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
          user.save((err, doc) => {
            doc.chat_id = params.chat_id;
            // TODO: if there is already an account with the same facebook id, remove this one and add all IDs to the other one. Then figure out what to do with the messages this account has sent
            done(null, doc);
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

