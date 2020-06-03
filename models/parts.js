var mongoose = require("mongoose");

var partsSchema = new mongoose.Schema({
	year: Number,
	make: String,
	part: String
});

module.exports = mongoose.model("Part", partsSchema);