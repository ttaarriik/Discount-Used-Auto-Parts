var express		= 	require("express"),
	router 		= 	express.Router({ mergeParams: true }),
	Request 	=	require("../models/request"),
	middleware	=	require("../middleware/middleware");



router.get("/", function(req, res){
	res.render("./main/home");
});

router.get("/contact", function(req, res){
	res.render("./main/contact");
});

router.get("/request", middleware.isLoggedIn, function(req, res){
	Request.find({}, function(err, found){
		if(err){
			req.flash("error", err.message);
			res.redirect("/request");
		}else {
			res.render("./main/request", {info: found});
		}
	})
});

router.post("/request", function(req, res){
	Request.create(req.body.info, function(err, request){
		if(err){
			req.flash("error", err.message);
			res.redirect("/request");
		}else{
			res.redirect("/contact");
		}
	})
	
});

router.delete("/request/:id", middleware.isLoggedIn, function(req,res){
	Request.findByIdAndDelete(req.params.id, function(err, deletedReq){
		if(err){
			console.log(err);
			res.redirect("/request/" + req.params.id);
		}else {
			res.redirect("/request");
		}
	})
});


module.exports = router;

	
	
	
