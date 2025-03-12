import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { FlightTakeoff, LocationOn, Schedule, MoreVert } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const InspectionCard = ({ inspection }) => {
  return (
    <MotionCard
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      sx={{ mb: 2 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {inspection.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {inspection.location}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {inspection.datetime}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip
            icon={<FlightTakeoff sx={{ fontSize: 16 }} />}
            label={inspection.droneType}
            size="small"
            variant="outlined"
          />
          <Chip
            label={inspection.status}
            size="small"
            color={inspection.status === 'Scheduled' ? 'primary' : 'warning'}
          />
        </Box>
      </CardContent>
    </MotionCard>
  );
};

export default InspectionCard;
