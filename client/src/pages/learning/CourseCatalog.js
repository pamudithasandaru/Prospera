import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Rating,
  TextField,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  Search,
  PlayCircleOutline,
  Schedule,
  Person,
  Star,
  MenuBook,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, category, courses]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/learning/courses');
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(course => course.category === category);
    }

    setFilteredCourses(filtered);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Learning Hub
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enhance your farming knowledge with expert-led courses
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
            <MenuBook sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {courses.length}
            </Typography>
            <Typography variant="body2">Available Courses</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
            <Person sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              50+
            </Typography>
            <Typography variant="body2">Expert Instructors</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
            <PlayCircleOutline sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              500+
            </Typography>
            <Typography variant="body2">Video Lessons</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
            <Star sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              10K+
            </Typography>
            <Typography variant="body2">Students Enrolled</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="crop-management">Crop Management</MenuItem>
              <MenuItem value="soil-science">Soil Science</MenuItem>
              <MenuItem value="pest-control">Pest Control</MenuItem>
              <MenuItem value="irrigation">Irrigation</MenuItem>
              <MenuItem value="organic-farming">Organic Farming</MenuItem>
              <MenuItem value="business">Agri-Business</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Courses Grid */}
      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="160"
                image={course.thumbnail || 'https://via.placeholder.com/400x160?text=Course+Thumbnail'}
                alt={course.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" gap={1} mb={1}>
                  <Chip
                    label={course.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={course.level}
                    size="small"
                    color={getDifficultyColor(course.level)}
                  />
                </Box>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {course.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: 60 }}>
                  {course.description?.substring(0, 100)}...
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Rating value={course.rating?.average || 0} precision={0.5} size="small" readOnly />
                  <Typography variant="caption" color="text.secondary">
                    ({course.rating?.count || 0})
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {course.instructor?.name}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {course.duration} hours
                    </Typography>
                  </Box>
                </Box>

                {course.enrolledStudents > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {course.enrolledStudents} students enrolled
                  </Typography>
                )}
              </CardContent>

              <Box p={2} pt={0}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate(`/learning/courses/${course._id}`)}
                >
                  View Course
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCourses.length === 0 && !loading && (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No courses found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default CourseCatalog;
