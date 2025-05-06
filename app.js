const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const Path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user");

// MongoDB URI
const mongoURI = "mongodb://127.0.0.1:27017/rtiProject";

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.log("Error connecting to MongoDB:", err));


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(Path.join(__dirname, "public")));
app.use(cookieParser());

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.redirect("/login");

        const decoded = jwt.verify(token, "this_is_a_secret_key");
        const user = await userModel.findOne({ email: decoded.email });

        if (!user) return res.redirect("/login");

        req.user = user;
        next();
    } catch (err) {
        return res.redirect("/login");
    }
};

// Routes 

// Home
app.get("/", (req, res) => {
    res.render("main");
});

// Signup
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Register
app.post("/register", async (req, res) => {
    try {
        const {
            name,
            dob,
            gender,
            email,
            phone,
            aadharNumber,
            password,
            country,
            pinCode,
            areaType,
            povertyLevel,
            captcha
        } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.redirect("/login");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            name,
            dob,
            gender,
            email: email.toLowerCase(),
            phone,
            aadharNumber,
            password: hashedPassword,
            address: {
                country,
                pinCode,
                areaType
            },
            povertyLevel,
            captcha
        });

        const token = jwt.sign({ email: newUser.email }, "this_is_a_secret_key");
        res.cookie("token", token);
        res.redirect("/main");
    } catch (error) {
        console.error(error);
        res.status(500).send("Registration failed");
    }
});

// Login
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/checklogin", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).send("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Incorrect password");
        }

        const token = jwt.sign({ email: user.email }, "this_is_a_secret_key");
        res.cookie("token", token);
        res.redirect("/main");
    } catch (error) {
        console.error("Login error: ", error);
        res.status(500).send("Internal server error");
    }
});

// Main Page
app.get("/main", (req, res) => {
    res.render("main");
});



// Articles
app.get("/articles", (req, res) => {
    res.render("artical");
});

// RTI File
app.get("/rti-file", (req, res) => {
    res.render("rtiFile")
});

// Chat
app.get("/chat", (req, res) => {
    res.render("chat")
});

// View Status
app.get("/view-status", (req, res) => {
    res.render("viewStatus")
});

// FAQ
app.get("/faq", (req, res) => {
    res.render("faq")
});

// Profile Page
app.get("/view-history", authenticateUser, (req, res) => {
    res.render("viewHistory", { user: req.user });
});

// contact us 
app.get("/contactus", (req, res) => {
    res.render("contactus");
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
