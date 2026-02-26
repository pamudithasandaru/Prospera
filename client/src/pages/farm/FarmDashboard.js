import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add,
  TrendingUp,
  TrendingDown,
  Terrain,
  Grass,
  AttachMoney,
  Warning,
  Edit,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const FarmDashboard = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    activeCrops: 0,
  });

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const response = await api.get('/farm');
      setFarms(response.data.data || []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedFarm(response.data.data[0]);
        calculateStats(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (farm) => {
    const totalRevenue = farm.revenue?.reduce((sum, rev) => sum + rev.totalAmount, 0) || 0;
    const totalExpenses = farm.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
    const profit = totalRevenue - totalExpenses;
    const activeCrops = farm.currentCrops?.length || 0;

    setStats({ totalRevenue, totalExpenses, profit, activeCrops });
  };

  const expenseData = selectedFarm?.expenses?.slice(0, 6).map(exp => ({
    category: exp.category,
    amount: exp.amount,
  })) || [];

  const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (farms.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Terrain sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          No Farms Registered
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Register your farm to start managing crops, tracking expenses, and boosting productivity.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={() => navigate('/farm/register')}
        >
          Register Farm
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Farm Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedFarm?.name} - {selectedFarm?.landSize} acres
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/farm/register')}>
          Add Farm
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    LKR {stats.totalRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Expenses
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    LKR {stats.totalExpenses.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingDown sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Net Profit
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color={stats.profit >= 0 ? 'success.main' : 'error.main'}>
                    LKR {stats.profit.toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: stats.profit >= 0 ? 'success.main' : 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Crops
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {stats.activeCrops}
                  </Typography>
                </Box>
                <Grass sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Current Crops */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Current Crops
              </Typography>
              <Button size="small" startIcon={<Add />}>
                Add Crop
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Crop Names</TableCell>
                  <TableCell>Varieties</TableCell>
                  <TableCell>Area (acres)</TableCell>
                  <TableCell>Planted Dates</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedFarm?.currentCrops?.map((crop, index) => (
                  <TableRow key={index}>
                    <TableCell>{crop.cropName}</TableCell>
                    <TableCell>{crop.variety}</TableCell>
                    <TableCell>{crop.area}</TableCell>
                    <TableCell>{new Date(crop.plantedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={crop.status}
                        size="small"
                        color={crop.status === 'growing' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Expense Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Quick Action
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth sx={{ py: 2 }}>
                  Add Expense
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth sx={{ py: 2 }}>
                  Record Revenues
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth sx={{ py: 2 }}>
                  Report Diseases
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth sx={{ py: 2 }}>
                  Schedule Tasks
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FarmDashboard;
