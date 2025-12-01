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
  Chip,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import {
  Description,
  CheckCircle,
  Pending,
  Cancel,
  CloudDownload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const GovernmentSchemes = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSchemes();
    fetchApplications();
  }, []);

  const fetchSchemes = async () => {
    try {
      const response = await api.get('/government/schemes');
      setSchemes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get('/government/applications');
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'rejected':
        return <Cancel color="error" />;
      default:
        return <Description />;
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
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Government Portal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Access agricultural schemes, subsidies, and support programs
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {schemes.length}
              </Typography>
              <Typography variant="body2">Active Schemes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {applications.filter(a => a.status === 'approved').length}
              </Typography>
              <Typography variant="body2">Approved Applications</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {applications.filter(a => a.status === 'pending').length}
              </Typography>
              <Typography variant="body2">Pending Review</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                5
              </Typography>
              <Typography variant="body2">New Advisories</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* My Applications */}
      <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          My Applications
        </Typography>
        {applications.length > 0 ? (
          <Grid container spacing={2}>
            {applications.map((app) => (
              <Grid item xs={12} key={app._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box flexGrow={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          {getStatusIcon(app.status)}
                          <Typography variant="h6" fontWeight="bold">
                            {app.scheme?.name}
                          </Typography>
                          <Chip
                            label={app.status}
                            size="small"
                            color={getStatusColor(app.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Application ID: {app._id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            You haven't applied for any schemes yet
          </Alert>
        )}
      </Paper>

      {/* Available Schemes */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">
            Available Schemes
          </Typography>
          <TextField
            select
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Schemes</MenuItem>
            <MenuItem value="subsidy">Subsidies</MenuItem>
            <MenuItem value="loan">Loans</MenuItem>
            <MenuItem value="insurance">Insurance</MenuItem>
            <MenuItem value="training">Training Programs</MenuItem>
          </TextField>
        </Box>

        <Grid container spacing={3}>
          {schemes.map((scheme) => (
            <Grid item xs={12} md={6} key={scheme._id}>
              <Card>
                <CardContent>
                  <Box display="flex" gap={1} mb={2}>
                    <Chip label={scheme.type} size="small" color="primary" />
                    <Chip label={scheme.category} size="small" variant="outlined" />
                  </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {scheme.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {scheme.description}
                  </Typography>

                  <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Benefits:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • {scheme.benefits?.amount ? `LKR ${scheme.benefits.amount}` : 'Various benefits'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • {scheme.benefits?.description || 'Financial assistance and support'}
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Eligibility:
                    </Typography>
                    {scheme.eligibility?.criteria?.map((criteria, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        • {criteria}
                      </Typography>
                    ))}
                  </Box>

                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate(`/government/schemes/${scheme._id}/apply`)}
                    >
                      Apply Now
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<CloudDownload />}
                    >
                      Download Form
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {schemes.length === 0 && !loading && (
          <Alert severity="info">
            No schemes available at the moment
          </Alert>
        )}
      </Paper>

      {/* Agricultural Advisories */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Latest Agricultural Advisories
        </Typography>
        <Grid container spacing={2}>
          {[
            { title: 'Monsoon Season Preparation', date: '2024-01-15', severity: 'warning' },
            { title: 'Pest Alert: Rice Brown Planthopper', date: '2024-01-14', severity: 'error' },
            { title: 'Market Price Update', date: '2024-01-13', severity: 'info' },
          ].map((advisory, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Chip label={advisory.severity} size="small" color={advisory.severity} sx={{ mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {advisory.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(advisory.date).toLocaleDateString()}
                  </Typography>
                  <Box mt={2}>
                    <Button size="small" variant="outlined" fullWidth>
                      Read More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default GovernmentSchemes;
