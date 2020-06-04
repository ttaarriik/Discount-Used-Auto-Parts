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
	methodOverride			= require("method-override");


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
	next();
});



//ROUTES

app.get("/", function(req, res){
	res.render("home");
});

app.get("/contact", function(req, res){
	res.render("contact");
});

app.get("/partSearch", function(req, res){
	res.render("partSearch");
});

app.post("/partSearch", function(req, res){
	var searchedCar = req.body.carPart;
	Part.find(req.body.carPart, function(err, foundPart){
		if(err){
			console.log(err)
		}else {
			var noResults = {noResults: "No results are not found for " };
			res.render("showParts", {part: foundPart, noResults: noResults, searchedCar: searchedCar });
		}
	})
})
app.get("/showParts", function(req, res){
	Part.find({}, function(err, foundPart){
		if(err){
			cosole.log(err)
		}else {
			res.render("showParts", {part: foundPart});
		}
	})
})

app.get("/postParts", isLoggedIn, function(req, res){
	res.render("./admin/postParts");
});

app.post("/postParts", isLoggedIn, function(req, res){
	Part.create(req.body.carPart, function(err, createdCarPart){
		if(err){
			console.log(err);
		}else {
			res.redirect("/showParts");
		}
	})
})

app.get("/request", isLoggedIn, function(req, res){
	Request.find({}, function(err, found){
		if(err){
			console.log(err);
		}else {
			res.render("request", {info: found});
		}
	})
});

app.post("/request", function(req, res){
	Request.create(req.body.info, function(err, request){
		if(err){
			console.log(err)
		}else{
			res.redirect("/contact");
		}
	})
	
});

//DELETE ROUTES 
app.delete("/request/:id", isLoggedIn, function(req,res){
	Request.findByIdAndDelete(req.params.id, function(err, deletedReq){
		if(err){
			console.log(err);
		}else {
			res.redirect("/request");
		}
	})
})

app.delete("/showParts/:id", isLoggedIn, function(req,res){
	Part.findByIdAndDelete(req.params.id, function(err, deletedPart){
		if(err){
			console.log(err);
		}else {
			res.redirect("/showParts");
		}
	})
})

//AUTHENTICATION

app.get("/adminLogin", function(req,res){
	res.render("./admin/login");
});

app.post("/adminLogin", passport.authenticate("local", {
	successRedirect: "/postParts",
	failureRedirect: "/adminLogin"
}), function(req, res){
	
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});


//MIDDLEWEAR
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/adminLogin");
		
}



app.listen(process.env.PORT || 3000, function(){
	console.log("Server started");
})