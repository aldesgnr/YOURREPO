import React from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { Warning, Error, Info, Close } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const getAlertIcon = (type) => {
  switch (type) {
    case 'warning':
      return <Warning sx={{ color: 'warning.main' }} />;
    case 'error':
      return <Error sx={{ color: 'error.main' }} />;
    default:
      return <Info sx={{ color: 'info.main' }} />;
  }
};

const AlertCard = ({ alert }) => {
  return (
    <MotionCard
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      sx={{ mb: 2 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            {getAlertIcon(alert.type)}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {alert.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {alert.message}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small">
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </MotionCard>
  );
};

export default AlertCard;
