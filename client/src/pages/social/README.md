# Prospera Social Media Platform

A modern, high-engagement, neumorphic social networking ecosystem tailored for farmers, agriculturalists, and agribusiness professionals.

---

## 🌾 Architecture & Components

```
social/
├── SocialFeed.js                  # Main feed container, search, state orchestration & routing
├── README.md                      # Comprehensive social documentation & feature guide
└── components/
    ├── index.js                   # Unified component exports
    ├── ProfileSidebar.js          # Left sidebar: user stats, network shortcuts & profile routing
    ├── CreatePostCard.js          # Main feed post trigger with media shortcuts (Photo, Video, Article)
    ├── CreatePostDialog.js        # Full modal post creation with hashtags, emojis & article mode
    ├── CreateStoryDialog.js       # Agricultural story creator with media selection
    ├── StoriesBar.js              # Stories carousel with gradient rings & pulse animations
    ├── StoryViewer.js             # Fullscreen story viewer with hold-to-pause indicator
    ├── FeedTabs.js                # Feed stream filter tabs with badge counters & category icons
    ├── PostCard.js                # Rich post cards with multi-reactions, tags, share & bookmark
    ├── CommentSection.js          # Comments with inline replies & @author tagging
    ├── TrendingSidebar.js         # Right sidebar: clickable trending topics & farmer recommendations
    ├── FarmerProfileModal.js      # Quick modal profile preview with connect & message actions
    └── PostMenu.js                # Post contextual menu (Save, Copy Link, Report, Delete)
```

---

## 🚀 Key Features & UX Upgrades

### 1. Unified Navigation & Route Corrections
- **Sidebar Profile Routing**: Cover photos and profile avatars navigate to `/profile` with user state intact.
- **Deep-Linked Profile Tabs**: "My Network" routes to `/profile?tab=connections`, "My Groups" routes to `/profile?tab=groups`.
- **Knowledge & Expert Hub**: "Expert Sessions" links directly to `/farm/expert`.
- **Author & Suggested Farmer Previews**: Clicking on any farmer's avatar or name opens the quick **FarmerProfileModal** without leaving the current feed position.

### 2. Quick Farmer Profile Modal (`FarmerProfileModal.js`)
- Instant preview modal displaying farmer location, farm size, primary crops, experience level, and bio.
- Quick action buttons: **Connect**, **Message**, and **View Full Profile** (`/profile`).

### 3. Interactive Post Cards (`PostCard.js`)
- **Multi-Reactions**: Farmers can react with **Like (👍)**, **Insightful (💡)**, or **Celebrate (🎉)** with an interactive reaction picker and dynamic reaction breakdown.
- **Clickable Hashtags**: Post hashtags (e.g. `#paddy`, `#fertilizer`, `#harvest`) trigger immediate feed filtering on click.
- **Bookmarks & Saved Posts**: Dedicated bookmark toggle with `localStorage` persistence and counter badge in FeedTabs.
- **Web Share API**: Native device sharing with automatic fallback to clipboard URL copying and user toast notifications.
- **Article Reading View**: Expandable/collapsible view for long-form agronomy guides and farming articles.

### 4. Feed Stream Filtering & Quick Search (`SocialFeed.js`)
- **6 Feed Streams**:
  - `For You`: Personalized community recommendations
  - `Following`: Updates strictly from connected farmers
  - `Trending`: Highly engaged discussions sorted by likes & comments
  - `Q&A`: Farming challenges, questions, and pest queries
  - `Stories`: Harvest milestones and success stories
  - `Saved`: Bookmarked posts for offline reference
- **Quick Search Bar**: Neumorphic search input filtering posts by keyword, crop, topic, or farmer name.
- **Active Filter Banner**: Displays active hashtag and search query chips with individual removals and "Clear All".
- **Starter Empty-State Templates**: When a feed stream or filter is empty, farmers are presented with ready-to-use post prompt templates (*Harvest Milestone*, *Agri Advice*, *Equipment Tips*, *Market Update*).

### 5. Media & Post Creation (`CreatePostCard.js` & `CreatePostDialog.js`)
- Direct shortcut buttons for **Photo**, **Video**, and **Article**.
- One-click agricultural hashtags suggestions bar (`#organic`, `#pestcontrol`, `#harvest`, `#irrigation`).
- Quick-insert agricultural emoji bar (🌾, 🚜, 🐛, 🌱, ☀️, 💧, 🌽, 🍎).
- Full article title input with preview support.

### 6. Interactive Inline Comments (`CommentSection.js`)
- Nested reply thread support with inline reply inputs.
- Automatic `@Author` tagging when hitting reply on any comment.
- Comment heart/like toggling with live counter.

### 7. Stories Bar & Viewer (`StoriesBar.js` & `StoryViewer.js`)
- Gradient ring borders with subtle pulse animations for unviewed stories.
- Fullscreen story viewer featuring progress bars, author info, and a **Paused** badge overlay when holding mouse/touch.

---

## 🎨 Design System & Theming

All social components adhere strictly to Prospera's signature design system:
- **Neumorphic Base**: `#e3e8f0` background with soft dual drop shadows (`neuRaised`, `neuInset`).
- **Brand Green**: `#1B5E20` primary green with `#4CAF50` accents.
- **Typography**: Inter / Outfit modern sans-serif scale.
- **Micro-interactions**: Smooth button scale transitions, reaction hover float effects, and chip animations.

---

## 🛠️ Verification & Build Status

- **Build Tooling**: React Scripts / Webpack production pipeline.
- **Status**: Compiles cleanly with standard production optimizations (`npm --prefix client run build`).
- **Dependencies**: React 18, Material-UI v5 (`@mui/material`, `@mui/icons-material`), React Router v6.
