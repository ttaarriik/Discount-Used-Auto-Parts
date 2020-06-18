var express		= 	require("express"),
	router 		= 	express.Router({ mergeParams: true }),
	Part		=	require("../models/parts"),
	Car 		=	require("../models/cars"),
	middleware	=	require("../middleware/middleware");



router.get("/partSearch", function(req, res){
	res.render("partSearch");
});

router.post("/partSearch", function(req, res){
	
	Part.find({name: req.body.carPart.parts}, function(err, part){
		var notFound = null;
		if(err){
			req.flash("error", err.message);
			res.redirect("/partSearch");
		}else if(req.body.carPart.year === 'Select Year' || req.body.carPart.make === 'Select Make/Model'){
			notFound = "INVALID SELECTION: Please select a Year, Model, Part ";
			var searchedCar = null;
			res.render("showParts", {notFound: notFound, searchedCar: searchedCar});	 
				 
		}else {
				Car.find({year: req.body.carPart.year,
			   		  make: req.body.carPart.make,
					  parts: {$in: part}}, 
			function(err, foundCar){
				if(err){
					req.flash("error", err.message);
					res.redirect("/partSearch");
				}else {
					if(foundCar.length > 0){
						return res.render("showParts", {car: foundCar, notFound: notFound});
						
					}else if(req.body.carPart.parts === "Select Part"){
						Car.find({year: req.body.carPart.year,
						  make: req.body.carPart.make},
								function(err, foundCar){
							if(err){
								req.flash("error", err.message);
								res.redirect("/partSearch");
							}else if(foundCar.length < 1){
								notFound = "Request not found for: ";
								searchedCar = req.body.carPart;
								searchedCar.parts = null;
								res.render("showParts", {notFound: notFound, searchedCar: searchedCar});
							}else {
								res.render("showParts", {car: foundCar, notFound: notFound});
							}
						})
					}else{
						notFound = "Request not found for: ";
						res.render("showParts", {notFound: notFound, searchedCar: req.body.carPart});
					}		
					
				}
			})
	
		}
	})
	
});


router.get("/showParts", function(req, res){
	Car.find({}, function(err, foundCar){
		if(err){
			req.flash("error", err.message);
			res.redirect("/showParts");
		}else {
			var notFound = null;
			res.render("showParts", {car: foundCar, notFound: notFound});
		}
	})
});


router.get("/postCar",  middleware.isLoggedIn, function(req, res){
	res.render("./cars/postCar");
});

router.post("/postCar",  middleware.isLoggedIn, function(req, res){
	var carParts = req.body.car.parts;
	Car.create({year: req.body.car.year,
					make: req.body.car.make,
					vin: req.body.car.vin}, function(err,car){
									if(err){
										req.flash("error", "Something went wrong, please try again");
										return res.redirect("/postCar");
									}else {
										var b = 0;
										for(var i = 0; i < carParts.length; i++){
											Part.create({name: carParts[i]}, function(err, part){
												if(err){
													req.flash("error", err.message);
													res.redirect("/postCar");
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
										res.redirect("/showParts");
									}
	})
	
		
});
	
router.get("/showParts/:id", function(req, res){
	Car.findById(req.params.id).populate("parts").exec(function(err, foundCar){
		if(err){
			req.flash("error", err.message);
			res.redirect("/showParts/" + req.params.id);
		}else {
			res.render("./cars/showPartsPage", {car: foundCar});
		}
	})
});

router.get("/postPart/:id",  middleware.isLoggedIn, function(req, res){
	Car.findById(req.params.id, function(err, foundCar){
		if(err){
			req.flash("error", err.message);
			res.redirect("/postPart/" + req.params.id);
		}else {
			res.render("./cars/postPart", {car: foundCar});
		}
	})
	
});

router.post("/postPart/:id",  middleware.isLoggedIn, function(req, res){
	var carParts = req.body.car.parts;
	Car.findById(req.params.id, function(err, foundCar){
		if(err){
			req.flash("error", err.message);
			res.redirect("/postPart/" + req.params.id);
		}else {
			var b = 0;
				for(var i = 0; i < carParts.length; i++){
				Part.create({name: carParts[i]},
				function(err, part){
				if(err){
					req.flash("error", err.message);
					res.redirect("/postPart/" + req.params.id);
				}else {
					foundCar.parts.push(part);
					if(b === carParts.length - 1){
						foundCar.save();	
					}else {
						console.log(carParts.length - 1);
						b++;
					}
				}
			})
			}
			res.redirect("/showParts");
		}
	})
});

//DELETE ROUTES 

router.delete("/showParts/:id",  middleware.isLoggedIn, function(req,res){
	Car.findByIdAndDelete(req.params.id, function(err, deletedCar){
		if(err){
			req.flash("error", err.message);
			res.redirect("/showParts/" + req.params.id);
		}else {
			deletedCar.parts.forEach(function(parts){
				Part.findByIdAndDelete(parts, function(err, deletedPart){
					if(err){
						req.flash("error", err.message);
						res.redirect("/showParts/" + req.params.id);
					}else {
						console.log("Deleted: " + deletedPart);
					}
				})
			})
			res.redirect("/showParts");
		}
	})
});

router.delete("/showParts/:id/partsDelete/:_id",  middleware.isLoggedIn, function(req,res){
	Part.findByIdAndDelete(req.params._id, function(err, deletedPart){
		if(err){
			req.flash("error", err.message);
			res.redirect("/showParts/" + req.params.id + "/partsDelete/" + req.params._id);
		}else {
			Car.findByIdAndUpdate(req.params.id, 
				{$pull: {parts: req.params._id}},
				function(err, deletedCarPart){
				if(err){
					req.flash("error", err.message);
					res.redirect("/showParts/" + req.params.id + "/partsDelete/" + req.params._id);
				}else {
					console.log(deletedCarPart);
					res.redirect("/showParts/" + req.params.id);
				}
			})
		}
	})
});


module.exports = router;
