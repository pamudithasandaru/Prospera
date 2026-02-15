# Social Feed Components

This directory contains modular, reusable components for the professional farmer social networking platform.

## Component Structure

```
social/
├── SocialFeed.js              # Main container component
└── components/
    ├── index.js               # Component exports
    ├── ProfileSidebar.js      # Left sidebar - User profile & quick links
    ├── CreatePostCard.js      # Post creation trigger card
    ├── PostCard.js            # Individual post display
    ├── CommentSection.js      # Post comments section
    ├── TrendingSidebar.js     # Right sidebar - Trending & networking
    ├── CreatePostDialog.js    # Full post creation modal
    ├── PostMenu.js            # Post actions menu
    └── FeedTabs.js            # Feed filtering tabs
```

## Components Overview

### ProfileSidebar
**Location:** Left sidebar  
**Purpose:** Displays user profile with:
- Cover image and avatar
- Verification badge
- Profile stats (viewers, impressions)
- Quick navigation links (Network, Groups, Knowledge Hub, Expert Sessions)
- Recent connections

### CreatePostCard
**Location:** Main feed (top)  
**Purpose:** Quick post creation trigger with:
- Text input placeholder
- Media type shortcuts (Photo, Video, Article)
- Opens full creation dialog

### PostCard  
**Location:** Main feed  
**Purpose:** Displays individual posts with:
- Author information and verification
- Post content (text, images, categories)
- Tags and hashtags
- Interaction buttons (Like, Comment, Share, Bookmark)
- Expandable comment section
- Post menu (Save, Copy, Report)

### CommentSection
**Location:** Inside PostCard  
**Purpose:** Handles post comments:
- Add new comment
- Display existing comments
- Like and reply to comments
- Comment timestamp

### TrendingSidebar
**Location:** Right sidebar  
**Purpose:** Displays:
- Trending topics with post counts
- Suggested farming groups
- Connect with farmers suggestions
- Quick Connect and Message actions

### CreatePostDialog
**Location:** Modal overlay  
**Purpose:** Full post creation experience:
- Post type selection (General, Question, Success Story, Alert)
- Category selection (Crop Management, Livestock, Technology, etc.)
- Privacy settings (Public, Connections, Private)
- Rich text editor
- Media upload (Images, Videos, Attachments, Emojis)
- Character count and preview

### PostMenu
**Location:** Dropdown from post actions  
**Purpose:** Additional post actions:
- Save post
- Copy link
- Report post

### FeedTabs
**Location:** Main feed (below create post)  
**Purpose:** Filter posts by:
- For You (personalized)
- Following (connections only)
- Trending (popular posts)

## Design Principles

1. **Modular**: Each component is self-contained and reusable
2. **Props-driven**: Components receive data and callbacks via props
3. **Consistent styling**: Uses Material-UI theme with agricultural green palette
4. **Professional layout**: LinkedIn-inspired design for farmers
5. **Responsive**: Adapts to mobile, tablet, and desktop screens

## Usage Example

```javascript
import React from 'react';
import { ProfileSidebar, PostCard, TrendingSidebar } from './components';

// Use individual components
<ProfileSidebar user={user} />
<PostCard post={post} onLike={handleLike} />
<TrendingSidebar />
```

## State Management

Main state is managed in `SocialFeed.js`:
- `posts`: Array of post objects
- `loading`: Loading state for API calls
- `tab`: Current feed tab (0: For You, 1: Following, 2: Trending)
- `postDialogOpen`: Dialog visibility
- `expandedComments`: Track which posts have comments expanded
- `commentText`: Text for comments being composed

## API Integration

Components interact with backend through:
- `GET /api/social/posts` - Fetch posts
- `POST /api/social/post` - Create new post
- `POST /api/social/post/:id/like` - Like/unlike post
- `POST /api/social/post/:id/comment` - Add comment

## Future Enhancements

- Real-time updates with WebSocket
- Image upload with preview
- Video upload and playback
- Message feature implementation
- Group management
- Notification system
- Advanced search and filters
