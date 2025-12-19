// backend/middleware/cloudinaryUpload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/**
 * Multer storage for assignments & submissions
 */
const assignmentsStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "assignments_submissions",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

/**
 * Multer storage for class materials
 */
const materialsStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "materials",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

// Multer instances
const assignments = multer({ storage: assignmentsStorage });
const materials = multer({ storage: materialsStorage });

module.exports = { assignments, materials };
