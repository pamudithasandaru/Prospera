const express = require('express');
const router = express.Router();
const { Post, Group, Article, ExpertSession } = require('../models/Social');
const { protect } = require('../middleware/auth');

// POST ROUTES
// @route   POST /api/social/post
// @desc    Create a post
// @access  Private
router.post('/post', protect, async (req, res) => {
  try {
    const post = await Post.create({
      author: req.user.id,
      ...req.body
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name profile.avatar profile.verificationBadge');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: populatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/social/posts
// @desc    Get all posts (newsfeed)
// @access  Public
router.get('/posts', async (req, res) => {
  try {
    const { type, category, page = 1, limit = 20 } = req.query;
    
    let query = { isPublished: true };
    if (type) query.type = type;
    if (category) query.category = category;

    const posts = await Post.find(query)
      .populate('author', 'name profile.avatar profile.verificationBadge')
      .populate('comments.user', 'name profile.avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/social/post/:id/like
// @desc    Like a post
// @access  Private
router.post('/post/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const alreadyLiked = post.likes.find(
      like => like.user.toString() === req.user.id
    );

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      post.likes.push({ user: req.user.id, date: Date.now() });
    }

    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/social/post/:id/comment
// @desc    Add comment to post
// @access  Private
router.post('/post/:id/comment', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      user: req.user.id,
      text: req.body.text,
      date: Date.now(),
      likes: 0
    });

    await post.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GROUP ROUTES
// @route   POST /api/social/group
// @desc    Create a group
// @access  Private
router.post('/group', protect, async (req, res) => {
  try {
    const group = await Group.create({
      admin: req.user.id,
      members: [{ user: req.user.id, joinedDate: Date.now(), role: 'admin' }],
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/social/groups
// @desc    Get all groups
// @access  Public
router.get('/groups', async (req, res) => {
  try {
    const { category, privacy } = req.query;
    
    let query = { isActive: true };
    if (category) query.category = category;
    if (privacy) query.privacy = privacy;

    const groups = await Group.find(query)
      .populate('admin', 'name profile.avatar')
      .sort('-stats.memberCount');

    res.json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/social/group/:id/join
// @desc    Join a group
// @access  Private
router.post('/group/:id/join', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const alreadyMember = group.members.find(
      member => member.user.toString() === req.user.id
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this group'
      });
    }

    group.members.push({
      user: req.user.id,
      joinedDate: Date.now(),
      role: 'member'
    });

    group.stats.memberCount += 1;
    await group.save();

    res.json({
      success: true,
      message: 'Joined group successfully',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ARTICLE ROUTES
// @route   POST /api/social/article
// @desc    Create an article
// @access  Private (experts/admins)
router.post('/article', protect, async (req, res) => {
  try {
    const article = await Article.create({
      author: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/social/articles
// @desc    Get all articles
// @access  Public
router.get('/articles', async (req, res) => {
  try {
    const { category, language, featured } = req.query;
    
    let query = { isPublished: true };
    if (category) query.category = category;
    if (language) query.language = language;
    if (featured) query.isFeatured = true;

    const articles = await Article.find(query)
      .populate('author', 'name profile.avatar profile.verificationBadge')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// EXPERT SESSION ROUTES
// @route   POST /api/social/expert-session
// @desc    Create expert session
// @access  Private (experts/admins)
router.post('/expert-session', protect, async (req, res) => {
  try {
    const session = await ExpertSession.create({
      expert: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Expert session created successfully',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/social/expert-sessions
// @desc    Get all expert sessions
// @access  Public
router.get('/expert-sessions', async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const sessions = await ExpertSession.find(query)
      .populate('expert', 'name profile.avatar profile.verificationBadge')
      .sort('scheduledDate');

    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/social/expert-session/:id/register
// @desc    Register for expert session
// @access  Private
router.post('/expert-session/:id/register', protect, async (req, res) => {
  try {
    const session = await ExpertSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.maxParticipants && session.participants.length >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Session is full'
      });
    }

    const alreadyRegistered = session.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Already registered'
      });
    }

    session.participants.push({
      user: req.user.id,
      registeredDate: Date.now()
    });

    await session.save();

    res.json({
      success: true,
      message: 'Registered successfully',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
