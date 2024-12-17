const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const upload = multer({
    // Save uploaded files to "uploads" folder
    dest: "uploads/", 
    // File size to 5MB
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        // Allow only JPEG, JPG, and PNG files
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error("Only .jpeg, .jpg, and .png files are allowed!"));
        }
    },
});

module.exports = upload;