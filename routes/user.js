const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {User} = require("../models/User"); // Adjust the path as needed
const authMiddleware = require("../middleware/auth"); // Middleware for protecting routes (optional)
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post(`/upload`, upload.array("images"), async (req, res) => {
  imagesArr = [];
  const files = req.files;
  for (let i = 0; i < files.length; i++) {
    imagesArr.push(files[i].filename);
  }
  res.json({ images: imagesArr });
});

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Register a new user
router.post("/sign-up", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    const existingUserByPh = await User.findOne({ phone });
    if (existingUser && existingUserByPh) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({ name, phone, email, password });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Something went wrong", error });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }



    // Create a JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get user profile (protected route)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and delete the user by ID
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


router.get("/", async (req, res) => {
  try {
    // Fetch all users and exclude the password field from each document
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


// Update user profile (protected route)
router.put("/:userId", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from URL parameters

    const updatedData = {
      name: `${req.body.firstName} ${req.body.lastName}`,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      facebook: req.body.facebook,
      instagram: req.body.instagram,
      whatsApp: req.body.whatsApp,
    };

    if (req.file) {
      const userdata = await User.findById(userId);
      if (userdata.profilePhoto && userdata.profilePhoto.length !== 0) {
    const photoPath = path.join(__dirname, "../uploads", userdata.profilePhoto);

    if (fs.existsSync(photoPath)) {
      try {
        fs.unlinkSync(photoPath);
        console.log(`Deleted file: ${photoPath}`);
      } catch (err) {
        console.error(`Failed to delete file: ${photoPath}`, err);
      }
    } else {
      console.log(`File does not exist: ${photoPath}`);
    }
  }


      updatedData.profilePhoto = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put('/:userId/password', async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(userId);

if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
user.password = newPassword;

    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post("/authWithGoogle", async (req, res) => {
  const { name, email, profilePhoto } = req.body;
  try {
    let user = await User.findOne({ email });

    // If the user does not exist, create a new one
    if (!user) {
      user = new User({
        name,
        email,
        profilePhoto,
        password: null,
         // Google sign-in users don't need a password
      });
      await user.save();
    }
    

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/admin/authWithGoogle", async (req, res) => {
  const { name, email, profilePhoto, isAdmin } = req.body;
  try {
    let user = await User.findOne({ email });

    // If the user does not exist, create a new one
    if (!user) {
      user = new User({
        name,
        email,
        profilePhoto,
        password: null,
        isAdmin: true
         // Google sign-in users don't need a password
      });
      await user.save();
    }
    if (!isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


module.exports = router;
