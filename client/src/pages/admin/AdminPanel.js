import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import { Dashboard, People, Article, School, Storefront, ShoppingBag, AccountBalance, Support, Payments } from '@mui/icons-material';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminPosts from './AdminPosts';
import AdminCourses from './AdminCourses';
import AdminListings from './AdminListings';
import AdminProducts from './AdminProducts';
import AdminSchemes from './AdminSchemes';
import AdminTickets from './AdminTickets';
import AdminLoans from './AdminLoans';

const AdminPanel = () => {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Box mb={2}>
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Admin Panel
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Platform overview, user management and content moderation
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
      >
        <Tab icon={<Dashboard sx={{ fontSize: 18 }} />} iconPosition="start" label="Overview" />
        <Tab icon={<People sx={{ fontSize: 18 }} />} iconPosition="start" label="Users" />
        <Tab icon={<Article sx={{ fontSize: 18 }} />} iconPosition="start" label="Posts" />
        <Tab icon={<School sx={{ fontSize: 18 }} />} iconPosition="start" label="Courses" />
        <Tab icon={<Storefront sx={{ fontSize: 18 }} />} iconPosition="start" label="Market" />
        <Tab icon={<ShoppingBag sx={{ fontSize: 18 }} />} iconPosition="start" label="Products" />
        <Tab icon={<AccountBalance sx={{ fontSize: 18 }} />} iconPosition="start" label="Schemes" />
        <Tab icon={<Support sx={{ fontSize: 18 }} />} iconPosition="start" label="Tickets" />
        <Tab icon={<Payments sx={{ fontSize: 18 }} />} iconPosition="start" label="Loans" />
      </Tabs>

      {tab === 0 && <AdminOverview />}
      {tab === 1 && <AdminUsers />}
      {tab === 2 && <AdminPosts />}
      {tab === 3 && <AdminCourses />}
      {tab === 4 && <AdminListings />}
      {tab === 5 && <AdminProducts />}
      {tab === 6 && <AdminSchemes />}
      {tab === 7 && <AdminTickets />}
      {tab === 8 && <AdminLoans />}
    </Container>
  );
};

export default AdminPanel;
