const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'adyom-foundation',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
    }
});

const upload = multer({ storage });

const uploadMultiple = multer({
    storage: new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'adyom-foundation',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
            transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
        }
    })
}).array('files', 10);

const uploadPDF = multer({
    storage: new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'adyom-foundation/pdfs',
            allowed_formats: ['pdf'],
            resource_type: 'raw'
        }
    })
}).single('file');

const uploadVideoThumb = multer({
    storage: new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'adyom-foundation/videos',
            allowed_formats: ['jpg', 'jpeg', 'png']
        }
    })
}).single('thumbnail');

module.exports = { cloudinary, upload, uploadMultiple, uploadPDF, uploadVideoThumb };