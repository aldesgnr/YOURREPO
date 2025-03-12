import React from 'react';
import { Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const QuickActionButton = ({ icon: Icon, label, onClick }) => {
  return (
    <MotionButton
      variant="outlined"
      startIcon={<Icon />}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        height: '100%',
        '& .MuiButton-startIcon': {
          margin: 0,
        },
      }}
    >
      <Typography variant="body2">
        {label}
      </Typography>
    </MotionButton>
  );
};

export default QuickActionButton;
