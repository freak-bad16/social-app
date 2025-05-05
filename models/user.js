const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/rtiProject", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    aadharNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        country: { type: String, required: true },
        pinCode: { type: String, required: true },
        areaType: {
            type: String,
            enum: ['Urban', 'Rural'],
            required: true
        }
    },
    povertyLevel: {
        type: String,
        enum: ['APL', 'BPL', 'Unspecified'],
        required: true
    },
    captcha: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);
