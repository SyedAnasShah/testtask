var mongoose = require('mongoose');
var Schema = mongoose.Schema;

vehicleSchema = new Schema( {
	name: String,
	desc: String,
	price: Number,
	// image: String,
	Model: Number,
	user_id: Schema.ObjectId,
	is_delete: { type: Boolean, default: false },
	date : { type : Date, default: Date.now }
}),
vehicle = mongoose.model('vehicle', vehicleSchema);

module.exports = vehicle;