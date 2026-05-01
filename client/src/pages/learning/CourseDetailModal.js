import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Chip,
  Rating,
  Divider,
  Button,
  Avatar,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Close,
  Schedule,
  Person,
  PeopleAlt,
  Star,
  CheckCircleOutline,
  School,
  SignalCellularAlt,
} from '@mui/icons-material';

const LEVEL_COLORS = {
  beginner: { bg: '#e8f5e9', text: '#2e7d32', label: 'Beginner' },
  intermediate: { bg: '#fff8e1', text: '#f57f17', label: 'Intermediate' },
  advanced: { bg: '#fce4ec', text: '#c62828', label: 'Advanced' },
};

const CATEGORY_LABELS = {
  'crop-management': 'Crop Management',
  'soil-science': 'Soil Science',
  'pest-control': 'Pest Control',
  irrigation: 'Irrigation',
  'organic-farming': 'Organic Farming',
  business: 'Agri-Business',
};

// Derive bullet highlights from the course description
const getHighlights = (course) => [
  `${course.duration} hours of expert-led video content`,
  `Taught by ${course.instructor}`,
  `${course.students.toLocaleString()} students already enrolled`,
  'Certificate of completion included',
  'Lifetime access after enrollment',
  'Mobile-friendly course materials',
];

export default function CourseDetailModal({ course, open, onClose }) {
  if (!course) return null;

  const levelMeta = LEVEL_COLORS[course.level] || LEVEL_COLORS.beginner;
  const categoryLabel = CATEGORY_LABELS[course.category] || course.category;
  const ratingFull = Math.floor(course.rating);
  const ratingPercent = ((course.rating / 5) * 100).toFixed(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Hero Image */}
      <Box sx={{ position: 'relative', height: 220, overflow: 'hidden' }}>
        <Box
          component="img"
          src={course.image}
          alt={course.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://picsum.photos/seed/${course.id}/800/440`;
          }}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.65))',
          }}
        />
        {/* Category + level badges */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 1 }}>
          <Chip
            label={categoryLabel}
            size="small"
            sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}
          />
          <Chip
            label={levelMeta.label}
            size="small"
            sx={{ bgcolor: levelMeta.bg, color: levelMeta.text, fontWeight: 600 }}
          />
        </Box>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0,0,0,0.4)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
          }}
        >
          <Close />
        </IconButton>
        {/* Title over image */}
        <Box sx={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
          <Typography variant="h5" fontWeight="bold" color="white" sx={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {course.title}
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Rating + stats row */}
          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {course.rating.toFixed(1)}
                </Typography>
                <Rating value={course.rating} precision={0.5} size="medium" readOnly />
                <Typography variant="body2" color="text.secondary">
                  ({course.students.toLocaleString()} ratings)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Number(ratingPercent)}
                sx={{
                  mt: 0.5,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': { bgcolor: 'warning.main' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2">{course.duration} hrs</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <PeopleAlt fontSize="small" color="action" />
                  <Typography variant="body2">{course.students.toLocaleString()} students</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <SignalCellularAlt fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ color: levelMeta.text, fontWeight: 600 }}>
                    {levelMeta.label}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {/* Instructor */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Instructor
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {course.instructor}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Description */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            About This Course
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
            {course.description}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {/* What you'll learn */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            What You'll Learn
          </Typography>
          <Grid container spacing={1}>
            {getHighlights(course).map((point, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <CheckCircleOutline fontSize="small" color="success" sx={{ mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {point}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Footer CTA */}
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: 'grey.50',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<School />}
            sx={{ px: 4, fontWeight: 700 }}
            onClick={() =>
              window.open(
                'https://www.youtube.com/watch?v=3LPJfIKxwWc&list=PLhQjrBD2T381WAHyx1pq-sBfykqMBI7V4',
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            Enroll Now — Free
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
