import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Add as AddIcon, Notifications as NotificationsIcon } from '@mui/icons-material';

const MotionCard = motion(Card);

const Dashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          New Inspection
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Upcoming Inspections */}
        <Grid item xs={12} md={8}>
          <MotionCard variants={itemVariants}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Inspections
              </Typography>
              {/* Add inspection list here */}
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12} md={4}>
          <MotionCard variants={itemVariants}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Alerts
                </Typography>
              </Box>
              {/* Add alerts list here */}
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <MotionCard variants={itemVariants}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {/* Add quick action buttons here */}
              </Grid>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
