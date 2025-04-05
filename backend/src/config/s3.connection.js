/**
 * AWS S3 Configuration and Upload Middleware
 * Sets up S3 client and multer upload configurations for file storage
 * @module config/s3.connection
 */
import { S3Client } from "@aws-sdk/client-s3";
import multer from 'multer';
import multerS3 from 'multer-s3';

/**
 * Initialized S3 client for AWS S3 operations
 * 
 * @constant {S3Client} s3Client
 * @description
 * Creates and configures an S3 client instance with AWS credentials
 * from environment variables. Used for all S3 bucket operations.
 */
export const s3Client = new S3Client({
    region: process.env.S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
});

/**
 * Multer middleware for handling vehicle image uploads to S3
 * 
 * @constant {Object} upload
 * @description
 * Configures multer with S3 storage for vehicle image uploads.
 * Includes settings for:
 * - Storage: AWS S3 with specified bucket
 * - File naming: Timestamped unique identifiers in the 'ujjwalcars/' path
 * - File filtering: Only allows image file types (jpg, jpeg, png, webp)
 * - Size limits: Maximum 5MB per file
 */
export const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const fileExtension = file.originalname.split('.').pop();
            cb(null, `ujjwalcars/${Date.now()}${crypto.randomUUID(3)}.${fileExtension}`); // add uniqueness
        }
    }),
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * Multer middleware for handling chat image uploads to S3
 * 
 * @constant {Object} uploadchat
 * @description
 * Configures multer with S3 storage for chat image uploads.
 * Similar to the main upload middleware but stores files in a
 * separate 'ujjwalcars-chat/' path to distinguish chat media.
 * Includes the same file type restrictions and size limits.
 */
export const uploadchat = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const fileExtension = file.originalname.split('.').pop();
            cb(null, `ujjwalcars-chat/${Date.now()}${crypto.randomUUID(3)}.${fileExtension}`); // add uniqueness
        }
    }),
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;