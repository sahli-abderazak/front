import { Paper, styled } from '@mui/material';

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: '20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

export default StyledCard;
