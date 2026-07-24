const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  createEditor,
  getEditors,
  updateUserRole,
} = require("../controllers/auth.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public & Session Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);

// Protected Admin Team Provisioning Routes
router.post("/create-editor", protect, authorize("admin"), createEditor);
router.get("/editors", protect, authorize("admin"), getEditors);
router.put("/users/:id/role", protect, authorize("admin"), updateUserRole);

module.exports = router;
