import React from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import {
  Explore,
  People,
  TrendingUp,
  QuestionAnswer,
  EmojiEvents,
  Bookmark,
} from '@mui/icons-material';
import { neuColors, inset } from '../../../neumorphic';

const FeedTabs = ({ value, onChange, savedCount = 0 }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 2,
        borderRadius: 3,
        p: 0.5,
        overflow: 'hidden',
      }}
    >
      <Tabs 
        value={value} 
        onChange={onChange} 
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: 46,
          '& .MuiTabs-indicator': {
            display: 'none',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            minHeight: 40,
            py: 1,
            px: 2,
            borderRadius: 2.5,
            mx: 0.5,
            color: 'text.secondary',
            transition: 'all 0.25s ease',
            '&.Mui-selected': {
              color: neuColors.primary,
              backgroundColor: 'rgba(27, 94, 32, 0.12)',
              boxShadow: inset('xs'),
            },
            '&:hover:not(.Mui-selected)': {
              color: 'text.primary',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
            },
          },
        }}
      >
        <Tab 
          icon={<Explore sx={{ fontSize: 18 }} />} 
          iconPosition="start" 
          label="For You" 
        />
        <Tab 
          icon={<People sx={{ fontSize: 18 }} />} 
          iconPosition="start" 
          label="Network" 
        />
        <Tab 
          icon={<TrendingUp sx={{ fontSize: 18 }} />} 
          iconPosition="start" 
          label="Trending" 
        />
        <Tab 
          icon={<QuestionAnswer sx={{ fontSize: 18 }} />} 
          iconPosition="start" 
          label="Q&A" 
        />
        <Tab 
          icon={<EmojiEvents sx={{ fontSize: 18 }} />} 
          iconPosition="start" 
          label="Success" 
        />
        <Tab 
          icon={<Bookmark sx={{ fontSize: 18 }} />} 
          iconPosition="start" 
          label={
            <Box display="flex" alignItems="center" gap={0.5}>
              Saved {savedCount > 0 ? `(${savedCount})` : ''}
            </Box>
          } 
        />
      </Tabs>
    </Paper>
  );
};

export default FeedTabs;
