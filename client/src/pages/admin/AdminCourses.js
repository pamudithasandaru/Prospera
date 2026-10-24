import React, { useState } from 'react';
import {
  Paper, Box, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip, Typography, Alert,
  Button, Chip, LinearProgress,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import api from '../../services/api';
import {
  useAdminList, useToast, SearchBar, ListFooter, ConfirmDialog, FormDialog, EmptyRow, errMsg, options,
} from './adminCommon';

const FIELDS = [
  { name: 'title', label: 'Title', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'category', label: 'Category', required: true },
  { name: 'level', label: 'Level', type: 'select', options: options(['beginner', 'intermediate', 'advanced']) },
  { name: 'duration', label: 'Duration (minutes)', type: 'number', required: true, step: 1 },
  { name: 'instructorName', label: 'Instructor name', required: true },
  { name: 'thumbnail', label: 'Thumbnail URL (optional)' },
];

const AdminCourses = () => {
  const list = useAdminList('/admin/courses');
  const [toast, notify] = useToast();
  const [form, setForm] = useState(null); // { course | null }
  const [confirm, setConfirm] = useState(null);

  const save = async (values) => {
    if (form.course) {
      await api.patch(`/admin/courses/${form.course._id}`, values);
      notify('Course updated');
    } else {
      await api.post('/admin/courses', values);
      notify('Course created');
    }
    setForm(null);
    list.reload();
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
        <Button variant="contained" startIcon={<Add />} onClick={() => setForm({ course: null })}>Add course</Button>
      </SearchBar>
      {list.error && <Alert severity="error" sx={{ mb: 2 }}>{list.error}</Alert>}
      {list.loading && <LinearProgress sx={{ mb: 1 }} />}

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell align="right">Minutes</TableCell>
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
                <TableCell align="right">{c.enrolledStudents}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Edit"><IconButton onClick={() => setForm({ course: c })}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton color="error" onClick={() => setConfirm(c)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            <EmptyRow show={!list.loading && list.rows.length === 0} cols={6}>No courses found</EmptyRow>
          </TableBody>
        </Table>
      </Box>
      <ListFooter pagination={list.pagination} page={list.page} setPage={list.setPage} noun="courses" />

      <FormDialog
        open={Boolean(form)}
        title={form?.course ? 'Edit course' : 'Add course'}
        fields={FIELDS}
        initial={form?.course}
        onClose={() => setForm(null)}
        onSubmit={save}
      />
      <ConfirmDialog open={Boolean(confirm)} title="Delete course?" confirmLabel="Delete" onCancel={() => setConfirm(null)} onConfirm={remove}>
        <strong>{confirm?.title}</strong> and its videos, materials and enrolments will be permanently deleted.
      </ConfirmDialog>
      {toast}
    </Paper>
  );
};

export default AdminCourses;
