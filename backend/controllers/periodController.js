const { Period, Sale } = require('../models');
const { Op } = require('sequelize');
const db = require('../config/db');

// @desc    Fechar o período atual e abrir um novo
// @route   POST /api/periods/close
// @access  Privado
exports.closePeriod = async (req, res) => {
  const t = await db.transaction();
  try {
    // 1. Encontra o período que está atualmente aberto para o usuário
    const currentPeriod = await Period.findOne({
      where: { UserId: req.user.id, status: 'open' },
      transaction: t,
    });

    if (!currentPeriod) {
      // Se não houver período aberto, cria um inicial
      await Period.create({
          UserId: req.user.id,
          startDate: new Date(),
          status: 'open'
      }, { transaction: t });
      await t.commit();
      return res.status(400).json({ success: false, error: 'Nenhum período aberto encontrado. Um novo período foi iniciado. Tente fechar novamente.' });
    }

    const endDate = new Date();

    // 2. Encontra todas as vendas realizadas dentro do período atual
    const salesInPeriod = await Sale.findAll({
      where: {
        UserId: req.user.id,
        createdAt: {
          [Op.gte]: currentPeriod.startDate,
          [Op.lte]: endDate,
        },
      },
      transaction: t,
    });

    // 3. Calcula os totais
    const totalSalesValue = salesInPeriod.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    const totalOrders = salesInPeriod.length;
    const averageTicket = totalOrders > 0 ? totalSalesValue / totalOrders : 0;

    // 4. Atualiza (fecha) o período atual com os dados calculados
    await currentPeriod.update({
      endDate,
      totalSalesValue,
      totalOrders,
      averageTicket,
      status: 'closed',
    }, { transaction: t });

    // 5. Cria o novo período, que começa agora
    await Period.create({
      UserId: req.user.id,
      startDate: endDate, // O novo período começa quando o anterior terminou
      status: 'open',
    }, { transaction: t });

    await t.commit();
    res.status(200).json({ success: true, data: currentPeriod });

  } catch (error) {
    await t.rollback();
    console.error('Erro ao fechar período:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Listar o histórico de períodos fechados
// @route   GET /api/periods
// @access  Privado
exports.getPeriods = async (req, res) => {
    try {
        const periods = await Period.findAll({
            where: {
                UserId: req.user.id,
                status: 'closed'
            },
            order: [['endDate', 'DESC']]
        });
        res.status(200).json({ success: true, data: periods });
    } catch (error) {
        console.error('Erro ao buscar períodos:', error);
        res.status(500).json({ success: false, error: 'Erro no servidor' });
    }
};