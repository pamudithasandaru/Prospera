import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Rating,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Skeleton,
  Fade,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search,
  PlayCircleOutline,
  Schedule,
  Person,
  Star,
  MenuBook,
  PeopleAlt,
  SortByAlpha,
  TrendingUp,
  StarBorder,
  FilterList,
  ExpandMore,
  SearchOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import COURSES_DATA from './coursesData';
import CourseDetailModal from './CourseDetailModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'crop-management', label: 'Crop Management' },
  { value: 'soil-science', label: 'Soil Science' },
  { value: 'pest-control', label: 'Pest Control' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'organic-farming', label: 'Organic Farming' },
  { value: 'business', label: 'Agri-Business' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'rating-asc', label: 'Lowest Rated' },
  { value: 'students-desc', label: 'Most Popular' },
  { value: 'duration-asc', label: 'Shortest First' },
  { value: 'duration-desc', label: 'Longest First' },
];

const LEVEL_META = {
  beginner: { color: 'success', bg: '#e8f5e9', text: '#2e7d32' },
  intermediate: { color: 'warning', bg: '#fff8e1', text: '#f57f17' },
  advanced: { color: 'error', bg: '#fce4ec', text: '#c62828' },
};

const COURSES_PER_PAGE = 6;

// ─── Debounce Hook ─────────────────────────────────────────────────────────────

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Star Renderer ─────────────────────────────────────────────────────────────

function StarRating({ value, count }) {
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Rating
        value={value}
        precision={0.5}
        size="small"
        readOnly
        icon={<Star fontSize="inherit" sx={{ color: '#f59e0b' }} />}
        emptyIcon={<StarBorder fontSize="inherit" sx={{ color: '#d1d5db' }} />}
      />
      <Typography variant="caption" fontWeight={600} sx={{ color: '#f59e0b' }}>
        {value.toFixed(1)}
      </Typography>
      {count != null && (
        <Typography variant="caption" color="text.disabled">
          ({count.toLocaleString()})
        </Typography>
      )}
    </Box>
  );
}

// ─── Course Card Skeleton ──────────────────────────────────────────────────────

function CourseCardSkeleton() {
  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <Skeleton variant="rectangular" height={180} animation="wave" />
      <CardContent>
        <Box display="flex" gap={1} mb={1}>
          <Skeleton width={90} height={24} />
          <Skeleton width={70} height={24} />
        </Box>
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" height={60} />
        <Skeleton width={120} height={24} />
        <Box display="flex" gap={2} mt={1}>
          <Skeleton width={80} />
          <Skeleton width={80} />
        </Box>
      </CardContent>
      <Box px={2} pb={2}>
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </Card>
  );
}

// ─── Course Card ───────────────────────────────────────────────────────────────

