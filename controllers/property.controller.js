const Property = require("../models/property");
const cloudinary = require('cloudinary').v2;

const propertyController = async (req, res) => {
    try {
        const {
            title,
            price,
            location,
            type,
            bedrooms,
            bathrooms,
            area,
            unit,
            propertyStatus,
            status,
            features,
            description,
            page,
            lat,
            lng
        } = req.body;

        // Multer files array
        let images = req.files;

        // Upload images to cloudinary
        let uploadedImages = [];

        for (let img of images) {
            let base64Image = `data:${img.mimetype};base64,${img.buffer.toString('base64')}`;

            const uploaded = await cloudinary.uploader.upload(base64Image, {
                folder: "properties"
            });

            uploadedImages.push(uploaded.secure_url);
        }

        // Save Property
        let property = new Property({
            title,
            price,
            location,
            type,
            bedrooms,
            bathrooms,
            area,
            unit,
            propertyStatus,
            status,
            features,
            description,
            page,
            images: uploadedImages,
            lat,
            lng
        });

        await property.save();

        let properties = await Property.find();

        return res.status(201).json({
            message: "Property added successfully!",
            properties,
            success: true
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err,
            success: false
        });
    }
};

const editPropertyController = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Property ID missing",
                success: false
            });
        }

        // Create base update object
        const updateData = {
            title: req.body.title,
            price: req.body.price,
            location: req.body.location,
            type: req.body.type,
            bedrooms: req.body.bedrooms,
            bathrooms: req.body.bathrooms,
            area: req.body.area,
            unit: req.body.unit,
            propertyStatus: req.body.propertyStatus,
            status: req.body.status,
            features: req.body.features ? req.body.features.split(",").map(f => f.trim()) : undefined,
            description: req.body.description,
            page: req.body.page,
            lat: req.body.lat,
            lng: req.body.lng
        };

        // Remove undefined values
        Object.keys(updateData).forEach(
            key => updateData[key] === undefined && delete updateData[key]
        );

        // -----------------------------------------------------
        // 1. Handle Images
        // -----------------------------------------------------

        let finalImages = [];

        // Already existing images from frontend
        if (req.body.existingImages) {
            finalImages = JSON.parse(req.body.existingImages);
        }

        // New uploaded images (files)
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                let base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

                const uploaded = await cloudinary.uploader.upload(base64, {
                    folder: "properties"
                });

                finalImages.push(uploaded.secure_url);
            }
        }

        // Only apply to updateData if we have images
        if (finalImages.length > 0) {
            updateData.images = finalImages;
        }

        // -----------------------------------------------------
        // 2. Update Database
        // -----------------------------------------------------

        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedProperty) {
            return res.status(404).json({
                message: "Property not found",
                success: false
            });
        }

        const allProperties = await Property.find();

        return res.status(200).json({
            message: "Property updated successfully!",
            property: updatedProperty,
            properties: allProperties,
            success: true
        });

    } catch (err) {
        console.log(err);
        return res.status(201).json({
            message: "Internal Server Error",
            error: err.message,
            success: false
        });
    }
};
const deletePropertyController = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(201).json({
                message: "Property ID missing",
                success: false
            });
        }

        const deleteProperty = await Property.findByIdAndDelete({_id: id});

        if (!deleteProperty) {
            return res.status(201).json({
                message: "Property not found",
                success: false
            });
        }

        const allProperties = await Property.find();

        return res.status(200).json({
            message: "Property Deleted successfully!",
            properties: allProperties,
            success: true
        });

    } catch (err) {
        console.log(err);
        return res.status(201).json({
            message: "Internal Server Error",
            error: err.message,
            success: false
        });
    }
};


let getPropertiesController = async (req, res) => {

    let { page } = req.body.page;

    try {
        let properties = await Property.find({ page });
        return res.status(200).json({ properties, success: true, update: update })

    } catch (err) {
        return res.status(201).json({ message: `Internal Server Issue`, error: err, success: false })
    }
}
let getPropertiesAdminController = async (req, res) => {

    try {
        let properties = await Property.find();
        return res.status(200).json({ properties, success: true})

    } catch (err) {
        return res.status(201).json({ message: `Internal Server Issue`, error: err, success: false })
    }
}

let getFeaturedPropertiesController = async (req, res) => {

    try {
        let featuredProperties = await Property.find({ status: "Featured" });
        return res.status(201).json({ featuredProperties, success: true })

    } catch (err) {
        return res.status(201).json({ message: `Internal Server Issue`, error: err, success: false })
    }
}

let getHotPropertiesController = async (req, res) => {

    try {
        let hotProperties = await Property.find({ status: "Hot" });
        return res.status(201).json({ hotProperties, success: true })

    } catch (err) {
        return res.status(201).json({ message: `Internal Server Issue`, error: err, success: false })
    }
}

let getPropertyDetails = async (req, res) => {
    let { _id } = req.body;

    try {
        let property = await Property.findOne({ _id });
        if (!property) {
            return res.status(200).json({ message: 'Property not found', success: false })
        }
        return res.status(200).json({ property, success: true })
    } catch (err) {
        return res.status(200).json({ message: 'Internal Server Issue', success: false, error: err })
    }
}


module.exports = {
    propertyController,
    getPropertiesController,
    getPropertiesAdminController,
    editPropertyController,
    getFeaturedPropertiesController,
    getHotPropertiesController,
    getPropertyDetails,
    deletePropertyController
}