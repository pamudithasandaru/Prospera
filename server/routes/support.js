const express = require('express');
const router = express.Router();
const { SupportTicket, FAQ, ChatbotConversation } = require('../models/Support');
const { protect, authorize } = require('../middleware/auth');

// SUPPORT TICKET ROUTES
// @route   POST /api/support/ticket
// @desc    Create support ticket
// @access  Private
router.post('/ticket', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.create({
      user: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/support/my-tickets
// @desc    Get user's support tickets
// @access  Private
router.get('/my-tickets', protect, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id })
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/support/ticket/:id
// @desc    Get single ticket
// @access  Private
router.get('/ticket/:id', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user assignedTo', 'name email')
      .populate('messages.sender', 'name profile.avatar');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check authorization
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/support/ticket/:id/message
// @desc    Add message to ticket
// @access  Private
router.post('/ticket/:id/message', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.messages.push({
      sender: req.user.id,
      message: req.body.message,
      attachments: req.body.attachments || []
    });

    if (ticket.status === 'resolved') {
      ticket.status = 'open';
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Message added successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/support/ticket/:id/resolve
// @desc    Resolve ticket
// @access  Private (admin only)
router.put('/ticket/:id/resolve', protect, authorize('admin'), async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.status = 'resolved';
    ticket.resolution = {
      resolvedBy: req.user.id,
      resolvedDate: Date.now(),
      solution: req.body.solution
    };

    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket resolved successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// FAQ ROUTES
// @route   GET /api/support/faqs
// @desc    Get all FAQs
// @access  Public
router.get('/faqs', async (req, res) => {
  try {
    const { category, language } = req.query;
    
    let query = { isPublished: true };
    if (category) query.category = category;
    if (language) query.language = language;

    const faqs = await FAQ.find(query).sort('-helpful');

    res.json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/support/faq/:id/helpful
// @desc    Mark FAQ as helpful/not helpful
// @access  Public
router.post('/faq/:id/helpful', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    if (req.body.helpful) {
      faq.helpful += 1;
    } else {
      faq.notHelpful += 1;
    }

    await faq.save();

    res.json({
      success: true,
      message: 'Feedback recorded'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// CHATBOT ROUTES
// @route   POST /api/support/chatbot/message
// @desc    Send message to chatbot
// @access  Public
router.post('/chatbot/message', async (req, res) => {
  try {
    const { sessionId, message, userId } = req.body;

    let conversation = await ChatbotConversation.findOne({ sessionId });

    if (!conversation) {
      conversation = await ChatbotConversation.create({
        sessionId,
        user: userId || null,
        messages: []
      });
    }

    // Add user message
    conversation.messages.push({
      sender: 'user',
      message,
      timestamp: Date.now()
    });

    // TODO: Integrate with actual AI chatbot service
    // For now, simple keyword-based responses
    let botResponse = 'Thank you for your message. A support agent will assist you shortly.';
    let intent = 'general';
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('market')) {
      botResponse = 'You can check current market prices in the Wholesale Market section. Would you like me to show you the latest commodity prices?';
      intent = 'market-prices';
    } else if (lowerMessage.includes('disease') || lowerMessage.includes('pest')) {
      botResponse = 'For crop disease identification, please use our AI Disease Detection tool. You can upload a photo of the affected plant for instant analysis.';
      intent = 'disease-detection';
    } else if (lowerMessage.includes('course') || lowerMessage.includes('learn')) {
      botResponse = 'We offer free courses on agriculture. Visit the Learning Hub to browse courses on crop management, organic farming, and more!';
      intent = 'learning';
    } else if (lowerMessage.includes('loan') || lowerMessage.includes('finance')) {
      botResponse = 'You can apply for agricultural loans through our AgriFinTech portal. We offer micro-loans for seeds, fertilizers, and equipment.';
      intent = 'finance';
    }

    // Add bot response
    conversation.messages.push({
      sender: 'bot',
      message: botResponse,
      intent,
      confidence: 0.75,
      timestamp: Date.now()
    });

    await conversation.save();

    res.json({
      success: true,
      data: {
        response: botResponse,
        intent,
        sessionId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/support/emergency-hotlines
// @desc    Get emergency hotlines
// @access  Public
router.get('/emergency-hotlines', async (req, res) => {
  try {
    const hotlines = [
      {
        name: 'Agriculture Department',
        phone: '+94-11-2123456',
        availability: '24/7',
        purpose: 'General agricultural emergencies and guidance'
      },
      {
        name: 'Pest Control Emergency',
        phone: '+94-11-2234567',
        availability: '8:00 AM - 6:00 PM',
        purpose: 'Urgent pest outbreaks and disease control'
      },
      {
        name: 'Weather Emergency Line',
        phone: '+94-11-2345678',
        availability: '24/7',
        purpose: 'Severe weather warnings and advisories'
      },
      {
        name: 'Veterinary Emergency',
        phone: '+94-11-2456789',
        availability: '24/7',
        purpose: 'Livestock health emergencies'
      }
    ];

    res.json({
      success: true,
      data: hotlines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
