const express = require('express');
const Expense = require('./Expense.js'); // ध्यान दें: आपकी फाइल का नाम Expense.js है (E कैपिटल है)
const User = require('./User.js');       // आपकी फाइल का नाम User.js है (U कैपिटल है)
const nodemailer = require('nodemailer');
const router = express.Router();

// 1. ADD EXPENSE ROUTE (खर्चा जोड़ने और दोस्तों में बराबर बांटने के लिए)
router.post('/add', async (req, res) => {
  try {
    const { description, amount, paidBy, groupId, members } = req.body; 
    // members: ग्रुप के उन सभी दोस्तों की IDs की लिस्ट जिनमें पैसे बांटने हैं

    // प्रति व्यक्ति हिस्सा (Split Amount) कैलकुलेट करना
    const splitAmount = amount / members.length;

    // splitBetween एरे तैयार करना
    const splitBetween = members.map(memberId => ({
      user: memberId,
      amountOwed: splitAmount
    }));

    const newExpense = new Expense({
      description,
      amount,
      paidBy,
      groupId,
      splitBetween
    });

    await newExpense.save();
    res.status(201).json({ message: 'खर्चा सफलतापूर्वक जुड़ गया! 💰', expense: newExpense });

  } catch (error) {
    res.status(500).json({ message: 'खर्चा जोड़ने में गड़बड़ हुई', error: error.message });
  }
});

router.post('/remind', async (req, res) => {
  try {
    const { friendId, amountOwed, description } = req.body;

    // दोस्त की डिटेल्स (ईमेल और नाम) डेटाबेस से निकालना
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'दोस्त नहीं मिला!' });
    }

    // Nodemailer ईमेल सेटअप (Gmail SMTP का उपयोग करके)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // आपका ईमेल (हम .env में सेट करेंगे)
        pass: process.env.EMAIL_PASS  // आपका ऐप पासवर्ड
      }
    });

    // फनी और पोलाइट रिमाइंडर मैसेज टेम्पलेट
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: friend.email,
      subject: '🚨 हिसाब-किताब अलर्ट: चाय-पानी का उधार! ☕',
      text: `हे ${friend.name},\n\nयाद है हमने "${description}" के लिए पैसे खर्च किए थे? आपके हिस्से के ₹${amountOwed.toFixed(2)} अभी भी पेंडिंग हैं. \n\nजल्दी से Google Pay या PhonePe कर दे भाई, वरना दोस्ती खतरे में है! 😂🙏\n\nधन्यवाद,\nआपका ईमानदार रूममेट`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: `रिमाइंडर सफलतापूर्वक ${friend.name} को भेज दिया गया! ✉️` });

  } catch (error) {
    res.status(500).json({ message: 'रिमाइंडर भेजने में दिक्कत हुई', error: error.message });
  }
});

module.exports = router;
