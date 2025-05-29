import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  // Card,
  Typography,
  keyframes,
  styled
} from '@mui/material';
import Layout from '../Layout';

// Sample images - replace with your actual image paths
const imageSet1 = [
  '/images/p1.png', '/images/p2.png', '/images/p3.png',
  '/images/p4.png', '/images/p5.png', '/images/p6.png',
  '/images/p7.png', '/images/p8.png', '/images/p9.png',
  '/images/p10.png', '/images/p11.png', '/images/p12.png',
];

const imageSet2 = [
  '/images/u1.png', '/images/u2.png', '/images/u3.png',
  '/images/u4.png', '/images/u5.png', '/images/u6.png',
  '/images/u7.png', '/images/u8.png', '/images/u9.png',
  '/images/u10.png', '/images/u11.png', '/images/u12.png'
];

const imageSet3 = [
  '/images/e1.png', '/images/e2.png', '/images/e3.png',
  '/images/e4.png', '/images/e5.png', '/images/e6.png',
  '/images/e7.png', '/images/e8.png', '/images/e9.png',
  '/images/e10.png', '/images/e11.png', '/images/e12.png', '/images/e13.png'
];

// Keyframe animations
const moveLeft = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const moveRight = keyframes`
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
`;

// Styled components using MUI's styled()
const HomeContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const RowContainer = styled(Box)(({ direction, speed }) => ({
  display: 'flex',
  width: '200%',
  padding: '1.5rem 0',
  animation: `${direction === 'left' ? moveLeft : moveRight} ${speed} linear infinite`,

  '@media (max-width: 768px)': {
    padding: '1rem 0',
  },
}));

const ImageItem = styled(Box)({
  flexShrink: 0,
  padding: '0 1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& img': {
    width: 240,
    height: 160,
    objectFit: 'contain', // 'cover' for border radius borderRadius: '12px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    opacity: 0.8,
    transition: 'all 0.3s ease',

    '&:hover': {
      opacity: 1,
      transform: 'scale(1.1)',
    },

    '@media (max-width: 768px)': {
      width: 180,
      height: 120,
    },
  },
});

// const FloatingBox = styled(Card)({
//   position: 'relative',
//   background: 'rgba(255, 255, 255, 0.9)',
//   backdropFilter: 'blur(10px)',
//   borderRadius: '20px',
//   padding: '2.5rem',
//   boxShadow: '0 15px 35px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.07)',
//   textAlign: 'center',
//   maxWidth: 500,
//   width: '90%',
//   zIndex: 10,
//   transition: 'transform 0.3s ease-out',

//   '@media (max-width: 768px)': {
//     padding: '1.5rem',
//   },
// });

const ButtonGroup = styled(Box)({
  display: 'flex',
  gap: '1rem',
  justifyContent: 'center',

  '@media (max-width: 480px)': {
    flexDirection: 'column',
    gap: '0.75rem',
  },
});

const NavButton = styled(Button)(({ color }) => ({
  padding: '0.75rem 1.5rem',
  borderRadius: '50px',
  background: color,
  color: 'white',
  fontWeight: 600,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',

  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 7px 14px rgba(0,0,0,0.1)',
    background: color,
  },

  '&:active': {
    transform: 'translateY(0)',
  },

  '@media (max-width: 480px)': {
    padding: '0.75rem 1rem',
  },
}));

// ImageRow component for the animated background
const ImageRow = ({ direction, speed, images }) => {
  // Duplicate images to ensure seamless looping
  const duplicatedImages = [...images, ...images];

  return (
    <RowContainer direction={direction} speed={speed}>
      {duplicatedImages.map((img, index) => (
        <ImageItem key={`${img}-${index}`}>
          <img src={img} alt="" />
        </ImageItem>
      ))}
    </RowContainer>
  );
};

const HelperHome = () => {
  const navigate = useNavigate();
  // const floatingBoxRef = useRef(null);
  const tokenUsername = localStorage.getItem('tokenUsername');

  // Handle mouse move for parallax effect on floating box
  // useEffect(() => {
  //   const floatingBox = floatingBoxRef.current;

  //   const handleMouseMove = (e) => {
  //     const x = e.clientX / window.innerWidth;
  //     const y = e.clientY / window.innerHeight;

  //     floatingBox.style.transform = `translate(
  //       ${x * 20 - 10}px, 
  //       ${y * 20 - 10}px
  //     )`;
  //   };

  //   window.addEventListener('mousemove', handleMouseMove);

  //   return () => {
  //     window.removeEventListener('mousemove', handleMouseMove);
  //   };
  // }, []);

  return (
    <Layout username={tokenUsername}>
    <HomeContainer>
      {/* Floating navigation box */}
      {/* <FloatingBox ref={floatingBoxRef}>
        <Typography variant="h4" gutterBottom sx={{ color: '#2d3748' }}>
          Welcome to Helper
        </Typography>
        <Typography variant="body1" sx={{ color: '#718096', mb: 3 }}>
          Get started with our services
        </Typography>
        <ButtonGroup>
          <NavButton
            onClick={() => navigate('/services')}
            color="#4a6bff"
            variant="contained"
          >
            Explore Services
          </NavButton>
          <NavButton
            onClick={() => navigate('/contact')}
            color="#ff6b6b"
            variant="contained"
          >
            Contact Us
          </NavButton>
        </ButtonGroup>
      </FloatingBox> */}
      {/* Animated rows */}
      <Typography variant="h5" gutterBottom sx={{ color: '#2d3748' }}>
        Welcome to Helper
      </Typography>
      <ButtonGroup>
        <NavButton
          onClick={() => navigate('/')}
          color="#4a6bff"
          variant="contained"
        >
          Want to Help others
        </NavButton>
        <NavButton
          onClick={() => navigate('/userPosts')}
          color="#ff6b6b"
          variant="contained"
        >
          I want Help
        </NavButton>
      </ButtonGroup>
      <ImageRow direction="left" speed="40s" images={imageSet1} />
      <ImageRow direction="right" speed="50s" images={imageSet2} />
      <ImageRow direction="left" speed="60s" images={imageSet3} />
    </HomeContainer>
    </Layout>
  );
};

export default HelperHome;