const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const Path = require("path");
const userModel = require("./models/user");
const postModel = require("./models/post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multerconfig = require("./config/multerconfig");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(Path.join(__dirname, "public")));
app.use(cookieParser());

// index
app.get("/", (req, res) => {
    res.render("index");
});

// signup
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/register", async (req, res) => {
    let { userName, name, age, email, password } = req.body;

    email = email.toLowerCase();

    let user = await userModel.findOne({ email });
    if (user) return res.status(500).send("User already exists with this email");

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let newUser = await userModel.create({
                userName,
                name,
                age,
                email,
                password: hash
            });
            console.log("User created: ", newUser);

            let token = jwt.sign({ email }, "this is a secret key"); // ✅ store email in token
            res.cookie("token", token);

            res.redirect("/main");
        });
    });
});

// login
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/checklogin", async (req, res) => {
    let { email, password } = req.body;

    email = email.toLowerCase();

    let user = await userModel.findOne({ email });
    if (!user) return res.send("Invalid email or password");

    bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
            const token = jwt.sign({ email: user.email }, "this is a secret key");
            res.cookie("token", token);
            return res.redirect("/main");
        }
        res.send("Invalid email or password");
    });
});

// main
app.get("/main", isLoggedIn, async (req, res) => {
    let email = req.user.email.toLowerCase();
    let user = await userModel.findOne({ email });

    // console.log("User loaded for /main:", user);

    if (!user) return res.redirect("/login");

    res.render("main", { user: user });
});

app.get("/profile", isLoggedIn, async (req, res) => {
    let email = req.user.email.toLowerCase();
    let user = await userModel.findOne({ email }).populate("posts");

    if (!user) return res.redirect("/login");

    res.render("profile", { user });
});
// edit profile
app.get("/profile-edit", isLoggedIn, (req, res) => {
    res.render("profile-edit", { user: req.user })
})
app.post("/update-profile", isLoggedIn, multerconfig.single("profilePic"), async (req, res) => {

    const { userName, name, age } = req.body;

    let updateData = {
        userName,
        name,
        age
    };

    // If a new profile picture was uploaded, add it to updateData
    if (req.file) {
        updateData.profilePic = req.file.filename;
    }

    try {
        const updatedUser = await userModel.findOneAndUpdate(
            { email: req.user.email },
            updateData,
            { new: true }
        );

        console.log(updatedUser);
        res.redirect("/profile"); // fixed redirect URL (added `/`)
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).send("Internal Server Error");
    }
})
// post
app.post("/post", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    let { content } = req.body
    let newPost = await postModel.create({
        user: user._id,
        content
    })
    user.posts.push(newPost._id)
    await user.save()
    res.redirect("/profile")
})
// like post 
app.post("/like/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate("user");

    const userId = req.user.userid;
    const userIndex = post.likes.indexOf(userId);

    if (userIndex === -1) {
        post.likes.push(userId);
    } else {
        post.likes.splice(userIndex, 1);
    }

    await post.save();
    res.redirect("/profile");
});
// delete post 
app.post("/delete/:id", isLoggedIn, async (req, res) => {
        const userId = req.user.userid;

        // Get the post to be deleted
        const post = await postModel.findById(req.params.id);
        if (!post) {
            return res.status(404).send("Post not found");
        }

        // Check if the logged-in user is the owner of the post
        if (post.user.toString() !== userId) {
            return res.status(403).send("You are not authorized to delete this post.");
        }

        // Delete the post
        await postModel.findByIdAndDelete(req.params.id);

        // Remove post from user's post array
        const user = await userModel.findById(userId);
        const postIndex = user.posts.indexOf(req.params.id);

        if (postIndex !== -1) {
            user.posts.splice(postIndex, 1);
            await user.save();
        }

        res.redirect("/profile");
});
// edit post page
app.get("/post-edit/:id", isLoggedIn, async (req, res) => {
    const post = await postModel.findById(req.params.id);
    res.render("post-edit", { post });
});
// edit post
app.post("/post-edit/:id", isLoggedIn, async (req, res) => {
    const { content } = req.body;

    await postModel.findByIdAndUpdate(req.params.id, {
        content
    });

    res.redirect("/profile");
});


// Logout
app.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.redirect("/login");
});

// middleware
async function isLoggedIn(req, res, next) {
    const token = req.cookies.token;

    if (!token || token === "") return res.redirect("/login");

    try {
        let data = jwt.verify(token, "this is a secret key");

        // 🔍 Fetch user from DB
        const user = await userModel.findOne({ email: data.email });
        if (!user) return res.redirect("/login");

        // ✅ Attach full user data or just needed fields
        req.user = {
            email: user.email,
            userid: user._id.toString() // this is what your /like/:id route needs
        };

        next();
    } catch (err) {
        return res.redirect("/login");
    }
}

app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
});
