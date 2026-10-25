const express = require('express');
const Group = require('../models/Group');
const router = express.Router();

// 1. CREATE GROUP ROUTE (नया ग्रुप बनाने के लिए)
router.post('/create', async (req, res) => {
  try {
    const { name, members } = req.body; // members में दोस्तों की IDs की एरे (Array) होगी

    const newGroup = new Group({
      name,
      members
    });

    await newGroup.save();
    res.status(201).json({ message: 'ग्रुप सफलतापूर्वक बन गया! 👥', group: newGroup });

  } catch (error) {
    res.status(500).json({ message: 'ग्रुप बनाने में कुछ गड़बड़ हुई', error: error.message });
  }
});

// 2. GET USER GROUPS ROUTE (यूजर के सारे ग्रुप्स देखने के लिए)
router.post('/my-groups', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // ऐसे ग्रुप्स ढूंढें जहाँ यह यूजर मेंबर है
    const groups = await Group.find({ members: userId }).populate('members', 'name email');
    res.json(groups);

  } catch (error) {
    res.status(500).json({ message: 'ग्रुप्स लोड करने में गड़बड़ हुई', error: error.message });
  }
});

module.exports = router;
