import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  FlightTakeoff,
  Analytics,
  Architecture,
  Book,
  AccountCircle,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const menuItems = [
  { text: 'Dashboard', icon: Dashboard, path: '/' },
  { text: 'Inspections', icon: FlightTakeoff, path: '/inspections' },
  { text: 'Data & Analysis', icon: Analytics, path: '/analysis' },
  { text: 'Objects / BIM', icon: Architecture, path: '/objects' },
  { text: 'Knowledge Base', icon: Book, path: '/knowledge' },
  { text: 'Account Settings', icon: AccountCircle, path: '/settings' },
];

const MotionListItem = motion(ListItem);

export default function Sidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32 }} />
          <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
            Skyinspection
          </Typography>
        </Box>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <MotionListItem
            key={item.text}
            disablePadding
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.secondary }}>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </MotionListItem>
        ))}
      </List>
    </div>
  );
}
