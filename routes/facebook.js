module.exports = facebook;

function facebook(app, db, passport, FacebookStrategy, port, randomstring) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done){
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    passport.use(new FacebookStrategy({
        clientID : '132480600677095',
        clientSecret : 'e0dcace8cf7df0776b5c0011a1579ece',
    }, (accessToken, refreshToken, profile, done)=>{
        console.log(profile)
        db.Users.findOne({
            facebook_id : profile.id
        }, (err, result)=>{
            if(err){
                console.log('Facebook Login Error!')
                res.status(500).send("DB Error")
                throw err
            }
            else if(!result){
                var token = randomstring.generate(15)
                var user = new db.Users({
                    email : profile.emails[0].value,
                    name : profile.name.familyName+profile.name.givenName,
                    token : token,
                    profile : "",
                    profile_img : 'http://soylatte.kr:'+port+'/img/'+token+'.jpg',
                    facebook_id : profile.id,
                    interest : "",
                    liked_card : [],
                    liked_editor : [],
                    like : 0,
                    alert : []
                })
                user.save((err)=>{
                    if(err){
                        console.log('Facebook Save Error!')
                        throw err
                    }
                    else{
                        console.log(profile.name.familyName+profile.name.givenName+" Facebook Login Success")
                        done(null, user)
                    }

                })
            }
            else if(result){
                done(null, result)
            }
        })

    }))

    app.get('/auth/facebook/token',
        passport.authenticate(passport.authenticate('facebook-token'), (req, res)=>{
            console.log("USER_TOKEN ==== "+req.param('access_token'))
            if(req.user){
                db.Users.findOne({
                    facebook_id : req.user.id
                },(err, result)=>{
                    if(err){
                        console.log('/auth/facebook/token userfind Error')
                        res.status(403).send('/auth/facebook/token userfine Error')
                        throw err
                    }
                    else if(result){
                        res.status(200).send(result)
                    }
                    else {
                        res.status(404).send('Data Not Founded')
                    }
                })
            }
            else if(!req.user){
                res.send(401, "Can't find User On Facebook. It May Be Unusable.");
            }

        })
    )

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/'
        }));

}