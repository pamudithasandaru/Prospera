import React from 'react';
import {
  Box, Paper, Typography, Grid, Chip, LinearProgress, Divider,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AttachMoney, Grass, Terrain, EmojiEvents,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b', '#e91e63', '#3f51b5'];

const StatCard = ({ label, value, icon, color = 'primary.main', prefix = '' }) => (
  <Paper sx={{ p: 2.5, height: '100%' }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight="bold" color={color}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
      </Box>
      {icon}
    </Box>
  </Paper>
);

const FarmInsightsPanel = ({ insights, farmName = '' }) => {
  if (!insights) return null;

  const {
    totalRevenue, totalExpenses, netProfit, profitMargin,
    revenuePerAcre, expensePerAcre, activeCrops, totalCrops,
    landUtilization, expenseBreakdown, topRevenueCrop,
  } = insights;

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        📊 Farm Insights {farmName && `— ${farmName}`}
      </Typography>

      {/* Main KPI Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Revenue"
            value={totalRevenue}
            prefix="LKR "
            color="success.main"
            icon={<TrendingUp sx={{ fontSize: 36, color: 'success.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Expenses"
            value={totalExpenses}
            prefix="LKR "
            color="error.main"
            icon={<TrendingDown sx={{ fontSize: 36, color: 'error.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Net Profit"
            value={netProfit}
            prefix="LKR "
            color={netProfit >= 0 ? 'success.main' : 'error.main'}
            icon={<AttachMoney sx={{ fontSize: 36, color: netProfit >= 0 ? 'success.main' : 'error.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Profit Margin"
            value={`${profitMargin}%`}
            color={profitMargin >= 0 ? 'success.main' : 'error.main'}
            icon={<AttachMoney sx={{ fontSize: 36, color: profitMargin >= 0 ? 'success.main' : 'error.main' }} />}
          />
        </Grid>
      </Grid>

      {/* Secondary Metrics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Revenue / Acre"
            value={revenuePerAcre}
            prefix="LKR "
            color="info.main"
            icon={<Terrain sx={{ fontSize: 36, color: 'info.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Expense / Acre"
            value={expensePerAcre}
            prefix="LKR "
            color="warning.main"
            icon={<Terrain sx={{ fontSize: 36, color: 'warning.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active Crops"
            value={`${activeCrops} / ${totalCrops}`}
            color="primary.main"
            icon={<Grass sx={{ fontSize: 36, color: 'primary.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="body2" color="text.secondary" mb={1}>Land Utilization</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main" mb={1}>
              {landUtilization}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(landUtilization, 100)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Row: Expense Breakdown + Top Crop */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Expense Breakdown
            </Typography>
            {expenseBreakdown && expenseBreakdown.length > 0 ? (
              <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={expenseBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80}>
                      {expenseBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `LKR ${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <Box flex={1}>
                  {expenseBreakdown.map((item, i) => (
                    <Box key={item.category} display="flex" alignItems="center" gap={1} mb={0.8}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                      <Typography variant="body2" flex={1}>{item.category}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        LKR {item.amount.toLocaleString()}
                      </Typography>
                      <Chip label={`${Math.round(item.percentage)}%`} size="small" variant="outlined" />
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No expenses recorded yet.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Top Revenue Crop
            </Typography>
            {topRevenueCrop ? (
              <Box display="flex" alignItems="center" gap={2}>
                <EmojiEvents sx={{ fontSize: 48, color: '#ffc107' }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">{topRevenueCrop.label}</Typography>
                  <Typography variant="body1" color="success.main" fontWeight="bold">
                    LKR {topRevenueCrop.totalAmount?.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No revenue recorded yet.</Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Quick Summary
            </Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="body2">
                💰 Earning <strong>LKR {revenuePerAcre?.toLocaleString()}</strong> per acre
              </Typography>
              <Typography variant="body2">
                📉 Spending <strong>LKR {expensePerAcre?.toLocaleString()}</strong> per acre
              </Typography>
              <Typography variant="body2">
                🌱 <strong>{activeCrops}</strong> active crops on <strong>{landUtilization}%</strong> of land
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FarmInsightsPanel;
