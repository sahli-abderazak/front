import { Drawer, styled } from '@mui/material';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    backgroundColor: '#2C3E50',
    color: 'white',
  },
}));

export default StyledDrawer;
