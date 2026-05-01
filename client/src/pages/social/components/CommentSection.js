import React, { useState } from 'react';
import {
  Box,
  Avatar,
  TextField,
  IconButton,
  Typography,
  Divider,
  Collapse,
  alpha,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { resolveAvatar } from '../../../utils/avatarUtils';

const CommentSection = ({ 
  post, 
  user, 
  isExpanded, 
  commentText, 
  onCommentChange, 
  onAddComment 
}) => {
  const [likedComments, setLikedComments] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const toggleCommentLike = (idx) => {
    setLikedComments((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleReply = (idx) => {
    setReplyingTo((prev) => (prev === idx ? null : idx));
  };
  return (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <Box mt={2}>
        <Divider sx={{ mb: 2 }} />
        
        {/* Add Comment */}
        <Box display="flex" gap={1.5} mb={2}>
          <Avatar 
            src={resolveAvatar(user)}
            sx={{ width: 36, height: 36 }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <Box flexGrow={1} display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a comment..."
              value={commentText}
              onChange={onCommentChange}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 50,
                },
              }}
            />
            <IconButton 
              color="primary"
              disabled={!commentText?.trim()}
              onClick={onAddComment}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>

        {/* Comments List */}
        {post.comments && post.comments.length > 0 && (
          <Box display="flex" flexDirection="column" gap={2}>
            {post.comments.map((comment, idx) => (
              <Box key={`comment-${post._id}-${idx}`} display="flex" gap={1.5}>
                <Avatar 
                  src={resolveAvatar(comment.user)}
                  sx={{ width: 36, height: 36 }}
                >
                  {comment.user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box 
                  flexGrow={1} 
                  sx={{ 
                    bgcolor: alpha('#000', 0.03),
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {comment.user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {comment.text}
                  </Typography>
                  <Box display="flex" gap={2} mt={1}>
                    <Typography 
                      variant="caption" 
                      onClick={() => toggleCommentLike(idx)}
                      sx={{ 
                        color: likedComments[idx] ? 'primary.main' : 'text.secondary',
                        fontWeight: likedComments[idx] ? 700 : 400,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {likedComments[idx] ? 'Liked' : 'Like'}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      onClick={() => toggleReply(idx)}
                      sx={{ 
                        color: replyingTo === idx ? 'primary.main' : 'text.secondary',
                        fontWeight: replyingTo === idx ? 700 : 400,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Reply
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                {/* Inline reply input */}
                {replyingTo === idx && (
                  <Box display="flex" gap={1} mt={1} ml={6}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={`Reply to ${comment.user?.name || 'User'}...`}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50 } }}
                    />
                    <IconButton color="primary" size="small" onClick={() => toggleReply(idx)}>
                      <Send fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Collapse>
  );
};

export default CommentSection;
