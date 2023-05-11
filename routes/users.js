const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
  next();
})

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  const errors = validationResult(req);
  res.render('index', { users, errors: errors.array() });
});

router.post('/', [
  check('name').notEmpty().withMessage('El nombre es requerido'),
  check('email').isEmail().withMessage('El email no es válido'),
  check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const users = await User.find();
    return res.render('index', { users, errors: errors.array() }); // Agregar "errors" al contexto
  }

  const newUser = new User(req.body);
  await newUser.save();
  res.redirect('/users');
});


router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user });
});

router.post('/update/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/users');
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
