import React from 'react';
import { Paper, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { neuColors, neuRaised } from '../../../neumorphic';

/**
 * What a signed-out visitor sees where the compose box and profile card sit.
 *
 * The feed itself stays readable — that is the point of opening it up — so
 * this replaces only the parts that need an account rather than blocking the
 * page.
 */
const GuestPrompt = ({ title, body }) => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ ...neuRaised('sm'), borderRadius: '16px', p: 2.5, mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: neuColors.text, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: neuColors.text, opacity: 0.7, mb: 2 }}>
        {body}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          onClick={() => navigate('/register')}
          sx={{ ...neuRaised('xs'), borderRadius: '10px', textTransform: 'none', fontWeight: 700, color: neuColors.primary, px: 2 }}
        >
          Create account
        </Button>
        <Button
          onClick={() => navigate('/login')}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, color: neuColors.text, px: 2 }}
        >
          Sign in
        </Button>
      </Stack>
    </Paper>
  );
};

export default GuestPrompt;
