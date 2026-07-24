const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "fallback_secret_key_for_development",
    { expiresIn: "7d" },
  );
};

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res
    .status(statusCode)
    .cookie("jwt", token, cookieOptions)
    .json({
      success: true,
      message: message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

// @desc    Register a new user (defaults to 'editor' per upgraded schema)
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and confirm password",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one numeric digit, and one special symbol",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "editor",
    });

    sendTokenResponse(user, 201, res, "Account registered successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get session cookie
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      sendTokenResponse(user, 200, res, "Authentication successful");
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user and clear HTTP-Only cookie
// @route   POST /api/v1/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  try {
    // CRITICAL: Must match the exact secure and sameSite flags used when generating the token!
    const cookieOptions = {
      expires: new Date(0), // Set expiration to the Unix epoch (Jan 1, 1970) to force browser deletion
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res.status(200).cookie("jwt", "", cookieOptions).json({
      success: true,
      message: "Logged out successfully and session cookie cleared",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user session
// @route   GET /api/v1/auth/me
// @access  Protected
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

// @desc    Directly provision an Editor account (Admin only)
// @route   POST /api/v1/auth/create-editor
// @access  Protected (Admin only)
const createEditor = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and initial password",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one numeric digit, and one special symbol",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email '${email}' already exists`,
      });
    }

    const newEditor = await User.create({
      name,
      email,
      password,
      role: "editor",
    });

    res.status(201).json({
      success: true,
      message: `Editor account for '${newEditor.name}' provisioned successfully`,
      data: {
        _id: newEditor._id,
        name: newEditor.name,
        email: newEditor.email,
        role: newEditor.role,
        createdAt: newEditor.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all provisioned Editor accounts
// @route   GET /api/v1/auth/editors
// @access  Protected (Admin only)
const getEditors = async (req, res, next) => {
  try {
    const editors = await User.find({ role: "editor" })
      .select("_id name email createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: editors.length,
      data: editors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user's role manually (Admin Plane)
// @route   PUT /api/v1/auth/users/:id/role
// @access  Protected (Admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["admin", "editor"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles are: ${validRoles.join(", ")}`,
      });
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: `No user found with ID: ${id}`,
      });
    }

    if (req.user._id.toString() === id && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Administrators cannot downgrade their own role",
      });
    }

    targetUser.role = role;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `User role updated successfully to '${role}'`,
      data: {
        id: targetUser._id,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  createEditor,
  getEditors,
  updateUserRole,
};
