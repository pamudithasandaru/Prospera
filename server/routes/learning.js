const express = require('express');
const router = express.Router();
const { Course, CareerPath, SkillTest } = require('../models/Learning');
const { protect } = require('../middleware/auth');

// COURSE ROUTES
// @route   POST /api/learning/course
// @desc    Create a course
// @access  Private (instructors/admins)
router.post('/course', protect, async (req, res) => {
  try {
    const course = await Course.create({
      instructor: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/learning/courses
// @desc    Get all courses
// @access  Public
router.get('/courses', async (req, res) => {
  try {
    const { category, level, language, page = 1, limit = 20 } = req.query;
    
    let query = { isPublished: true };
    if (category) query.category = category;
    if (level) query.level = level;
    if (language) query.language = language;

    const courses = await Course.find(query)
      .populate('instructor', 'name profile.avatar profile.verificationBadge')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
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

// @route   GET /api/learning/course/:id
// @desc    Get single course
// @access  Public
router.get('/course/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name profile.avatar profile.verificationBadge profile.bio');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/learning/course/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/course/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const alreadyEnrolled = course.enrollment.students.find(
      s => s.user.toString() === req.user.id
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    course.enrollment.students.push({
      user: req.user.id,
      enrolledDate: Date.now(),
      progress: 0,
      completedLessons: []
    });

    course.enrollment.count += 1;
    await course.save();

    res.json({
      success: true,
      message: 'Enrolled successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/learning/course/:id/progress
// @desc    Update course progress
// @access  Private
router.post('/course/:id/progress', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const student = course.enrollment.students.find(
      s => s.user.toString() === req.user.id
    );

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    if (req.body.lessonId && !student.completedLessons.includes(req.body.lessonId)) {
      student.completedLessons.push(req.body.lessonId);
    }

    if (req.body.progress) {
      student.progress = req.body.progress;
    }

    await course.save();

    res.json({
      success: true,
      message: 'Progress updated',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/learning/course/:id/review
// @desc    Add course review
// @access  Private
router.post('/course/:id/review', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.ratings.reviews.push({
      user: req.user.id,
      rating: req.body.rating,
      review: req.body.review,
      date: Date.now()
    });

    // Recalculate average rating
    const totalRating = course.ratings.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.ratings.average = totalRating / course.ratings.reviews.length;
    course.ratings.count = course.ratings.reviews.length;

    await course.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/learning/my-courses
// @desc    Get user's enrolled courses
// @access  Private
router.get('/my-courses', protect, async (req, res) => {
  try {
    const courses = await Course.find({
      'enrollment.students.user': req.user.id
    }).populate('instructor', 'name profile.avatar');

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// CAREER PATH ROUTES
// @route   GET /api/learning/career-paths
// @desc    Get all career paths
// @access  Public
router.get('/career-paths', async (req, res) => {
  try {
    const careerPaths = await CareerPath.find()
      .populate('courses.course', 'title duration');

    res.json({
      success: true,
      count: careerPaths.length,
      data: careerPaths
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// SKILL TEST ROUTES
// @route   GET /api/learning/skill-tests
// @desc    Get all skill tests
// @access  Public
router.get('/skill-tests', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const tests = await SkillTest.find(query)
      .select('-questions.correctAnswer'); // Don't send correct answers

    res.json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/learning/skill-test/:id/submit
// @desc    Submit skill test
// @access  Private
router.post('/skill-test/:id/submit', protect, async (req, res) => {
  try {
    const test = await SkillTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    const { answers } = req.body;
    
    // Calculate score
    let score = 0;
    test.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score += q.points;
      }
    });

    const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (score / totalPoints) * 100;
    const passed = percentage >= test.passingScore;

    test.attempts.push({
      user: req.user.id,
      score: percentage,
      passed,
      date: Date.now(),
      answers
    });

    // Update leaderboard if passed
    if (passed) {
      const existingEntry = test.leaderboard.find(
        entry => entry.user.toString() === req.user.id
      );

      if (!existingEntry || percentage > existingEntry.score) {
        test.leaderboard = test.leaderboard.filter(
          entry => entry.user.toString() !== req.user.id
        );
        test.leaderboard.push({
          user: req.user.id,
          score: percentage,
          date: Date.now()
        });

        // Sort and assign ranks
        test.leaderboard.sort((a, b) => b.score - a.score);
        test.leaderboard.forEach((entry, index) => {
          entry.rank = index + 1;
        });
      }
    }

    await test.save();

    res.json({
      success: true,
      data: {
        score: percentage,
        passed,
        passingScore: test.passingScore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
