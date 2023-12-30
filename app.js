const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const tradeRoutes = require('./routes/tradesRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');

// create express app
const app = express();


// this is a test comment

// app configuration
let port = 7000;
let host = 'localhost';
let url = 'mongodb://localhost:27017/Trades';
app.set('view engine', 'ejs');

// connect to database
mongoose.connect(url,{useNewUrlParser: true, useUnifiedTopology:true}).then(()=>{app.listen(port, host, ()=>{
    console.log('Server is running on port', port);
})}).catch(err=>console.log(err));

// middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//session middleware
app.use(session({
    secret: 'vdfsiodfv2i4uqwejklwevsc8uiosdlkjw7vuiosd',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60*60*1000},
    store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/Trades'})
}));

// flash middleware
app.use(flash());

app.use((req, res, next)=>{
    console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages= req.flash('error');
    next();
})

// setup routes
app.use('/trades', tradeRoutes);
app.use('/', mainRoutes);
app.use('/users', userRoutes);

// error middleware.
app.use((req, res, next)=>{
    let err = new Error('The server cannot locate '+ req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) =>{
    if(!err.status) {
        err.status = 500;
        err.message = 'Internal server errror';
    }
    res.status(err.status);
    res.render('error', {error: err});
});