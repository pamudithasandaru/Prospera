import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  BugReport,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import api from '../../services/api';

const DiseaseDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await api.post('/ai/disease-detection', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.data);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setResult({
        error: 'Failed to analyze image. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          AI Disease Detection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload crop images for instant disease identification and treatment recommendations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Upload Crop Image
            </Typography>

            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.default',
                mb: 2,
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                />
              ) : (
                <>
                  <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Drag and drop or click to upload
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supported formats: JPG, PNG, JPEG (Max 5MB)
                  </Typography>
                </>
              )}
            </Box>

            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-button"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="upload-button">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Choose Image
              </Button>
            </label>

            <Button
              variant="contained"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} /> : <BugReport />}
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </Button>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                For best results, capture clear images of affected leaves or plant parts in good lighting
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Analysis Results
            </Typography>

            {!result && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  color: 'text.secondary',
                }}
              >
                <Info sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="body1">
                  Upload an image to get started
                </Typography>
              </Box>
            )}

            {result && !result.error && (
              <Box>
                {/* Disease Identification */}
                <Card sx={{ mb: 2, bgcolor: 'error.light', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Warning />
                      <Typography variant="h6" fontWeight="bold">
                        Disease Detected
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold">
                      {result.disease?.name || 'Unknown Disease'}
                    </Typography>
                    <Box mt={1}>
                      <Chip
                        label={`${result.confidence || 0}% Confidence`}
                        size="small"
                        sx={{ bgcolor: 'white', color: 'error.main' }}
                      />
                      <Chip
                        label={result.disease?.severity || 'Medium'}
                        size="small"
                        color={getSeverityColor(result.disease?.severity)}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Description */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {result.disease?.description || 'No description available'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Symptoms */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Common Symptoms
                </Typography>
                <List dense>
                  {(result.disease?.symptoms || []).map((symptom, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`• ${symptom}`} />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Treatment */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Recommended Treatment
                </Typography>
                <List dense>
                  {(result.recommendations || []).map((rec, index) => (
                    <ListItem key={index}>
                      <CheckCircle color="success" sx={{ mr: 1 }} fontSize="small" />
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>

                <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                  Report to Expert
                </Button>
              </Box>
            )}

            {result?.error && (
              <Alert severity="error">
                {result.error}
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Detections */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Recent Detections
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your detection history will appear here
        </Typography>
      </Paper>
    </Container>
  );
};

export default DiseaseDetection;
