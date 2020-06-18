//PACKAGES		
var express 				= require("express"),
	app 					= express(),
	bodyParser 				= require("body-parser"),
	mongoose 				= require("mongoose"),
	passport 				= require("passport"),
	localStrategy 		  	= require("passport-local"),
	passportLocalMongoose 	= require("passport-local-mongoose"),
	Admin				 	= require("./models/admin"),
	Request					= require("./models/request"),
	Part					= require("./models/parts"),
	Car						= require("./models/cars"),
	methodOverride			= require("method-override"),
	dotenv					= require("dotenv"),
	flash 					= require("connect-flash"),
	partRoute				= require("./routes/parts"),
	mainRoute				= require("./routes/main"),
	authenticationRoute		= require("./routes/authentication");

dotenv.config();
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname +  "/public"));
app.use(methodOverride("_method"));
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

var url = process.env.DATABASEURL || 3000;
mongoose.connect(url);


//PASSPORT CONFIGURE

app.use(require("express-session")({
	secret: "Rusty",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.use(function(req, res, next){
	app.locals.currentUser = req.user;
	app.locals.error       = req.flash("error"),
	app.locals.success	   = req.flash("success");
	next();
});


app.use(partRoute);
app.use(mainRoute);
app.use(authenticationRoute);








app.listen(process.env.PORT || 3000, function(){
	console.log("Server started");
})