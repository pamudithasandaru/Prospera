import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Bookmark,
  Article,
} from '@mui/icons-material';

const PostMenu = ({ anchorEl, onClose }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: 200 },
        },
      }}
    >
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <Bookmark fontSize="small" />
        </ListItemIcon>
        <ListItemText>Save Post</ListItemText>
      </MenuItem>
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <Article fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy Link</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={onClose}>
        <ListItemText>Report Post</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default PostMenu;
