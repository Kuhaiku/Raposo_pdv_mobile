const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../config/nodemailer');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { fullName, companyName, email, password } = req.body;

  try {
    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Gera o token de ativação
    const activationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      fullName,
      companyName,
      email,
      password: hashedPassword,
      activationToken,
    });

    // Cria a URL de ativação
    const activationUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/verifyemail/${activationToken}`;

    const message = `
      <h1>Você se registrou no PDV Rápido!</h1>
      <p>Para ativar sua conta, por favor, clique no link abaixo:</p>
      <a href="${activationUrl}" clicktracking=off>${activationUrl}</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Ativação de Conta - PDV Rápido',
      html: message,
    });

    res.status(200).json({
      success: true,
      data: 'E-mail de ativação enviado com sucesso!',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { activationToken: req.params.token },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Token inválido' });
    }

    user.isVerified = true;
    user.activationToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'E-mail verificado com sucesso!',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, error: 'Por favor, verifique seu e-mail' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Nenhum usuário encontrado com este e-mail' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = Date.now() + 8 * 60 * 60 * 1000; // 8 horas

    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/resetpassword/${resetToken}`;

    const message = `
      <h1>Você solicitou uma redefinição de senha</h1>
      <p>Por favor, acesse o link abaixo para redefinir sua senha:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Redefinição de Senha - PDV Rápido',
      html: message,
    });

    res.status(200).json({
      success: true,
      data: 'E-mail de redefinição de senha enviado com sucesso!',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Token inválido' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Senha redefinida com sucesso!',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};