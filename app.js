var express = require('express')
var port = process.env.PORT||8989;
var bodyParser = require('body-parser')
var app = express()
var multer = require('multer')
var randomstring = require('randomstring')
var fcm = require('fcm-node')
var passport = require('passport')
var FacebookStrategy = require('passport-facebook-token')
var db = require('./mongo/database')

app.use(bodyParser.urlencoded({
    extended : false
}))

app.use(bodyParser.json())
app.use(express.static('public'))
app.use('/card_img',express.static('card_img'))
app.use('/profile_img', express.static('profile_img'))
app.use(express.static('views'))

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

require('./routes/auth')(app, db, randomstring, port)
require('./routes/facebook')(app, db, passport, FacebookStrategy, port, randomstring)
require('./routes/card')(app, multer, db)
require('./routes/feed')(app, db)
require('./routes/self')(app, db)
require('./routes/user')(app, db)

app.listen(port, ()=>{
    console.log('Server Running At '+port+' Port!')
})

