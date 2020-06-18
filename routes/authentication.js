var express		= 	require("express"),
	router 		= 	express.Router({ mergeParams: true }),
	passport	=	require("passport"),
	middlewear	=	require("../middleware/middleware");






router.get("/adminLogin", function(req,res){
	res.render("./admin/login");
});

router.post("/adminLogin", passport.authenticate("local", {
	successRedirect: "/postCar",
	failureRedirect: "/adminLogin",
	failureFlash: true,
	successFlash: "Welcome"
}), function(req, res){
	
});

router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});


module.exports = router;
