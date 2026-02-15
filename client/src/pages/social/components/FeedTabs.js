import React from 'react';
import {
  Paper,
  Tabs,
  Tab,
} from '@mui/material';

const FeedTabs = ({ value, onChange }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Tabs 
        value={value} 
        onChange={onChange} 
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
          },
        }}
      >
        <Tab label="For You" />
        <Tab label="Following" />
        <Tab label="Trending" />
      </Tabs>
    </Paper>
  );
};

export default FeedTabs;
