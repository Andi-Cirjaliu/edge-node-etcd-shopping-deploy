const express = require('express');
const path = require('path');

//read config
require('dotenv').config();
console.log('Environment: ', process.env.NODE_ENV);

const db = require('./dbController');
db.initDB();

const app = express();

// set rendering engine to ejs
app.set('view engine', 'ejs');
app.set('views', 'views');

// app.use(express.json());
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(require('./shoppingRouter'));
app.use(express.static(path.join(__dirname, 'public')));

app.use( ( req, res, next ) => {
    console.log('Unhandled request. url ', req.url, ', method ', req.method);
    res.status(404).json({message: 'Page could not be found'});
});

//Generic error handler
app.use(function (error, req, res, next) {
    console.error('An error occured: ', error);
    
    // console.log('get error info');
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    console.log('status: ', status, ', message: ', message, ', data: ', data);

    return res.status(status).json( { 
        message: message,
        data: data
    });

    // res.status(500).json({"msg": "An internal error occured"});
});
  
const PORT = process.env.PORT || 3000;

app.listen( PORT, () => {
    console.log('App listens on port ', PORT);
} )
