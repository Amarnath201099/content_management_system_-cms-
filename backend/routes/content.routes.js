const express = require("express");
const {
  getNavigationTree,
  reorderNavigation,
  getContents,
  getContentBySlug,
  createContent,
  updateContent,
  deleteContent,
} = require("../controllers/content.controller");
const {
  protect,
  optionalProtect,
  authorize,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Public & Protected Navigation Routes (Must precede /:slug)
router.get("/navigation", getNavigationTree);
router.put(
  "/navigation/reorder",
  protect,
  authorize("admin"),
  reorderNavigation,
);

// General Page Listing & Retrieval
router.get("/", optionalProtect, getContents);
router.get("/all", optionalProtect, getContents);

// Protected Administration & Authoring Routes
router.post("/", protect, authorize("admin", "editor"), createContent);
router.post("/create", protect, authorize("admin", "editor"), createContent);
router.put("/:id", protect, authorize("admin", "editor"), updateContent);
router.delete("/:id", protect, authorize("admin"), deleteContent);

// 3. CATCH-ALL DYNAMIC ROUTE MUST BE AT THE VERY BOTTOM
// The (*) modifier tells Express to include slashes in req.params.slug
router.get("/*slug", getContentBySlug);

module.exports = router;
