const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User.js');
const router = express.Router();

// 1. SIGNUP ROUTE (नया अकाउंट बनाने के लिए)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // चेक करें कि यूजर पहले से मौजूद तो नहीं है
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'यह ईमेल पहले से रजिस्टर्ड है!' });
    }

    // पासवर्ड को सिक्योर (Encrypt) करना
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // नया यूजर बनाना
    user = new User({
      name,
      email,
      password: hashedPassword,
      phone
    });

    await user.save();
    res.status(201).json({ message: 'अकाउंट सफलतापूर्वक बन गया! 🎉' });

  } catch (error) {
    res.status(500).json({ message: 'सर्वर में कुछ गड़बड़ है', error: error.message });
  }
});

// 2. LOGIN ROUTE (लॉगिन करने के लिए)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // यूजर को ईमेल से ढूंढें
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'गलत ईमेल या पासवर्ड!' });
    }

    // पासवर्ड मैच करें
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'गलत ईमेल या पासवर्ड!' });
    }

    // JWT Token जेनरेट करना (लॉगिन सेशन बनाए रखने के लिए)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });

  } catch (error) {
    res.status(500).json({ message: 'सर्वर में कुछ गड़बड़ है', error: error.message });
  }
});

module.exports = router;
