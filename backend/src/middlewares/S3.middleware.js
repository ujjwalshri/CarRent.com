import upload from '../config/s3.connection.js'; // import the multer middleware
import {uploadchat} from '../config/s3.connection.js';

export const uploadMultipleImages = function(req, res, next) {
    try {
        upload.array('images', 5)(req, res, (err) => {
            if (err) {
                console.error('Error uploading multiple images:', err);
                return res.status(400).json({
                    error: 'Error uploading images',
                    details: err.message
                });
            }
            next();
        });
    } catch (error) {
        console.error('Unexpected error in uploadMultipleImages:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}

export const uploadSingleImage = function(req, res, next) {
    try {
        uploadchat.single('image')(req, res, (err) => {
            if (err) {
                console.error('Error uploading single image:', err);
                return res.status(400).json({
                    error: 'Error uploading image',
                    details: err.message
                });
            }
            next();
        });
    } catch (error) {
        console.error('Unexpected error in uploadSingleImage:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}

export const deleteImage = function(req, res, next) {
    try {
        const { key } = req.params;
        if (!key) {
            return res.status(400).json({
                error: 'Image key is required'
            });
        }

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        };

        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.error('Error deleting image from S3:', err);
                return res.status(400).json({
                    error: 'Error deleting image',
                    details: err.message
                });
            }
            next();
        });
    } catch (error) {
        console.error('Unexpected error in deleteImage:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}

