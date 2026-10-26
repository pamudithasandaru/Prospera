import React, { useState } from 'react';
import {
  Paper, Box, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip, Typography, Alert,
  Button, Chip, LinearProgress,
} from '@mui/material';
import { Add, Delete, Edit, VideoLibrary, LibraryBooks } from '@mui/icons-material';
import api from '../../services/api';
import CourseFormDialog from '../learning/CourseFormDialog';
import {
  useAdminList, useToast, SearchBar, ListFooter, ConfirmDialog, EmptyRow, ActionCell, errMsg,
} from './adminCommon';

const AdminCourses = () => {
  const list = useAdminList('/admin/courses');
  const [toast, notify] = useToast();
  const [editor, setEditor] = useState({ open: false, course: null });
  const [saving, setSaving] = useState(false);
  const [opening, setOpening] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const openCreate = () => setEditor({ open: true, course: null });

  // The list only carries counts, so load the full course (videos + materials) before editing.
  const openEdit = async (c) => {
    setOpening(true);
    try {
      const res = await api.get(`/admin/courses/${c._id}`);
      setEditor({ open: true, course: res.data.data });
    } catch (err) {
      notify(errMsg(err, 'Failed to load the course'), 'error');
    } finally {
      setOpening(false);
    }
  };

  const closeEditor = () => setEditor({ open: false, course: null });

  // Errors are thrown on purpose: the dialog shows the server's message and stays open.
  const saveCourse = async (v) => {
    setSaving(true);
    try {
      const payload = {
        title: v.title,
        description: v.description,
        category: v.category,
        level: v.level,
        duration: v.duration,
        thumbnail: v.thumbnail,
        instructorName: v.instructorName,
        videos: v.videos,
        materials: v.materials,
      };
      if (editor.course) {
        await api.patch(`/admin/courses/${editor.course._id}`, payload);
        notify('Course updated');
      } else {
        await api.post('/admin/courses', payload);
        notify('Course created');
      }
      closeEditor();
      list.reload();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const c = confirm;
    setConfirm(null);
    try {
      await api.delete(`/admin/courses/${c._id}`);
      notify('Course deleted');
      list.reload();
    } catch (err) {
      notify(errMsg(err, 'Failed to delete course'), 'error');
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search title, category or instructor…">
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add course</Button>
      </SearchBar>
      {list.error && <Alert severity="error" sx={{ mb: 2 }}>{list.error}</Alert>}
      {(list.loading || opening) && <LinearProgress sx={{ mb: 1 }} />}

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell align="right">Hours</TableCell>
              <TableCell align="center">Videos</TableCell>
              <TableCell align="center">Materials</TableCell>
              <TableCell align="right">Enrolled</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.rows.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell sx={{ minWidth: 220 }}>
                  <Typography variant="body2" fontWeight={600}>{c.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.category}</Typography>
                </TableCell>
                <TableCell><Chip size="small" label={c.level} sx={{ textTransform: 'capitalize' }} /></TableCell>
                <TableCell>{c.instructorName}</TableCell>
                <TableCell align="right">{c.duration}</TableCell>
                <TableCell align="center">
                  <Chip size="small" icon={<VideoLibrary />} label={c.videosCount} variant={c.videosCount ? 'filled' : 'outlined'} />
                </TableCell>
                <TableCell align="center">
                  <Chip size="small" icon={<LibraryBooks />} label={c.materialsCount} variant={c.materialsCount ? 'filled' : 'outlined'} />
                </TableCell>
                <TableCell align="right">{c.enrolledStudents}</TableCell>
                <ActionCell>
                  <Tooltip title="Edit course, videos and materials">
                    <IconButton onClick={() => openEdit(c)} disabled={opening}><Edit /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete"><IconButton color="error" onClick={() => setConfirm(c)}><Delete /></IconButton></Tooltip>
                </ActionCell>
              </TableRow>
            ))}
            <EmptyRow show={!list.loading && list.rows.length === 0} cols={8}>No courses found</EmptyRow>
          </TableBody>
        </Table>
      </Box>
      <ListFooter pagination={list.pagination} page={list.page} setPage={list.setPage} noun="courses" />

      <CourseFormDialog
        open={editor.open}
        course={editor.course}
        saving={saving}
        showInstructor
        onClose={closeEditor}
        onSave={saveCourse}
      />
      <ConfirmDialog open={Boolean(confirm)} title="Delete course?" confirmLabel="Delete" onCancel={() => setConfirm(null)} onConfirm={remove}>
        <strong>{confirm?.title}</strong> and its {confirm?.videosCount} video(s), {confirm?.materialsCount} material(s)
        and all enrolments will be permanently deleted.
      </ConfirmDialog>
      {toast}
    </Paper>
  );
};

export default AdminCourses;
