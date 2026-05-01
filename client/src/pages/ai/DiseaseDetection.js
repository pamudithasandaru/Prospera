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
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  BugReport,
  CheckCircle,
  Warning,
  Info,
  Park,
} from '@mui/icons-material';
import { predictDisease } from '../../services/mlApi';

// Disease info map for the 4 model classes
const DISEASE_INFO = {
  Healthy: {
    label: 'Healthy',
    color: 'success',
    bgColor: '#e8f5e9',
    icon: <Park />,
    description: 'Your plant appears healthy with no visible signs of disease.',
    symptoms: ['Normal leaf colouring', 'No lesions or spots', 'Firm and upright structure'],
    recommendations: [
      'Continue regular watering and fertilisation',
      'Monitor weekly for early signs of disease',
      'Maintain proper spacing for airflow',
    ],
  },
  Rust: {
    label: 'Rust',
    color: 'warning',
    bgColor: '#fff3e0',
    icon: <Warning />,
    description: 'Rust is a fungal disease that appears as orange, yellow, or brown pustules on leaves.',
    symptoms: [
      'Orange or rusty-brown pustules on leaf surfaces',
      'Yellowing of surrounding leaf tissue',
      'Premature defoliation in severe cases',
    ],
    recommendations: [
      'Remove and destroy infected leaves immediately',
      'Apply sulfur-based or copper fungicide',
      'Avoid overhead irrigation to reduce leaf wetness',
      'Improve air circulation between plants',
    ],
  },
  Scab: {
    label: 'Scab',
    color: 'warning',
    bgColor: '#fff8e1',
    icon: <Warning />,
    description: 'Scab is caused by fungal pathogens and results in rough, corky lesions on leaves and fruit.',
    symptoms: [
      'Olive-green to dark-brown lesions on leaves',
      'Corky or scab-like spots on fruit',
      'Distorted or curled young leaves',
    ],
    recommendations: [
      'Apply fungicide at early bud break',
      'Rake and remove fallen leaves to reduce spore load',
      'Prune for better canopy airflow',
      'Use scab-resistant varieties in future plantings',
    ],
  },
  Multiple_Diseases: {
    label: 'Multiple Diseases',
    color: 'error',
    bgColor: '#fce4ec',
    icon: <BugReport />,
    description: 'The plant shows signs of multiple concurrent diseases, requiring comprehensive treatment.',
    symptoms: [
      'Mixed symptoms including lesions, pustules, and spots',
      'Widespread discolouration of foliage',
      'Rapid deterioration of plant health',
    ],
    recommendations: [
      'Consult an agricultural expert immediately',
      'Apply broad-spectrum fungicide or treatment',
      'Isolate affected plants to prevent spread',
      'Collect samples for laboratory diagnosis',
    ],
  },
};

const DiseaseDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await predictDisease(selectedFile);
      // Handle error field returned by ONNX endpoint
      if (data?.data?.error) {
        setError(`Prediction error: ${data.data.error}`);
      } else {
        setResult(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Make sure the ML service is running.');
    } finally {
      setLoading(false);
    }
  };

  // Normalize lookup: try exact match first, then case-insensitive
  const resolveInfo = (prediction) => {
    if (!prediction) return null;
    if (DISEASE_INFO[prediction]) return DISEASE_INFO[prediction];
    const key = Object.keys(DISEASE_INFO).find(
      (k) => k.toLowerCase() === prediction.toLowerCase().replace(/ /g, '_')
    );
    return key ? DISEASE_INFO[key] : null;
  };

  const info = result ? resolveInfo(result.prediction) : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          AI Plant Disease Detection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload a crop image for instant disease identification powered by a trained deep learning model.
          Detects: <strong>Healthy · Rust · Scab · Multiple Diseases</strong>
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
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
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
                cursor: 'pointer',
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
                    Supported: JPG, PNG, WebP (Max 25MB)
                  </Typography>
                </>
              )}
            </Box>

            <input
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              id="upload-button"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="upload-button">
              <Button variant="outlined" component="span" fullWidth startIcon={<CloudUpload />} sx={{ mb: 2 }}>
                Choose Image
              </Button>
            </label>

            <Button
              variant="contained"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BugReport />}
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
            >
              {loading ? 'Analysing…' : 'Analyse Image'}
            </Button>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                For best results, photograph affected leaves clearly in good natural lighting.
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

            {!result && !error && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'text.secondary' }}>
                <Info sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="body1">Upload an image to get started</Typography>
              </Box>
            )}

            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

            {result && info && (
              <Box>
                {/* Prediction banner */}
                <Card sx={{ mb: 2, bgcolor: info.bgColor, border: `1px solid`, borderColor: `${info.color}.main` }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {info.icon}
                      <Typography variant="h6" fontWeight="bold" color={`${info.color}.dark`}>
                        {info.label}
                      </Typography>
                      <Chip
                        label={`${(result.confidence * 100).toFixed(1)}% confidence`}
                        color={info.color}
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {info.description}
                    </Typography>
                  </CardContent>
                </Card>

                {/* All class probabilities */}
                {result.all_predictions && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Class Probabilities
                    </Typography>
                    {Object.entries(result.all_predictions)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cls, prob]) => (
                        <Box key={cls} mb={0.8}>
                          <Box display="flex" justifyContent="space-between" mb={0.3}>
                            <Typography variant="caption">{cls.replace('_', ' ')}</Typography>
                            <Typography variant="caption" fontWeight="bold">{(prob * 100).toFixed(1)}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={prob * 100}
                            color={cls === result.prediction ? info.color : 'inherit'}
                            sx={{ borderRadius: 2, height: 6 }}
                          />
                        </Box>
                      ))}
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Symptoms */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Common Symptoms</Typography>
                <List dense disablePadding>
                  {info.symptoms.map((s) => (
                    <ListItem key={s} disableGutters>
                      <ListItemText primary={`• ${s}`} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 1.5 }} />

                {/* Recommendations */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Recommended Treatment</Typography>
                <List dense disablePadding>
                  {info.recommendations.map((r) => (
                    <ListItem key={r} disableGutters>
                      <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} />
                      <ListItemText primary={r} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Fallback: result exists but no matching info (unknown label) */}
            {result && !info && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Prediction: {result.prediction}
                  </Typography>
                  <Typography variant="body2">
                    Confidence: {result.confidence != null ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </Typography>
                </Alert>
                {result.all_predictions && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Class Probabilities
                    </Typography>
                    {Object.entries(result.all_predictions)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cls, prob]) => (
                        <Box key={cls} mb={0.8}>
                          <Box display="flex" justifyContent="space-between" mb={0.3}>
                            <Typography variant="caption">{cls.replace('_', ' ')}</Typography>
                            <Typography variant="caption" fontWeight="bold">{(prob * 100).toFixed(1)}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={prob * 100}
                            sx={{ borderRadius: 2, height: 6 }}
                          />
                        </Box>
                      ))}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DiseaseDetection;
