var mongoose = require("mongoose");

var partsSchema = new mongoose.Schema({
	name: String
});

module.exports = mongoose.model("Part", partsSchema);