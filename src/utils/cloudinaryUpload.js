const streamifier = require("streamifier");
const cloudinary  = require("../config/cloudinary");

/**
 * Upload a buffer to Cloudinary.
 *
 * This project uses cloudinary v2 (require("cloudinary").v2)
 * The v2 upload_stream adapter signature is:
 *   upload_stream(options, callback)  ← options FIRST, callback SECOND
 *
 * The v1 uploader (lib/uploader.js) is opposite:
 *   upload_stream(callback, options)  ← callback FIRST
 *
 * The v2 adapter (num_pass_args=0) handles the reorder internally.
 * Using the wrong order causes "callback is not a function" crash.
 */
const uploadToCloudinary = (buffer, folder = "harley-admissions") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      // options FIRST (v2 convention)
      { folder, resource_type: "auto" },
      // callback SECOND (v2 convention)
      (error, result) => {
        if (error) {
          console.error("[CLOUDINARY] ❌", error.message);
          reject(new Error(`Cloudinary: ${error.message}`));
        } else {
          console.log("[CLOUDINARY] ✅", result.secure_url);
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

module.exports = uploadToCloudinary;