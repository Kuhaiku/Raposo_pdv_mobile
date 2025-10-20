const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configura o Cloudinary com as credenciais do .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configura o armazenamento do Multer para o Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Lógica para criar uma pasta com o nome do produto
    // Usamos um nome temporário inicial que será renomeado depois
    const productName = req.body.name ? req.body.name.replace(/\s+/g, '-').toLowerCase() : 'produto-sem-nome';
    return {
      folder: `pdv_mobile/${productName}`,
      allowed_formats: ['jpg', 'png', 'jpeg'],
    };
  },
});

// Cria o middleware de upload do Multer
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };