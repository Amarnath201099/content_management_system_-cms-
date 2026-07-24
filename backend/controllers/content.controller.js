const Content = require("../models/content.model");

// @desc    Get lightweight navigation tree for navbar dropdowns (Only Published Pages)
// @route   GET /api/v1/content/navigation
// @access  Public
const getNavigationTree = async (req, res, next) => {
  try {
    // Select navLabel and navOrder alongside routing fields, sorted by navOrder ascending
    const contents = await Content.find({ isPublished: true })
      .select("_id title slug parent navLabel navOrder")
      .sort({ navOrder: 1, createdAt: 1 })
      .lean();

    const roots = [];
    const childrenMap = {};

    contents.forEach((doc) => {
      const parentId = doc.parent ? doc.parent.toString() : null;
      if (!parentId) {
        roots.push({ ...doc, children: [] });
      } else {
        if (!childrenMap[parentId]) {
          childrenMap[parentId] = [];
        }
        childrenMap[parentId].push({ ...doc, children: [] });
      }
    });

    const attachChildren = (nodes) => {
      return nodes.map((node) => {
        const nodeId = node._id.toString();
        const nodeChildren = childrenMap[nodeId] || [];
        return {
          ...node,
          children: attachChildren(nodeChildren),
        };
      });
    };

    const navigationTree = attachChildren(roots);

    res.status(200).json({
      success: true,
      count: navigationTree.length,
      data: navigationTree,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update navigation order indices for top-level pages
// @route   PUT /api/v1/content/navigation/reorder
// @access  Protected (Admin only)
const reorderNavigation = async (req, res, next) => {
  try {
    // Support direct array payloads or wrapped { items: [...] } objects
    const items = Array.isArray(req.body) ? req.body : req.body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide an array of items containing _id and navOrder properties.",
      });
    }

    // Execute concurrent updates across all provided page IDs
    await Promise.all(
      items.map((item) =>
        Content.findByIdAndUpdate(
          item._id,
          { $set: { navOrder: Number(item.navOrder) || 0 } },
          { returnDocument: "after", runValidators: false },
        ),
      ),
    );

    res.status(200).json({
      success: true,
      message: "Navigation order updated successfully",
      updatedCount: items.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pages with RBAC author/editor assignment filtering
// @route   GET /api/v1/content
// @access  Public / Optional Auth
const getContents = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50, published } = req.query;

    const queryObj = {};

    if (req.user && req.user.role === "editor") {
      queryObj.$or = [
        { author: req.user._id },
        { assignedEditors: req.user._id },
      ];
    } else if (!req.user) {
      queryObj.isPublished = true;
    }

    if (published === "true" || published === true) {
      queryObj.isPublished = true;
    } else if (published === "false" || published === false) {
      queryObj.isPublished = false;
    }

    if (search) {
      const searchQuery = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { navLabel: { $regex: search, $options: "i" } },
      ];

      if (queryObj.$or) {
        queryObj.$and = [{ $or: queryObj.$or }, { $or: searchQuery }];
        delete queryObj.$or;
      } else {
        queryObj.$or = searchQuery;
      }
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalDocs = await Content.countDocuments(queryObj);
    const contents = await Content.find(queryObj)
      .populate("parent", "title slug")
      .populate("author", "name email role")
      .populate("assignedEditors", "name email")
      .sort({ navOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: contents.length,
      total: totalDocs,
      page: pageNum,
      totalPages: Math.ceil(totalDocs / limitNum),
      data: contents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single page by slug OR MongoDB ObjectId
// @route   GET /api/v1/content/:slug
// @access  Public
const getContentBySlug = async (req, res, next) => {
  try {
    // NORMALIZE: If Express parsed slug as an array, join it with slashes
    const slugStr = Array.isArray(req.params.slug)
      ? req.params.slug.join("/")
      : req.params.slug;

    // CRITICAL FIX: Support fetching by MongoDB ObjectId (when editing in Admin) OR by URL slug
    const query = slugStr.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: slugStr }
      : { slug: slugStr };

    const content = await Content.findOne(query)
      .populate("parent", "title slug")
      .populate("author", "name email role")
      .populate("assignedEditors", "name email");

    if (!content) {
      return res.status(404).json({
        success: false,
        message: `No page found matching identifier: '${slugStr}'`,
      });
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new modular page
// @route   POST /api/v1/content
// @access  Protected (Admin/Editor)
const createContent = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      navLabel,
      navOrder,
      parent,
      sections,
      blocks,
      isPublished,
      assignedEditors,
    } = req.body;

    const existingSlug = await Content.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: `Page with slug '${slug}' already exists. Please choose a unique slug.`,
      });
    }

    let targetPublished = isPublished !== undefined ? isPublished : false;
    if (req.user.role === "editor" && targetPublished === true) {
      targetPublished = false;
    }

    const newContent = await Content.create({
      title,
      slug,
      navLabel: navLabel || undefined, // Prevents storing empty strings as null index collisions
      navOrder: Number(navOrder) || 0,
      parent: parent || null,
      sections: sections || blocks || [],
      isPublished: targetPublished,
      author: req.user._id,
      authorName: req.user.name || req.user.email,
      assignedEditors: req.user.role === "admin" ? assignedEditors || [] : [],
    });

    res.status(201).json({
      success: true,
      message: "Page created successfully",
      data: newContent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update page with granular assignment & hierarchy preservation safeguards
// @route   PUT /api/v1/content/:id
// @access  Protected (Admin/Editor)
const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      navLabel,
      navOrder,
      parent,
      sections,
      blocks,
      isPublished,
      assignedEditors,
    } = req.body;

    let page = await Content.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: `No page found with ID: ${id}`,
      });
    }

    if (req.user.role === "editor") {
      const isAuthor = page.author.toString() === req.user._id.toString();
      const isAssigned =
        page.assignedEditors &&
        page.assignedEditors.some(
          (edId) => edId.toString() === req.user._id.toString(),
        );

      if (!isAuthor && !isAssigned) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not authorized to edit this page",
        });
      }

      if (isPublished === true && !page.isPublished) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied: Only Administrators can publish pages directly to live production.",
        });
      }
    }

    if (slug && slug !== page.slug) {
      const slugCollision = await Content.findOne({ slug });
      if (slugCollision && slugCollision._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: `Slug '${slug}' is already in use by another page.`,
        });
      }
    }

    if (parent && parent.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "A page cannot be its own parent.",
      });
    }

    const targetAssignedEditors =
      req.user.role === "admin" && assignedEditors !== undefined
        ? assignedEditors
        : page.assignedEditors;

    // CRITICAL FIX: Check !== undefined so partial updates never erase parent or sections!
    page = await Content.findByIdAndUpdate(
      id,
      {
        title: title !== undefined ? title : page.title,
        slug: slug !== undefined ? slug : page.slug,
        navLabel:
          navLabel !== undefined ? navLabel || undefined : page.navLabel,
        navOrder: navOrder !== undefined ? Number(navOrder) : page.navOrder,
        parent: parent !== undefined ? parent || null : page.parent,
        sections:
          sections !== undefined
            ? sections
            : blocks !== undefined
              ? blocks
              : page.sections,
        isPublished:
          req.user.role === "admin" && isPublished !== undefined
            ? isPublished
            : page.isPublished,
        assignedEditors: targetAssignedEditors,
      },
      { returnDocument: "after", runValidators: true },
    )
      .populate("parent", "title slug")
      .populate("author", "name email role")
      .populate("assignedEditors", "name email");

    res.status(200).json({
      success: true,
      message: "Page updated successfully",
      data: page,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete page and protect orphan child references
// @route   DELETE /api/v1/content/:id
// @access  Protected (Admin only)
const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const page = await Content.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: `No page found with ID: ${id}`,
      });
    }

    await Content.updateMany(
      { parent: req.params.id },
      { $set: { parent: null } },
    );

    await page.deleteOne();

    res.status(200).json({
      success: true,
      message: `Page '${page.title}' deleted and child references unlinked successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNavigationTree,
  reorderNavigation,
  getContents,
  getContentBySlug,
  createContent,
  updateContent,
  deleteContent,
};
