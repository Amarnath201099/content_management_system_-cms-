const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Section ID is required"],
    },
    type: {
      type: String,
      required: [true, "Section type is required"],
      enum: [
        "rich-text",
        "image-content",
        "cta-button",
        "table",
        "math",
        "callout-box",
        "file-download",
      ],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false },
);

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Page title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Page slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    navLabel: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allows multiple pages to leave navLabel undefined/null without index collisions
    },
    navOrder: {
      type: Number,
      default: 0,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Page author is required"],
    },
    authorName: {
      type: String,
      required: [true, "Author name cache is required"],
      trim: true,
    },
    assignedEditors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    sections: {
      type: [sectionSchema],
      default: [],
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
