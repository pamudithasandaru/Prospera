import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  IconButton,
  Button,
  Divider,
  Chip,
  alpha,
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Share,
  MoreVert,
  BookmarkBorder,
  ChatBubbleOutline,
  Verified,
} from '@mui/icons-material';
import CommentSection from './CommentSection';

const PostCard = ({ 
  post, 
  user, 
  isLiked, 
  onLike,
  onShare,
  onPostMenu,
  isCommentsExpanded,
  onToggleComments,
  commentText,
  onCommentChange,
  onAddComment,
}) => {
  const content = typeof post.content === 'string' ? post.content : post.content?.text || '';
  const images = post.content?.images || post.images || [];
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Post Header */}
      <Box display="flex" gap={1.5} mb={2}>
        <Avatar 
          src={post.author?.profile?.profilePicture || post.author?.profile?.avatar}
          sx={{ width: 48, height: 48 }}
        >
          {post.author?.name?.charAt(0)}
        </Avatar>
        <Box flexGrow={1}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography variant="subtitle1" fontWeight="bold">
              {post.author?.name || 'Unknown User'}
            </Typography>
            {post.author?.profile?.verificationBadge && (
              <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Farmer • {new Date(post.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </Typography>
          {post.category && post.category !== 'general' && (
            <Chip 
              label={post.category.replace('-', ' ')} 
              size="small" 
              sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
        <IconButton size="small" onClick={onPostMenu}>
          <MoreVert />
        </IconButton>
      </Box>

      {/* Post Content */}
      <Typography 
        variant="body1" 
        paragraph 
        sx={{ 
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}
      >
        {content}
      </Typography>

      {/* Post Images */}
      {images.length > 0 && (
        <Box mb={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <img
            src={images[0]}
            alt="Post content"
            style={{ 
              width: '100%', 
              maxHeight: 500, 
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>
      )}

      {/* Post Tags */}
      {post.tags && post.tags.length > 0 && (
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          {post.tags.map((tag, index) => (
            <Chip 
              key={`tag-${post._id}-${index}`}
              label={`#${tag}`} 
              size="small" 
              variant="outlined"
              sx={{ 
                borderRadius: 1,
                '&:hover': { 
                  bgcolor: alpha('#4CAF50', 0.08),
                  cursor: 'pointer',
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Post Stats */}
      <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
        <Typography variant="caption" color="text.secondary">
          {post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {post.comments?.length || 0} comments • {post.shares || 0} shares
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Post Actions */}
      <Box display="flex" gap={1}>
        <Button
          fullWidth
          size="medium"
          startIcon={isLiked ? <ThumbUp /> : <ThumbUpOutlined />}
          onClick={onLike}
          sx={{
            color: isLiked ? 'primary.main' : 'text.secondary',
            '&:hover': { bgcolor: alpha('#4CAF50', 0.08) },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Like
        </Button>
        <Button
          fullWidth
          size="medium"
          startIcon={<ChatBubbleOutline />}
          onClick={onToggleComments}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: alpha('#2196F3', 0.08) },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Comment
        </Button>
        <Button
          fullWidth
          size="medium"
          startIcon={<Share />}
          onClick={onShare}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: alpha('#FF9800', 0.08) },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Share
        </Button>
        <IconButton 
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: alpha('#000', 0.04) },
          }}
        >
          <BookmarkBorder />
        </IconButton>
      </Box>

      {/* Comments Section */}
      <CommentSection
        post={post}
        user={user}
        isExpanded={isCommentsExpanded}
        commentText={commentText}
        onCommentChange={onCommentChange}
        onAddComment={onAddComment}
      />
    </Paper>
  );
};

export default PostCard;
