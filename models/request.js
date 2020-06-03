var mongoose = require("mongoose");

var requestSchema = new mongoose.Schema({
	name: String,
	phone: String,
	message: String	
});


module.exports = mongoose.model("Request", requestSchema);