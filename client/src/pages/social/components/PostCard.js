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
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Share,
  MoreVert,
  Bookmark,
  BookmarkBorder,
  ChatBubbleOutline,
  Verified,
} from '@mui/icons-material';
import CommentSection from './CommentSection';
import { resolvePostUser } from '../../../utils/avatarUtils';
import { neuRaised, inset } from '../../../neumorphic';


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
  onViewProfile,
  onTagClick,
  isSaved,
  onToggleSave,
}) => {
  // Resolve post author — supports both post.user and post.author shapes
  const postUser = resolvePostUser(post);
  const content = typeof post.content === 'string' ? post.content : post.content?.text || '';
  const images = post.content?.images || post.images || [];
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 2,
        ...neuRaised('md'),
      }}
    >
      {/* Post Header */}
      <Box display="flex" gap={1.5} mb={2}>
        <Avatar 
          src={postUser.resolvedAvatar}
          onClick={() => onViewProfile && onViewProfile(postUser)}
          sx={{ 
            width: 48, 
            height: 48,
            cursor: onViewProfile ? 'pointer' : 'default',
            transition: 'transform 0.2s ease',
            '&:hover': onViewProfile ? { transform: 'scale(1.06)' } : {},
          }}
        >
          {postUser.name?.charAt(0)}
        </Avatar>
        <Box flexGrow={1}>
          <Box 
            display="flex" 
            alignItems="center" 
            gap={0.5}
            onClick={() => onViewProfile && onViewProfile(postUser)}
            sx={{
              cursor: onViewProfile ? 'pointer' : 'default',
              width: 'fit-content',
              '&:hover .author-name': { color: 'primary.main', textDecoration: 'underline' },
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" className="author-name" sx={{ transition: 'color 0.2s' }}>
              {postUser.name || 'Unknown User'}
            </Typography>
            {postUser.profile?.verificationBadge && (
              <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {postUser.role ? postUser.role.charAt(0).toUpperCase() + postUser.role.slice(1) : 'Member'} • {new Date(post.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </Typography>
          {post.category && post.category !== 'general' && (
            <Chip 
              label={post.category.replace('-', ' ')} 
              size="small" 
              onClick={() => onTagClick && onTagClick(post.category)}
              sx={{ 
                mt: 0.5, 
                height: 22, 
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: onTagClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': onTagClick ? { backgroundColor: 'primary.main', color: '#fff' } : {},
              }}
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
              label={`#${tag.replace(/^#/, '')}`} 
              size="small" 
              variant="outlined"
              color="primary"
              onClick={() => onTagClick && onTagClick(tag.replace(/^#/, ''))}
              sx={{ 
                borderRadius: 2,
                cursor: onTagClick ? 'pointer' : 'default',
                fontWeight: 500,
                fontSize: '0.75rem',
                transition: 'all 0.2s ease',
                '&:hover': onTagClick ? { backgroundColor: 'primary.main', color: '#fff' } : {},
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
            ...(isLiked && { boxShadow: inset('sm') }),
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
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Share
        </Button>
        <IconButton 
          size="small"
          onClick={onToggleSave}
          title={isSaved ? 'Remove from Saved' : 'Save Post'}
          sx={{
            color: isSaved ? 'primary.main' : 'text.secondary',
            transition: 'all 0.2s ease',
            '&:hover': { transform: 'scale(1.15)', color: 'primary.main' },
          }}
        >
          {isSaved ? <Bookmark /> : <BookmarkBorder />}
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
