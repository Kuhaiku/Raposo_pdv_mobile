const { Sale, SaleItem, Product, Customer } = require('../models');
const db = require('../config/db');

// @desc    Criar uma nova venda
// @route   POST /api/sales
// @access  Privado
exports.createSale = async (req, res) => {
  const { customerId, paymentMethod, dueDate, items } = req.body; // items = [{ productId, quantity, unitPrice }, ...]

  // Inicia uma transação para garantir a consistência dos dados
  const t = await db.transaction();

  try {
    // Validação básica dos dados recebidos
    if (!customerId || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Dados da venda incompletos.' });
    }

    // Calcula o valor total da venda
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    // 1. Cria a venda no banco de dados
    const sale = await Sale.create({
      totalAmount,
      paymentMethod,
      dueDate: paymentMethod === 'prazo' ? dueDate : null,
      UserId: req.user.id,
      CustomerId: customerId,
    }, { transaction: t });

    // 2. Itera sobre os produtos do carrinho
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });

      if (!product || product.quantity < item.quantity) {
        // Se um produto não existe ou não tem estoque, desfaz a transação
        await t.rollback();
        return res.status(400).json({ success: false, error: `Estoque insuficiente para o produto: ${product.name}` });
      }

      // 3. Subtrai do estoque
      product.quantity -= item.quantity;
      await product.save({ transaction: t });

      // 4. Adiciona o item na tabela SaleItem
      await SaleItem.create({
        SaleId: sale.id,
        ProductId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }, { transaction: t });
    }

    // Se tudo deu certo, confirma a transação
    await t.commit();

    // Busca a venda completa com os detalhes para retornar ao frontend
    const finalSale = await Sale.findByPk(sale.id, {
        include: [
            { model: Customer },
            { model: Product, through: { attributes: ['quantity', 'unitPrice'] } }
        ]
    });

    res.status(201).json({
      success: true,
      data: finalSale,
    });
  } catch (error) {
    // Em caso de qualquer erro, desfaz a transação
    await t.rollback();
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Listar todas as vendas (histórico)
// @route   GET /api/sales
// @access  Privado
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      where: { UserId: req.user.id },
      include: [
        { model: Customer, attributes: ['name'] }, // Inclui o nome do cliente
        { 
          model: Product, 
          attributes: ['name'], // Inclui o nome dos produtos
          through: { attributes: ['quantity', 'unitPrice'] } // Pega os dados da tabela de junção
        }
      ],
      order: [['createdAt', 'DESC']], // Ordena da mais recente para a mais antiga
    });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};