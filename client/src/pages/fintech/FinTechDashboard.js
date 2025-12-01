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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Schedule,
  CheckCircle,
  CreditScore,
  Add,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../../services/api';

const FinTechDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [creditScore, setCreditScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({
    amount: '',
    purpose: '',
    duration: '',
  });

  useEffect(() => {
    fetchLoans();
    fetchCreditScore();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/fintech/loans');
      setLoans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditScore = async () => {
    try {
      const response = await api.get('/fintech/credit-score');
      setCreditScore(response.data.data || null);
    } catch (error) {
      console.error('Error fetching credit score:', error);
    }
  };

  const handleApplyLoan = async () => {
    try {
      await api.post('/fintech/loans', newLoan);
      setDialogOpen(false);
      setNewLoan({ amount: '', purpose: '', duration: '' });
      fetchLoans();
    } catch (error) {
      console.error('Error applying for loan:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'active':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCreditScoreColor = (score) => {
    if (score >= 750) return 'success';
    if (score >= 650) return 'warning';
    return 'error';
  };

  const loanDistributionData = loans.reduce((acc, loan) => {
    const existing = acc.find(item => item.name === loan.purpose);
    if (existing) {
      existing.value += loan.amount;
    } else {
      acc.push({ name: loan.purpose, value: loan.amount });
    }
    return acc;
  }, []);

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          AgriFinTech
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your agricultural finances and access credit facilities
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Credit Score Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Your Credit Score
            </Typography>
            <Box textAlign="center" my={3}>
              <CreditScore sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h2" fontWeight="bold">
                {creditScore?.score || 720}
              </Typography>
              <Typography variant="body2">
                {creditScore?.rating || 'Good'}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(creditScore?.score || 720) / 10}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography variant="caption">
              Last updated: {new Date(creditScore?.lastUpdated || Date.now()).toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AccountBalance color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Borrowed
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        LKR {loans.reduce((sum, loan) => sum + (loan.amount || 0), 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Schedule color="warning" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Pending Applications
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {loans.filter(l => l.status === 'pending').length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <CheckCircle color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active Loans
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {loans.filter(l => l.status === 'active').length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUp color="info" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Available Credit
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        LKR 500,000
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Loan Distribution Chart */}
        {loanDistributionData.length > 0 && (
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Loan Distribution by Purpose
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={loanDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {loanDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* My Loans */}
        <Grid item xs={12} md={loanDistributionData.length > 0 ? 7 : 12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                My Loans
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setDialogOpen(true)}
              >
                Apply for Loan
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Loan ID</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan._id}>
                      <TableCell>#{loan._id?.substring(0, 8)}</TableCell>
                      <TableCell>{loan.purpose}</TableCell>
                      <TableCell>LKR {loan.amount?.toLocaleString()}</TableCell>
                      <TableCell>{loan.duration} months</TableCell>
                      <TableCell>
                        <Chip
                          label={loan.status}
                          size="small"
                          color={getStatusColor(loan.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(loan.appliedAt || loan.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {loans.length === 0 && !loading && (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  No loan applications yet
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => setDialogOpen(true)}
                >
                  Apply for Your First Loan
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Financial Tips */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Financial Tips
            </Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Improve Your Credit Score
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pay your EMIs on time and maintain a good repayment track record to improve your credit score.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Equipment Leasing
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consider leasing expensive equipment instead of buying to preserve your working capital.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Seasonal Planning
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Plan your loan applications according to your harvest cycles for better cash flow management.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Apply Loan Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Agricultural Loan</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              fullWidth
              label="Loan Amount (LKR)"
              type="number"
              value={newLoan.amount}
              onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Purpose"
              value={newLoan.purpose}
              onChange={(e) => setNewLoan({ ...newLoan, purpose: e.target.value })}
            >
              <MenuItem value="seeds">Seeds & Fertilizers</MenuItem>
              <MenuItem value="equipment">Equipment Purchase</MenuItem>
              <MenuItem value="irrigation">Irrigation System</MenuItem>
              <MenuItem value="livestock">Livestock</MenuItem>
              <MenuItem value="expansion">Farm Expansion</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Loan Duration"
              value={newLoan.duration}
              onChange={(e) => setNewLoan({ ...newLoan, duration: e.target.value })}
            >
              <MenuItem value="6">6 Months</MenuItem>
              <MenuItem value="12">12 Months</MenuItem>
              <MenuItem value="24">24 Months</MenuItem>
              <MenuItem value="36">36 Months</MenuItem>
              <MenuItem value="60">60 Months</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleApplyLoan}
            disabled={!newLoan.amount || !newLoan.purpose || !newLoan.duration}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FinTechDashboard;