function CourseCard({ course, onViewCourse }) {
  const levelMeta = LEVEL_META[course.level] || LEVEL_META.beginner;
  const categoryLabel =
    CATEGORIES.find((c) => c.value === course.category)?.label || course.category;

  return (
    <Fade in timeout={400}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        {/* Thumbnail */}
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height={180}
            image={course.image}
            alt={course.title}
            onError={(e) => {
              e.target.onerror = null; // prevent infinite loop
              e.target.src = `https://picsum.photos/seed/${course.id}/600/360`;
            }}
            sx={{ transition: 'transform 0.35s ease', '&:hover': { transform: 'scale(1.04)' } }}
          />
          {/* Level badge on image */}
          <Chip
            label={course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: levelMeta.bg,
              color: levelMeta.text,
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Category chip */}
          <Chip
            label={categoryLabel}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ mb: 1, fontWeight: 600, fontSize: '0.7rem' }}
          />

          {/* Title */}
          <Tooltip title={course.title} placement="top">
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
                minHeight: 44,
              }}
            >
              {course.title}
            </Typography>
          </Tooltip>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.6,
              mb: 1.5,
              minHeight: 58,
            }}
          >
            {course.description}
          </Typography>

          {/* Rating */}
          <StarRating value={course.rating} count={course.students} />

          {/* Meta row */}
          <Box display="flex" alignItems="center" gap={2} mt={1} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={0.5}>
              <Person fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary" noWrap>
                {course.instructor}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Schedule fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {course.duration}h
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <PeopleAlt fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {course.students >= 1000
                  ? `${(course.students / 1000).toFixed(1)}k`
                  : course.students}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        {/* CTA */}
        <Box px={2} pb={2}>
          <Button
            id={`view-course-btn-${course.id}`}
            fullWidth
            variant="contained"
            onClick={() => onViewCourse(course)}
            sx={{
              fontWeight: 700,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.9rem',
            }}
          >
            View Course
          </Button>
        </Box>
      </Card>
    </Fade>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const CourseCatalog = () => {
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [visibleCount, setVisibleCount] = useState(COURSES_PER_PAGE);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounced search term (300 ms delay)
  const searchTerm = useDebounce(searchInput, 300);

  // ── Load courses: try API, fall back to static data immediately ─────────────
  useEffect(() => {
    let cancelled = false;
    const fetchCourses = async () => {
      try {
        // Use a plain fetch so the axios 401-redirect interceptor can't interfere
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/learning/courses`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const apiCourses = json.data || [];
        if (cancelled) return;
        // Normalise API shape to match our local data shape
        const normalised = apiCourses.map((c) => ({
          id: c._id || c.id,
          title: c.title,
          category: c.category,
          level: c.level,
          description: c.description,
          rating: c.rating?.average ?? c.rating ?? 0,
          instructor: c.instructor?.name ?? c.instructor ?? 'Unknown',
          duration: c.duration,
          students: c.enrolledStudents ?? c.students ?? 0,
          image:
            c.thumbnail ||
            c.image ||
            `https://picsum.photos/seed/${c._id || c.id}/600/360`,
        }));
        setCourses(normalised.length > 0 ? normalised : COURSES_DATA);
      } catch {
        // API unavailable or route not yet implemented — use bundled static data
        if (!cancelled) setCourses(COURSES_DATA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCourses();
    return () => { cancelled = true; };
  }, []);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalStudents = useMemo(
    () => courses.reduce((sum, c) => sum + (c.students || 0), 0),
    [courses]
  );
  const uniqueInstructors = useMemo(
    () => new Set(courses.map((c) => c.instructor)).size,
    [courses]
  );

  // ── Filter + Sort ───────────────────────────────────────────────────────────
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // 1. Search filter (title, category label, instructor) — case-insensitive
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(lower) ||
          c.category.toLowerCase().includes(lower) ||
          (c.instructor && c.instructor.toLowerCase().includes(lower)) ||
          (c.description && c.description.toLowerCase().includes(lower))
      );
    }

    // 2. Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // 3. Sort
    switch (sortBy) {
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-asc':
        result.sort((a, b) => a.rating - b.rating);
        break;
      case 'students-desc':
        result.sort((a, b) => b.students - a.students);
        break;
      case 'duration-asc':
        result.sort((a, b) => a.duration - b.duration);
        break;
      case 'duration-desc':
        result.sort((a, b) => b.duration - a.duration);
        break;
      default:
        break;
    }

    return result;
  }, [courses, searchTerm, selectedCategory, sortBy]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(COURSES_PER_PAGE);
  }, [searchTerm, selectedCategory, sortBy]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCourses.length;

  // ── Modal handlers ──────────────────────────────────────────────────────────
  const handleViewCourse = useCallback((course) => {
    setSelectedCourse(course);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* ── Page Header ── */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🌱 Learning Hub
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enhance your farming knowledge with expert-led courses — search, filter, and learn at
          your own pace.
        </Typography>
      </Box>

      {/* ── Stats Cards ── */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            icon: <MenuBook sx={{ fontSize: 38 }} />,
            value: loading ? '—' : courses.length,
            label: 'Available Courses',
            bg: 'primary.main',
          },
          {
            icon: <Person sx={{ fontSize: 38 }} />,
            value: loading ? '—' : `${uniqueInstructors}+`,
            label: 'Expert Instructors',
            bg: 'success.main',
          },
          {
            icon: <PlayCircleOutline sx={{ fontSize: 38 }} />,
            value: '500+',
            label: 'Video Lessons',
            bg: 'warning.main',
          },
          {
            icon: <PeopleAlt sx={{ fontSize: 38 }} />,
            value: loading
              ? '—'
              : totalStudents >= 1000
              ? `${(totalStudents / 1000).toFixed(0)}K+`
              : totalStudents,
            label: 'Students Enrolled',
            bg: 'info.main',
          },
        ].map((stat, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                textAlign: 'center',
                bgcolor: stat.bg,
                color: 'white',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' },
              }}
            >
              {stat.icon}
              <Typography variant="h4" fontWeight="bold" mt={0.5}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Filters Bar ── */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={5}>
            <TextField
              id="course-search-input"
              fullWidth
              placeholder="Search by title, category, or instructor…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-label">
                <FilterList sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Category
              </InputLabel>
              <Select
                labelId="category-label"
                id="category-select"
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-label">
                <TrendingUp sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Sort By
              </InputLabel>
              <Select
                labelId="sort-label"
                id="sort-select"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Results summary */}
        {!loading && (
          <Box mt={1.5} display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">
              Showing{' '}
              <strong>
                {Math.min(visibleCount, filteredCourses.length)} of {filteredCourses.length}
              </strong>{' '}
              course{filteredCourses.length !== 1 ? 's' : ''}
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'all' &&
                ` in ${CATEGORIES.find((c) => c.value === selectedCategory)?.label}`}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* ── Course Grid ── */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <CourseCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filteredCourses.length === 0 ? (
        /* ── Empty State ── */
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <SearchOff sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            No courses found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            We couldn't find any courses matching your search or filters. Try adjusting them.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchInput('');
              setSelectedCategory('all');
              setSortBy('default');
            }}
          >
            Clear All Filters
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {visibleCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard course={course} onViewCourse={handleViewCourse} />
              </Grid>
            ))}
          </Grid>

          {/* ── Load More ── */}
          {hasMore && (
            <Box display="flex" justifyContent="center" mt={5}>
              <Button
                id="load-more-btn"
                variant="outlined"
                size="large"
                onClick={() => setVisibleCount((prev) => prev + COURSES_PER_PAGE)}
                startIcon={<ExpandMore />}
                sx={{ px: 5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Load More ({filteredCourses.length - visibleCount} remaining)
              </Button>
            </Box>
          )}
        </>
      )}

      {/* ── Course Detail Modal ── */}
      <CourseDetailModal
        course={selectedCourse}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </Container>
  );
};

export default CourseCatalog;
