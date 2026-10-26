import React, { useState } from 'react';
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
  MenuBook,
  HelpOutline,
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
  const [expandedArticle, setExpandedArticle] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState('like');
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Resolve post author — supports both post.user and post.author shapes
  const postUser = resolvePostUser(post);
  const content = typeof post.content === 'string' ? post.content : post.content?.text || '';
  const images = post.content?.images || post.images || [];

  const isArticle = post.type === 'article' || content.startsWith('# ');
  let articleHeadline = null;
  let bodyContent = content;

  if (content.startsWith('# ')) {
    const firstNewline = content.indexOf('\n');
    if (firstNewline !== -1) {
      articleHeadline = content.slice(2, firstNewline).trim();
      bodyContent = content.slice(firstNewline + 1).trim();
    } else {
      articleHeadline = content.slice(2).trim();
      bodyContent = '';
    }
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 180));
  const isLong = bodyContent.length > 360;
  const displayedContent = isLong && !expandedArticle ? `${bodyContent.slice(0, 360)}...` : bodyContent;

  const reactions = [
    { key: 'like', emoji: '👍', label: 'Like', color: 'primary.main' },
    { key: 'love', emoji: '❤️', label: 'Love', color: '#D32F2F' },
    { key: 'celebrate', emoji: '🎉', label: 'Celebrate', color: '#E65100' },
    { key: 'insightful', emoji: '💡', label: 'Helpful', color: '#F57F17' },
  ];

  const handleSelectReaction = (key) => {
    setSelectedReaction(key);
    setShowReactionPicker(false);
    onLike(key);
  };

  return (
    <Paper 
      id={`post-${post._id}`}
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 2,
        ...neuRaised('md'),
        transition: 'outline 0.3s ease',
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
          <Box display="flex" gap={0.8} alignItems="center" mt={0.5} flexWrap="wrap">
            {post.category && post.category !== 'general' && (
              <Chip 
                label={post.category.replace('-', ' ')} 
                size="small" 
                onClick={() => onTagClick && onTagClick(post.category)}
                sx={{ 
                  height: 22, 
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: onTagClick ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  '&:hover': onTagClick ? { backgroundColor: 'primary.main', color: '#fff' } : {},
                }}
              />
            )}
            {post.type === 'question' && (
              <Chip
                icon={<HelpOutline sx={{ fontSize: 13 }} />}
                label="Question"
                size="small"
                sx={{
                  backgroundColor: 'rgba(142, 36, 170, 0.12)',
                  color: '#8E24AA',
                  fontWeight: 700,
                  height: 22,
                  fontSize: '0.7rem',
                }}
              />
            )}
            {post.type === 'success-story' && (
              <Chip
                label="🌾 Success Story"
                size="small"
                sx={{
                  backgroundColor: 'rgba(46, 125, 50, 0.12)',
                  color: '#2E7D32',
                  fontWeight: 700,
                  height: 22,
                  fontSize: '0.7rem',
                }}
              />
            )}
            {isArticle && (
              <Chip
                icon={<MenuBook sx={{ fontSize: 13 }} />}
                label={`${readMinutes} min read`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(251, 140, 0, 0.12)',
                  color: '#FB8C00',
                  fontWeight: 700,
                  height: 22,
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>
        </Box>
        <IconButton size="small" onClick={onPostMenu}>
          <MoreVert />
        </IconButton>
      </Box>

      {/* Post Article Title if present */}
      {articleHeadline && (
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: 'text.primary', lineHeight: 1.3 }}>
          {articleHeadline}
        </Typography>
      )}

      {/* Post Content */}
      <Typography 
        variant="body1" 
        paragraph 
        sx={{ 
          whiteSpace: 'pre-wrap',
          lineHeight: 1.65,
        }}
      >
        {displayedContent}
      </Typography>

      {isLong && (
        <Button
          size="small"
          variant="text"
          onClick={() => setExpandedArticle((prev) => !prev)}
          sx={{ textTransform: 'none', fontWeight: 600, mt: -1.5, mb: 1.5, p: 0, color: 'primary.main' }}
        >
          {expandedArticle ? 'Show Less ▴' : 'Read Full Post ▾'}
        </Button>
      )}

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
        <Box display="flex" alignItems="center" gap={0.5}>
          {(post.likes?.length || 0) > 0 && (
            <Box display="flex" alignItems="center" sx={{ cursor: 'default' }}>
              <span style={{ fontSize: 13, marginRight: 2 }}>👍</span>
              {(post.likes?.length || 0) > 1 && <span style={{ fontSize: 13, marginRight: 2 }}>❤️</span>}
            </Box>
          )}
          <Typography variant="caption" color="text.secondary">
            {post.likes?.length || 0} {post.likes?.length === 1 ? 'reaction' : 'reactions'}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {post.comments?.length || 0} comments • {post.shares || 0} shares
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Post Actions */}
      <Box display="flex" gap={1}>
        <Box
          sx={{ position: 'relative', flex: 1 }}
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          {showReactionPicker && (
            <Paper
              elevation={0}
              sx={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                mb: 1,
                p: 0.6,
                display: 'flex',
                gap: 0.8,
                borderRadius: 50,
                ...neuRaised('sm'),
                zIndex: 10,
              }}
            >
              {reactions.map((r) => (
                <Box
                  key={r.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectReaction(r.key);
                  }}
                  sx={{
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    p: 0.4,
                    borderRadius: '50%',
                    transition: 'transform 0.15s ease',
                    '&:hover': { transform: 'scale(1.35)' },
                  }}
                  title={r.label}
                >
                  {r.emoji}
                </Box>
              ))}
            </Paper>
          )}

          <Button
            fullWidth
            size="medium"
            startIcon={
              isLiked ? (
                selectedReaction === 'love' ? (
                  <span style={{ fontSize: 16 }}>❤️</span>
                ) : selectedReaction === 'celebrate' ? (
                  <span style={{ fontSize: 16 }}>🎉</span>
                ) : selectedReaction === 'insightful' ? (
                  <span style={{ fontSize: 16 }}>💡</span>
                ) : (
                  <ThumbUp />
                )
              ) : (
                <ThumbUpOutlined />
              )
            }
            onClick={onLike}
            sx={{
              color: isLiked ? 'primary.main' : 'text.secondary',
              ...(isLiked && { boxShadow: inset('sm') }),
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {isLiked
              ? reactions.find((r) => r.key === selectedReaction)?.label || 'Liked'
              : 'Like'}
          </Button>
        </Box>
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
        onViewProfile={onViewProfile}
      />
    </Paper>
  );
};

export default PostCard;
