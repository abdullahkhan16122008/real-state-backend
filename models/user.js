let mongoose = require('mongoose');


let userSchema = new mongoose.Schema({
    username: String,
    password: String
},
{timestamps: true}
)

let User = mongoose.model('user', userSchema);
module.exports = User;