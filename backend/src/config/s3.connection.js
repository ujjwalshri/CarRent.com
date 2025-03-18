import { S3Client } from "@aws-sdk/client-s3";
import multer from 'multer';
import multerS3 from 'multer-s3';

export const s3Client = new S3Client({

    region: process.env.S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
});



const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const fileExtension = file.originalname.split('.').pop();
            cb(null, `ujjwalcars/${Date.now()}.${fileExtension}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

export default upload;