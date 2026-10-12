import React from 'react';
import {
  Paper,
  Box,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import {
  Image as ImageIcon,
  Videocam,
  Article,
} from '@mui/icons-material';
import { resolveAvatar } from '../../../utils/avatarUtils';
import { neuInset, inset } from '../../../neumorphic';

const CreatePostCard = ({ user, onOpenDialog, setPostType }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2.5, 
        mb: 2,
      }}
    >
      <Box display="flex" gap={2} alignItems="center">
        <Avatar 
          src={resolveAvatar(user)}
          sx={{ width: 48, height: 48 }}
        >
          {user?.name?.charAt(0)}
        </Avatar>
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
            ...neuInset('sm'),
            '&:hover': { boxShadow: inset('md') },
          }}
        >
          Share your farming experience...
        </Button>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box display="flex" justifyContent="space-around">
        <Button
          startIcon={<ImageIcon sx={{ color: '#2196F3' }} />}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
          onClick={() => {
            setPostType('post');
            onOpenDialog();
          }}
        >
          Photo
        </Button>
        <Button
          startIcon={<Videocam sx={{ color: '#4CAF50' }} />}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
          onClick={() => {
            setPostType('post');
            onOpenDialog();
          }}
        >
          Video
        </Button>
        <Button
          startIcon={<Article sx={{ color: '#FF9800' }} />}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
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
