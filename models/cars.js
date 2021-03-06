var mongoose = require("mongoose");

var carSchema = new mongoose.Schema({
	year: Number,
	make: String,
	vin: String,
	parts: [ 
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Part"
		}		
	]
})

module.exports = mongoose.model("Car", carSchema);