let mongoose = require('mongoose')

let contactSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    phoneNumber: String,
    message: String
}, { timestamps: true })


let Contact = mongoose.model('contact', contactSchema);
module.exports = Contact;