import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Avatar,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Image as ImageIcon,
  Videocam,
  Article,
  HelpOutline,
} from '@mui/icons-material';
import { resolveAvatar } from '../../../utils/avatarUtils';
import { neuRaised, neuInset, inset } from '../../../neumorphic';

const CreatePostCard = ({ user, onOpenDialog, setPostType }) => {
  const navigate = useNavigate();

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2.5, 
        mb: 2,
        ...neuRaised('md'),
        borderRadius: 3,
      }}
    >
      <Box display="flex" gap={2} alignItems="center">
        <Tooltip title="View My Profile">
          <Avatar 
            src={resolveAvatar(user)}
            onClick={() => navigate('/profile')}
            sx={{ 
              width: 48, 
              height: 48,
              cursor: 'pointer',
              ...neuRaised('xs'),
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.08)' },
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
        </Tooltip>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            setPostType('post');
            onOpenDialog();
          }}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            color: 'text.secondary',
            borderRadius: 50,
            px: 3,
            py: 1.5,
            fontSize: '0.92rem',
            ...neuInset('sm'),
            '&:hover': { boxShadow: inset('md'), color: 'text.primary' },
          }}
        >
          Share your harvest, questions, or farming tips...
        </Button>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Button
          startIcon={<ImageIcon sx={{ color: '#1E88E5' }} />}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            '&:hover': { backgroundColor: 'rgba(30, 136, 229, 0.08)', color: '#1E88E5' },
          }}
          onClick={() => {
            setPostType('post');
            onOpenDialog();
          }}
        >
          Photo
        </Button>
        <Button
          startIcon={<Videocam sx={{ color: '#43A047' }} />}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            '&:hover': { backgroundColor: 'rgba(67, 160, 71, 0.08)', color: '#43A047' },
          }}
          onClick={() => {
            setPostType('post');
            onOpenDialog();
          }}
        >
          Video
        </Button>
        <Button
          startIcon={<HelpOutline sx={{ color: '#8E24AA' }} />}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            '&:hover': { backgroundColor: 'rgba(142, 36, 170, 0.08)', color: '#8E24AA' },
          }}
          onClick={() => {
            setPostType('question');
            onOpenDialog();
          }}
        >
          Ask Question
        </Button>
        <Button
          startIcon={<Article sx={{ color: '#FB8C00' }} />}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            '&:hover': { backgroundColor: 'rgba(251, 140, 0, 0.08)', color: '#FB8C00' },
          }}
          onClick={() => {
            setPostType('article');
            onOpenDialog();
          }}
        >
          Article
        </Button>
      </Box>
    </Paper>
  );
};

export default CreatePostCard;
