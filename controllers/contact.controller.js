const Contact = require("../models/contacts");


let contactController = async (req, res) => {
    let { fullName, email, phoneNumber, message } = req.body;

    if(!fullName || !email || !phoneNumber || !message) {
        return res.status(201).json({message: 'Fill all the empty fields', success: false})
    }

    try {
        let contact = new Contact({
            fullName,
            email,
            phoneNumber,
            message
        })
        await contact.save();

        return res.status(200).json({ message: `Thank you! Your message has been sent. We'll contact you as soon as possible 🚀`, success: true })
    } catch (err) {
        return res.status(500).json({message: `Internal Server Issue`, error: `${err}`, success: false})
    }
}
let getContacts = async (req, res) => {

    try {
        let contacts = await Contact.find();
        return res.status(200).json({contacts});
    } catch (err) {
        return res.status(500).json({message: `Internal Server Issue`, error: `${err}`, success: false})
    }
}
let deleteContact = async (req, res) => {
    let {_id} = req.body;
    try {
        let remove = await Contact.findByIdAndDelete({_id});
        let contacts = await Contact.find();
        return res.status(200).json({contacts, success: true, message: 'Lead Deleted Successfully'});
    } catch (err) {
        return res.status(201).json({message: `Internal Server Issue`, error: `${err}`, success: false})
    }
}

module.exports = {
    contactController,
    getContacts,
    deleteContact
}