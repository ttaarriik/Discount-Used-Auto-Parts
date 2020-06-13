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
	dotenv					= require("dotenv");

dotenv.config();
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

	
	Part.find({name: req.body.carPart.parts}, function(err, part){
		var notFound = null;
		var carFound = false;
		if(err){
			console.log(err);
		}else{
			part.forEach(function(part){
				Car.find({year: req.body.carPart.year,
			   		  make: req.body.carPart.make,
					  parts: part}, 
			function(err, foundCar){
				if(err){
					console.log(err)
				}else {
					console.log(foundCar);
					if(foundCar.length !== 0){
						console.log("Found it!");
						console.log(notFound);
						carFound = true;
						
						return res.render("showParts", {car: foundCar, notFound: notFound});
						
					}
			
				}
			})
				
			})
			
			
			if(req.body.carPart.parts === "Select Part"){
				Car.find({year: req.body.carPart.year,
						  make: req.body.carPart.make},
						function(err, foundCar){
					if(err){
						console.log(err);
					}else if(foundCar.length < 1){
						notFound = "Request not found for: ";
						res.render("showParts", {notFound: notFound, searchedCar: req.body.carPart});
					}else {
						res.render("showParts", {car: foundCar, notFound: notFound});
					}
				})
			}
			
		}
	})
	
})


app.get("/showParts", function(req, res){
	Car.find({}, function(err, foundCar){
		if(err){
			cosole.log(err)
		}else {
			var notFound = null;
			res.render("showParts", {car: foundCar, notFound: notFound});
		}
	})
})


app.get("/postCar", isLoggedIn, function(req, res){
	res.render("./cars/postCar");
});

app.post("/postCar", isLoggedIn, function(req, res){
	var carParts = req.body.car.parts;
	Car.create({year: req.body.car.year,
					make: req.body.car.make,
					vin: req.body.car.vin}, function(err,car){
									if(err){
										console.log(err);
									}else {
										var b = 0;
										for(var i = 0; i < carParts.length; i++){
											Part.create({name: carParts[i]}, function(err, part){
												if(err){
													console.log(err);
												}else {
													car.parts.push(part);
													if(b === carParts.length - 1){
														car.save();	
													}else {
														console.log(carParts.length - 1);
														b++;
													}
												}
											})
										}
											
									
										
										console.log(car);
										res.redirect("/showParts");
									}
	})
	
		
});

	

app.get("/showParts/:id", function(req, res){
	Car.findById(req.params.id).populate("parts").exec(function(err, foundCar){
		if(err){
			console.log(err);
		}else {
			res.render("./cars/showPartsPage", {car: foundCar});
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
	Car.findByIdAndDelete(req.params.id, function(err, deletedCar){
		if(err){
			console.log(err);
		}else {
			deletedCar.parts.forEach(function(parts){
				Part.findByIdAndDelete(parts, function(err, deletedPart){
					if(err){
						console.log(err);
					}else {
						console.log("Deleted: " + deletedPart);
					}
				})
			})
			res.redirect("/showParts");
		}
	})
});

app.delete("/showParts/:id/partsDelete/:_id", isLoggedIn, function(req,res){
	Part.findByIdAndDelete(req.params._id, function(err, deletedPart){
		if(err){
			console.log(err);
		}else {
			Car.findByIdAndUpdate(req.params.id, 
				{$pull: {parts: req.params._id}},
				function(err, deletedCarPart){
				if(err){
					console.log(err);
				}else {
					console.log(deletedCarPart);
					res.redirect("/showParts/" + req.params.id);
				}
			})
		}
	})
})

//AUTHENTICATION

app.get("/adminLogin", function(req,res){
	res.render("./admin/login");
});

app.post("/adminLogin", passport.authenticate("local", {
	successRedirect: "/postCar",
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