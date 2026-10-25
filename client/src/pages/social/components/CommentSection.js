import React, { useState } from 'react';
import {
  Box,
  Avatar,
  TextField,
  IconButton,
  Typography,
  Divider,
  Collapse,
} from '@mui/material';
import { Send, Favorite, FavoriteBorder } from '@mui/icons-material';
import { resolveAvatar } from '../../../utils/avatarUtils';
import { neuInset } from '../../../neumorphic';

const CommentSection = ({ 
  post, 
  user, 
  isExpanded, 
  commentText, 
  onCommentChange, 
  onAddComment,
  onViewProfile,
}) => {
  const [likedComments, setLikedComments] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});

  const toggleCommentLike = (idx) => {
    setLikedComments((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleReply = (idx) => {
    setReplyingTo((prev) => (prev === idx ? null : idx));
  };

  const handleSendReply = (comment, idx) => {
    const text = replyInputs[idx]?.trim();
    if (!text) return;
    const authorName = comment.user?.name || 'Farmer';
    const fullComment = `@${authorName} ${text}`;
    if (onAddComment) {
      onAddComment(fullComment);
    }
    setReplyInputs((prev) => ({ ...prev, [idx]: '' }));
    setReplyingTo(null);
  };

  return (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <Box mt={2}>
        <Divider sx={{ mb: 2 }} />
        
        {/* Add Comment Input */}
        <Box display="flex" gap={1.5} mb={2}>
          <Avatar 
            src={resolveAvatar(user)}
            onClick={() => onViewProfile && onViewProfile(user)}
            sx={{ 
              width: 36, 
              height: 36,
              cursor: onViewProfile ? 'pointer' : 'default',
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <Box flexGrow={1} display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment or helpful advice..."
              value={commentText}
              onChange={onCommentChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (commentText?.trim()) onAddComment();
                }
              }}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 50,
                  fontSize: '0.88rem',
                },
              }}
            />
            <IconButton 
              color="primary"
              disabled={!commentText?.trim()}
              onClick={() => onAddComment()}
            >
              <Send fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Comments List */}
        {post.comments && post.comments.length > 0 && (
          <Box display="flex" flexDirection="column" gap={2}>
            {post.comments.map((comment, idx) => {
              const isLiked = likedComments[idx];
              const commentUser = comment.user || {};
              const commentDate = comment.date || comment.createdAt;
              const formattedDate = commentDate
                ? new Date(commentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : 'Just now';

              return (
                <Box key={`comment-${post._id}-${idx}`} display="flex" gap={1.5}>
                  <Avatar 
                    src={resolveAvatar(commentUser)}
                    onClick={() => onViewProfile && onViewProfile(commentUser)}
                    sx={{ 
                      width: 36, 
                      height: 36,
                      cursor: onViewProfile ? 'pointer' : 'default',
                      transition: 'transform 0.2s',
                      '&:hover': onViewProfile ? { transform: 'scale(1.1)' } : {},
                    }}
                  >
                    {commentUser.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box flexGrow={1}>
                    <Box 
                      sx={{ 
                        ...neuInset('sm'),
                        borderRadius: 2.5,
                        p: 1.5,
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography 
                          variant="subtitle2" 
                          fontWeight="bold"
                          onClick={() => onViewProfile && onViewProfile(commentUser)}
                          sx={{ 
                            cursor: onViewProfile ? 'pointer' : 'default',
                            '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                          }}
                        >
                          {commentUser.name || 'Member'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formattedDate}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.primary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                        {comment.text}
                      </Typography>
                    </Box>

                    {/* Reactions & Reply actions */}
                    <Box display="flex" alignItems="center" gap={2} mt={0.5} ml={1}>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        onClick={() => toggleCommentLike(idx)}
                        sx={{
                          cursor: 'pointer',
                          color: isLiked ? 'error.main' : 'text.secondary',
                          userSelect: 'none',
                          '&:hover': { opacity: 0.8 },
                        }}
                      >
                        {isLiked ? (
                          <Favorite sx={{ fontSize: 14, color: 'error.main' }} />
                        ) : (
                          <FavoriteBorder sx={{ fontSize: 14 }} />
                        )}
                        <Typography variant="caption" fontWeight={isLiked ? 700 : 500}>
                          {isLiked ? 'Liked' : 'Like'}
                        </Typography>
                      </Box>

                      <Typography 
                        variant="caption" 
                        onClick={() => toggleReply(idx)}
                        sx={{ 
                          color: replyingTo === idx ? 'primary.main' : 'text.secondary',
                          fontWeight: replyingTo === idx ? 700 : 500,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline', color: 'primary.main' },
                        }}
                      >
                        Reply
                      </Typography>
                    </Box>

                    {/* Inline reply input */}
                    {replyingTo === idx && (
                      <Box display="flex" gap={1} mt={1}>
                        <TextField
                          fullWidth
                          size="small"
                          autoFocus
                          placeholder={`Reply to ${commentUser.name || 'Member'}...`}
                          value={replyInputs[idx] || ''}
                          onChange={(e) => setReplyInputs({ ...replyInputs, [idx]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply(comment, idx);
                            }
                          }}
                          variant="outlined"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50, fontSize: '0.85rem' } }}
                        />
                        <IconButton 
                          color="primary" 
                          size="small"
                          disabled={!replyInputs[idx]?.trim()}
                          onClick={() => handleSendReply(comment, idx)}
                        >
                          <Send fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Collapse>
  );
};

export default CommentSection;
