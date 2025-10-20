const { Product, Image, User } = require('../models'); // Adicionado 'User' aqui
const { cloudinary } = require('../config/cloudinary');
const { Op } = require('sequelize');

// @desc    Adicionar um novo produto com imagens
// @route   POST /api/products
// @access  Privado
exports.addProduct = async (req, res) => {
  const { name, price, quantity, code, description } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'É necessário enviar pelo menos uma imagem.' });
  }

  try {
    const product = await Product.create({
      name,
      price,
      quantity,
      code,
      description,
      UserId: req.user.id,
    });

    const newFolderName = `pdv_mobile/product-${product.id}`;
    
    const imagesData = req.files.map((file, index) => {
        const publicIdWithoutFolder = file.filename.split('/').pop();
        const newPublicId = `${newFolderName}/${publicIdWithoutFolder}`;
        cloudinary.uploader.rename(file.filename, newPublicId);
        return {
            url: file.path.replace(file.filename, newPublicId),
            public_id: newPublicId,
            folder: newFolderName,
            order: index,
            ProductId: product.id,
        };
    });

    await Image.bulkCreate(imagesData);

    const finalProduct = await Product.findByPk(product.id, { include: [Image] });

    res.status(201).json({
      success: true,
      data: finalProduct,
    });
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    if (req.files) {
      req.files.forEach(file => cloudinary.uploader.destroy(file.filename));
    }
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Listar todos os produtos ativos e inativos
// @route   GET /api/products
// @access  Privado
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        UserId: req.user.id,
        status: { [Op.ne]: 'deleted' }
      },
      include: [{ model: Image, separate: true, order: [['order', 'ASC']] }],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Obter um produto específico pelo ID
// @route   GET /api/products/:id
// @access  Privado
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, UserId: req.user.id },
      include: [{ model: Image, separate: true, order: [['order', 'ASC']] }]
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Atualizar um produto
// @route   PUT /api/products/:id
// @access  Privado
exports.updateProduct = async (req, res) => {
    const { name, price, quantity, code, description, status, imagesOrder, imagesToDelete } = req.body;
  
    try {
      const product = await Product.findOne({ where: { id: req.params.id, UserId: req.user.id } });
  
      if (!product) {
        return res.status(404).json({ success: false, error: 'Produto não encontrado' });
      }
  
      await product.update({ name, price, quantity, code, description, status });
  
      if (imagesToDelete && imagesToDelete.length > 0) {
        const parsedImagesToDelete = JSON.parse(imagesToDelete);
        for (const imageId of parsedImagesToDelete) {
          const image = await Image.findByPk(imageId);
          if (image) {
            await cloudinary.uploader.destroy(image.public_id);
            await image.destroy();
          }
        }
      }
  
      if (req.files && req.files.length > 0) {
        const newFolderName = `pdv_mobile/product-${product.id}`;
        const newImagesData = req.files.map(file => {
          const publicIdWithoutFolder = file.filename.split('/').pop();
          const newPublicId = `${newFolderName}/${publicIdWithoutFolder}`;
          cloudinary.uploader.rename(file.filename, newPublicId);
          return {
            url: file.path.replace(file.filename, newPublicId),
            public_id: newPublicId,
            folder: newFolderName,
            ProductId: product.id,
          };
        });
        await Image.bulkCreate(newImagesData);
      }
  
      if (imagesOrder) {
        const parsedImagesOrder = JSON.parse(imagesOrder);
        for (const img of parsedImagesOrder) {
          await Image.update({ order: img.order }, { where: { id: img.id } });
        }
      }
  
      if (status === 'inactive' && product.status !== 'inactive') {
        const images = await Image.findAll({ where: { ProductId: product.id } });
        for (const image of images) {
          const newPublicId = `pdv_mobile/inativas/${image.public_id.split('/').pop()}`;
          await cloudinary.uploader.rename(image.public_id, newPublicId);
          await image.update({ public_id: newPublicId, folder: 'pdv_mobile/inativas' });
        }
      }
  
      const updatedProduct = await Product.findByPk(product.id, { include: [Image] });
  
      res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ success: false, error: 'Erro no servidor' });
    }
  };

// @desc    Deletar um produto (soft delete)
// @route   DELETE /api/products/:id
// @access  Privado
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, UserId: req.user.id } });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }

    if (product.status === 'deleted') {
      const images = await Image.findAll({ where: { ProductId: product.id } });
      for (const image of images) {
        await cloudinary.uploader.destroy(image.public_id);
      }
      await product.destroy();
      return res.status(200).json({ success: true, data: 'Produto excluído permanentemente.' });
    }

    await product.update({
      status: 'deleted',
      deletedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    
    const images = await Image.findAll({ where: { ProductId: product.id } });
    for (const image of images) {
      const newPublicId = `pdv_mobile/deletados/${image.public_id.split('/').pop()}`;
      await cloudinary.uploader.rename(image.public_id, newPublicId);
      await image.update({ public_id: newPublicId, folder: 'pdv_mobile/deletados' });
    }

    res.status(200).json({
      success: true,
      data: 'Produto movido para a lixeira. Exclusão permanente em 30 dias.'
    });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Obter o catálogo público de um usuário
// @route   GET /api/public/catalogo/:userId
// @access  Público
exports.getPublicCatalog = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        UserId: req.params.userId,
        status: 'active'
      },
      include: [{ model: Image, separate: true, order: [['order', 'ASC']] }],
      order: [['name', 'ASC']]
    });

    // CORREÇÃO: Busca o nome da empresa e envia na resposta
    const user = await User.findByPk(req.params.userId);
    const companyName = user ? user.companyName : 'Catálogo de Produtos';

    res.status(200).json({
      success: true,
      companyName: companyName, // Nome da empresa adicionado aqui
      data: products
    });
  } catch (error) {
    console.error('Erro ao buscar catálogo público:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};