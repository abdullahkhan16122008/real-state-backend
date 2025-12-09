let mongoose = require('mongoose');

let propertySchema = new mongoose.Schema({
    title: String,
    price: Number,
    location: String,
    type: String,
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    unit: String,
    propertyStatus: String,
    page: Number,
    status: String,
    features: [String],
    description: String,
    images: [String],
    lat: Number,
    lng: Number
},
    { timestamps: true }
)

let Property = mongoose.model('Property', propertySchema, 'properties')
module.exports = Property;