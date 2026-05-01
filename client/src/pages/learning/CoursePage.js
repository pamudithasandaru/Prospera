import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  IconButton,
  Avatar,
  Divider,
  LinearProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Delete,
  Edit,
  FileDownload,
  LibraryBooks,
  NotesActive,
  CheckCircle,
  Schedule,
  Person,
  PeopleAlt,
  ChevronRight,
  VideoLibrary,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CourseFormDialog from './CourseFormDialog';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Expert CRUD state
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch course from API
  useEffect(() => {
    let cancelled = false;
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/learning/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;

        if (json.success && json.data) {
          const c = json.data;
          setCourse({
            id: c._id || c.id,
            title: c.title,
            category: c.category,
            level: c.level,
            description: c.description,
            rating: c.rating?.average ?? c.rating ?? 0,
            instructor: c.instructor?.name ?? c.instructor ?? 'Unknown',
            duration: c.duration,
            students: c.enrolledStudents ?? c.students ?? 0,
            image: c.thumbnail || c.image || `https://picsum.photos/seed/${c._id || c.id}/600/360`,
            thumbnail: c.thumbnail || '',
            videos: c.videos || [],
            materials: c.materials || [],
            createdBy: c.createdBy || null,
          });
        } else {
          setError('Course not found');
        }
      } catch {
        if (!cancelled) setError('Failed to load course');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCourse();
    return () => { cancelled = true; };
  }, [courseId, refreshKey]);

  // Get computed values
  const videos = course?.videos || [];
  const materials = course?.materials || [];
  const currentVideo = videos[currentVideoIndex];

  // Handle adding note
  const handleAddNote = () => {
    if (noteContent.trim()) {
      setNotes([
        ...notes,
        {
          id: Date.now(),
          content: noteContent,
          timestamp: new Date().toLocaleTimeString(),
          videoIndex: currentVideoIndex,
        },
      ]);
      setNoteContent('');
    }
  };

  // Handle deleting note
  const handleDeleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  // Handle editing note
  const handleSaveEdit = (id) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, content: editContent } : n))
    );
    setEditingId(null);
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={300} height={40} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mt: 3 }} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mt: 3 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error / not found state
  if (error || !course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box textAlign="center" py={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Course Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {error || 'The course you are looking for does not exist.'}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/learning')}>
            Back to Courses
          </Button>
        </Box>
      </Container>
    );
  }

  const currentNotes = notes.filter((n) => n.videoIndex === currentVideoIndex);
  const isOwner = user?.role === 'expert' && user?._id && course.createdBy === user._id;

  // Expert CRUD handlers
  const handleEditCourse = () => setFormOpen(true);

  const handleSaveCourse = async (formData) => {
    setSaving(true);
    try {
      await api.put(`/learning/courses/${course.id}`, formData);
      setSnackbar({ open: true, message: 'Course updated!', severity: 'success' });
      setFormOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Update failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await api.delete(`/learning/courses/${course.id}`);
      navigate('/learning');
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/learning')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
          {course.title}
        </Typography>
        {isOwner && (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEditCourse}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Content - Video Player */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* Video Player */}
            {videos.length > 0 ? (
              <>
                <Box
                  sx={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    height: 0,
                    overflow: 'hidden',
                    bgcolor: 'black',
                  }}
                >
                  <iframe
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    src={`https://www.youtube.com/embed/${currentVideo?.videoId}?autoplay=1`}
                    title={currentVideo?.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>

                {/* Video Info */}
                <CardContent sx={{ bgcolor: 'grey.50', p: 2 }}>
                  <Box display="flex" alignItems="flex-start" gap={2} justifyContent="space-between">
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {currentVideo?.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Video {currentVideoIndex + 1} of {videos.length}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${currentVideoIndex + 1}/${videos.length}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {/* Progress bar */}
                  <LinearProgress
                    variant="determinate"
                    value={((currentVideoIndex + 1) / videos.length) * 100}
                    sx={{ mt: 2, height: 6, borderRadius: 3 }}
                  />

                  {/* Navigation buttons */}
                  <Box display="flex" gap={1} mt={2}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => setCurrentVideoIndex(Math.max(0, currentVideoIndex - 1))}
                      disabled={currentVideoIndex === 0}
                      fullWidth
                    >
                      Previous
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={<ChevronRight />}
                      onClick={() => setCurrentVideoIndex(Math.min(videos.length - 1, currentVideoIndex + 1))}
                      disabled={currentVideoIndex === videos.length - 1}
                      fullWidth
                    >
                      Next
                    </Button>
                  </Box>
                </CardContent>
              </>
            ) : (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <VideoLibrary sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  No videos available yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Videos for this course are coming soon.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Tabs for Notes and Materials */}
          <Paper elevation={2} sx={{ borderRadius: 2, mt: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, val) => setTabValue(val)}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.50',
              }}
            >
              <Tab id="course-tab-0" aria-controls="course-tabpanel-0" label="📝 Notes" />
              <Tab id="course-tab-1" aria-controls="course-tabpanel-1" label="📚 Materials" />
            </Tabs>

            {/* Notes Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box>
                {/* Add Note */}
                <Box display="flex" gap={1} mb={3}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a note for this video..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={handleAddNote}
                  disabled={!noteContent.trim()}
                  sx={{ mb: 3 }}
                >
                  Save Note
                </Button>

                {/* Notes List */}
                {currentNotes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                    No notes yet for this video. Add your first note!
                  </Typography>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                      Your Notes ({currentNotes.length})
                    </Typography>
                    {currentNotes.map((note) => (
                      <Card key={note.id} sx={{ mb: 2, bgcolor: '#fffbf0' }}>
                        <CardContent>
                          {editingId === note.id ? (
                            <Box display="flex" gap={1} flexDirection="column">
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                variant="outlined"
                                size="small"
                              />
                              <Box display="flex" gap={1}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleSaveEdit(note.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => setEditingId(null)}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {note.content}
                              </Typography>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary">
                                  {note.timestamp}
                                </Typography>
                                <Box display="flex" gap={1}>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditingId(note.id);
                                      setEditContent(note.content);
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Materials Tab */}
            <TabPanel value={tabValue} index={1}>
              {materials.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No reading materials available for this course yet.
                </Typography>
              ) : (
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                    Available Resources
                  </Typography>
                  <List sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                    {materials.map((material, idx) => (
                      <React.Fragment key={idx}>
                        <ListItem
                          secondaryAction={
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<FileDownload />}
                              onClick={() =>
                                window.open(
                                  'https://example.com/download',
                                  '_blank'
                                )
                              }
                            >
                              Download
                            </Button>
                          }
                          sx={{
                            py: 2,
                            '&:hover': { bgcolor: 'grey.100' },
                          }}
                        >
                          <ListItemIcon>
                            <LibraryBooks color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={material.title}
                            secondary={`${material.format} • ${material.size}`}
                            primaryTypographyProps={{
                              fontWeight: 600,
                              variant: 'subtitle2',
                            }}
                          />
                        </ListItem>
                        {idx < materials.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </TabPanel>
          </Paper>
        </Grid>

        {/* Sidebar - Course Info & Playlist */}
        <Grid item xs={12} lg={4}>
          {/* Course Info Card */}
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Course Info
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>{course.duration}</strong> hours
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Person fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>{course.instructor}</strong>
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <PeopleAlt fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>{(course.students || 0).toLocaleString()}</strong> enrolled
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircle fontSize="small" color="success" />
                <Typography variant="body2" color="success.main" fontWeight="bold">
                  Enrolled ✓
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Button fullWidth variant="outlined" size="small" onClick={() => navigate('/learning')}>
              Back to Catalog
            </Button>
          </Paper>

          {/* Playlist/Videos List */}
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <VideoLibrary fontSize="small" />
              <Typography variant="subtitle1" fontWeight="bold">
                Course Videos ({videos.length})
              </Typography>
            </Box>

            {videos.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                No videos available.
              </Typography>
            ) : (
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {videos.map((video, idx) => (
                  <ListItemButton
                    key={idx}
                    selected={idx === currentVideoIndex}
                    onClick={() => setCurrentVideoIndex(idx)}
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: idx === currentVideoIndex ? 'primary.light' : 'grey.50',
                      '&:hover': { bgcolor: 'primary.lighter' },
                      border:
                        idx === currentVideoIndex ? '2px solid' : '2px solid transparent',
                      borderColor: idx === currentVideoIndex ? 'primary.main' : 'transparent',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {idx === currentVideoIndex ? (
                        <PlayArrow color="primary" />
                      ) : (
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">
                          {idx + 1}
                        </Typography>
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={video.title}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: idx === currentVideoIndex ? 700 : 600,
                        sx: {
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Expert Edit Dialog */}
      <CourseFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveCourse}
        course={course}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Course?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{course.title}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CoursePage;
