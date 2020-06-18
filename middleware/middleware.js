var middleware = {};



middleware.isLoggedIn = function (req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/adminLogin");
		
}


module.exports = middleware;