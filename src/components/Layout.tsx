import React from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Toolbar } from '@mui/material';
import { Dashboard as DashboardIcon, Inventory as InventoryIcon, Settings as SettingsIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            background: 'rgba(22, 27, 34, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid #30363d',
            color: '#c9d1d9'
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            INVENTORY
          </Typography>
        </Toolbar>
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton 
                key={item.text} 
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: '8px',
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(88, 166, 255, 0.1)',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(88, 166, 255, 0.2)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 2, borderColor: '#30363d' }} />
          <List>
            <ListItemButton 
              sx={{ mx: 1, borderRadius: '8px' }}
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/login');
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 4, pt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
