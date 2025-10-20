const { Customer } = require('../models');
const { Op } = require('sequelize');

// @desc    Adicionar um novo cliente
// @route   POST /api/customers
// @access  Privado
exports.addCustomer = async (req, res) => {
  const { name, phone, email } = req.body;

  try {
    const customer = await Customer.create({
      name,
      phone,
      email,
      UserId: req.user.id, // Associa o cliente ao usuário logado
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Listar todos os clientes
// @route   GET /api/customers
// @access  Privado
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: {
        UserId: req.user.id,
      },
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Obter um cliente específico pelo ID
// @route   GET /api/customers/:id
// @access  Privado
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        UserId: req.user.id,
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Erro ao buscar cliente por ID:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Atualizar um cliente
// @route   PUT /api/customers/:id
// @access  Privado
exports.updateCustomer = async (req, res) => {
  const { name, phone, email } = req.body;

  try {
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        UserId: req.user.id,
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
    }

    await customer.update({ name, phone, email });

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Deletar um cliente
// @route   DELETE /api/customers/:id
// @access  Privado
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        UserId: req.user.id,
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
    }

    await customer.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};