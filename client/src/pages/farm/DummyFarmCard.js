import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Grid,
  LinearProgress,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Terrain,
  Agriculture,
  TrendingUp,
  Eco,
  Visibility,
  AddCircleOutline,
  WaterDrop,
  WbSunny,
} from '@mui/icons-material';
import { neuColors, neuRaised, raised } from '../../neumorphic';
import { computeFarmInsights } from './dummyFarms';

const DummyFarmCard = ({
  farm,
  onPreview,
  onImport,
  isImporting = false,
}) => {
  const insights = computeFarmInsights(farm);
  const { totalRevenue, netProfit, profitMargin, landUtilization, activeCrops, totalCrops } = insights;

  return (
    <Paper
      elevation={0}
      sx={{
        ...neuRaised('md'),
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: raised('lg'),
        },
      }}
    >
      {/* Banner / Header */}
      <Box
        sx={{
          background: farm.gradient || 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: '#ffffff',
          p: { xs: 2.5, sm: 3 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Soft background shape */}
        <Box
          sx={{
            position: 'absolute',
            right: -20,
            bottom: -30,
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5} mb={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {farm.avatarEmoji || '🌱'}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffffff', lineHeight: 1.2 }}>
                {farm.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
                <Chip
                  icon={<Terrain sx={{ fontSize: '15px !important', color: '#ffffff !important' }} />}
                  label={farm.location}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.22)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                  }}
                />
                <Chip
                  icon={<Agriculture sx={{ fontSize: '15px !important', color: '#ffffff !important' }} />}
                  label={`${farm.landSize} Acres`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.22)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Chip
            label="Template"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              color: '#1b5e20',
              fontWeight: 800,
              fontSize: '0.7rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.92)', mt: 1, fontSize: '0.85rem' }}>
          {farm.tagline}
        </Typography>

        {/* Feature Badges */}
        {farm.badges && farm.badges.length > 0 && (
          <Box display="flex" gap={0.8} flexWrap="wrap" mt={1.5}>
            {farm.badges.map((badge, idx) => (
              <Chip
                key={idx}
                icon={<Eco sx={{ fontSize: '13px !important', color: 'rgba(255,255,255,0.9) !important' }} />}
                label={badge}
                size="small"
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.18)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  height: 22,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Card Body */}
      <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 2.5 }}>
        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, lineHeight: 1.5 }}>
          {farm.description}
        </Typography>

        {/* Key KPI Stats */}
        <Grid container spacing={1.5}>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: 'rgba(27, 94, 32, 0.05)',
                border: '1px solid rgba(27, 94, 32, 0.1)',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Active Crops
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                {activeCrops} / {totalCrops}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: 'rgba(2, 119, 189, 0.05)',
                border: '1px solid rgba(2, 119, 189, 0.1)',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Land In Use
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="info.main">
                {landUtilization}%
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: 'rgba(46, 125, 50, 0.05)',
                border: '1px solid rgba(46, 125, 50, 0.1)',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Est. Revenue
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                {(totalRevenue / 1000000).toFixed(2)}M
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: 'rgba(154, 69, 7, 0.05)',
                border: '1px solid rgba(154, 69, 7, 0.1)',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Est. Profit
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
                +{(netProfit / 1000000).toFixed(2)}M
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Land Utilization Bar */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.7}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Land Acreage Allocation
            </Typography>
            <Typography variant="caption" fontWeight="bold" color="text.primary">
              {landUtilization}% ({farm.landSize} Total Acres)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(landUtilization, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(0,0,0,0.06)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#2e7d32',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Current Crops Preview */}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" display="block" mb={1}>
            Featured Crops ({farm.currentCrops?.length || 0})
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {farm.currentCrops?.map((crop, idx) => (
              <Tooltip key={idx} title={`${crop.variety || 'Standard'} • ${crop.area} acres • Status: ${crop.status}`}>
                <Chip
                  label={`${crop.cropName} (${crop.area} ac)`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor:
                      crop.status === 'growing'
                        ? '#2e7d32'
                        : crop.status === 'harvested'
                        ? '#0284c7'
                        : '#94a3b8',
                    color:
                      crop.status === 'growing'
                        ? '#1b5e20'
                        : crop.status === 'harvested'
                        ? '#0369a1'
                        : '#475569',
                    bgcolor:
                      crop.status === 'growing'
                        ? 'rgba(46, 125, 50, 0.08)'
                        : crop.status === 'harvested'
                        ? 'rgba(2, 132, 199, 0.08)'
                        : 'rgba(148, 163, 184, 0.08)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Soil & Climate Tagline */}
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          flexWrap="wrap"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: neuColors.baseDeep,
            fontSize: '0.78rem',
            color: 'text.secondary',
          }}
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <WbSunny sx={{ fontSize: 16, color: '#f59e0b' }} />
            <span>{farm.climate}</span>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <WaterDrop sx={{ fontSize: 16, color: '#0284c7' }} />
            <span>{farm.soilType}</span>
          </Box>
        </Box>

        {/* Spacer to push buttons to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Card Actions */}
        <Box display="flex" gap={1.5} pt={1}>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => onPreview(farm)}
            fullWidth
            sx={{
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2.5,
            }}
          >
            Preview Farm
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={isImporting ? <CircularProgress size={18} color="inherit" /> : <AddCircleOutline />}
            onClick={() => onImport(farm)}
            disabled={isImporting}
            fullWidth
            sx={{
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2.5,
              boxShadow: '0 4px 12px rgba(27, 94, 32, 0.25)',
            }}
          >
            {isImporting ? 'Saving...' : 'Use Template'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DummyFarmCard;
