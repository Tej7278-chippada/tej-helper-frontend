// import React, { useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import styled, { keyframes } from 'styled-components';
// import './HelperHome.css'; // We'll define the CSS separately
// import { Box } from '@mui/material';
// import Layout from '../Layout';

// // Sample images - replace with your actual image paths
// const imageSet1 = [
//   'https://placehold.co/56x56?text=No+Imag', '/images/icon2.svg', '/images/icon3.svg', 
//   '/images/icon4.svg', 'https://placehold.co/56x56?text=No+Imag', '/images/icon6.svg',
//   '/images/icon7.svg', '/images/icon8.svg', '/images/icon9.svg',
//   'https://placehold.co/56x56?text=No+Imag', '/images/icon11.svg', '/images/icon12.svg'
// ];

// const imageSet2 = [
//   'https://placehold.co/56x56?text=No+Imag', '/images/icon14.svg', '/images/icon15.svg',
//   '/images/icon16.svg', 'https://placehold.co/56x56?text=No+Imag', '/images/icon18.svg',
//   '/images/icon19.svg', '/images/icon20.svg', '/images/icon21.svg',
//   'https://placehold.co/56x56?text=No+Imag', '/images/icon23.svg', '/images/icon24.svg'
// ];

// const imageSet3 = [
//   'https://placehold.co/56x56?text=No+Imag', '/images/icon26.svg', '/images/icon27.svg',
//   '/images/icon28.svg', 'https://placehold.co/56x56?text=No+Imag', '/images/icon30.svg',
//   '/images/icon31.svg', '/images/icon32.svg', '/images/icon33.svg',
//   'https://placehold.co/56x56?text=No+Imag', '/images/icon35.svg', '/images/icon36.svg'
// ];

// const HelperHome = () => {
//   const navigate = useNavigate();
//   const floatingBoxRef = useRef(null);

//   // Handle mouse move for parallax effect on floating box
//   useEffect(() => {
//     const floatingBox = floatingBoxRef.current;
    
//     const handleMouseMove = (e) => {
//       const x = e.clientX / window.innerWidth;
//       const y = e.clientY / window.innerHeight;
      
//       floatingBox.style.transform = `translate(
//         ${x * 20 - 10}px, 
//         ${y * 20 - 10}px
//       )`;
//     };

//     window.addEventListener('mousemove', handleMouseMove);
    
//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//     };
//   }, []);

//   return (
//     <Layout>
//     <HomeContainer>
//         {/* Floating navigation box */}
//         <Box >{/* sx={{position: 'absolute'}} */}
//       <FloatingBox ref={floatingBoxRef}>
//         <h2>Welcome to Helper</h2>
//         <p>Get started with our services</p>
//         <ButtonGroup>
//           <NavButton 
//             onClick={() => navigate('/services')}
//             color="#4a6bff"
//           >
//             Explore Services
//           </NavButton>
//           <NavButton 
//             onClick={() => navigate('/contact')}
//             color="#ff6b6b"
//           >
//             Contact Us
//           </NavButton>
//         </ButtonGroup>
//       </FloatingBox>
//       </Box>
//       {/* Animated rows */}
//       <ImageRow direction="left" speed="40s" images={imageSet1} />
//       <ImageRow direction="right" speed="50s" images={imageSet2} />
//       <ImageRow direction="left" speed="60s" images={imageSet3} />
      
      
//     </HomeContainer>
//     </Layout>
//   );
// };

// // ImageRow component for the animated background
// const ImageRow = ({ direction, speed, images }) => {
//   // Duplicate images to ensure seamless looping
//   const duplicatedImages = [...images, ...images];
  
//   return (
//     <RowContainer direction={direction} speed={speed}>
//       {duplicatedImages.map((img, index) => (
//         <ImageItem key={`${img}-${index}`}>
//           <img src={img} alt="" />
//         </ImageItem>
//       ))}
//     </RowContainer>
//   );
// };

// // Styled components
// const HomeContainer = styled.div`
//   position: relative;
//   width: 100%;
//   height: 100vh;
//   overflow: hidden;
//   background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
// `;

// const moveLeft = keyframes`
//   0% { transform: translateX(0); }
//   100% { transform: translateX(-50%); }
// `;

// const moveRight = keyframes`
//   0% { transform: translateX(-50%); }
//   100% { transform: translateX(0); }
// `;

// const RowContainer = styled.div`
//   display: flex;
//   width: 200%;
//   padding: 1.5rem 0;
//   animation: ${props => props.direction === 'left' ? moveLeft : moveRight} 
//     ${props => props.speed} linear infinite;
  
//   @media (max-width: 768px) {
//     padding: 1rem 0;
//   }
// `;

// const ImageItem = styled.div`
//   flex-shrink: 0;
//   padding: 0 1.5rem;
//   display: flex;
//   align-items: center;
//   justify-content: center;
  
//   img {
//     width: 240px;
//     height: 180px;
//     object-fit: contain;
//     filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
//     opacity: 0.7;
//     transition: all 0.3s ease;
    
//     &:hover {
//       opacity: 1;
//       transform: scale(1.1);
//     }
    
//     @media (max-width: 768px) {
//       width: 180px;
//       height: 120px;
//     }
//   }
// `;

// const FloatingBox = styled.div`
//   position: relative;
// //   background: rgba(255, 255, 255, 0.9);
//   backdrop-filter: blur(8px);
//   border-radius: 20px;
//   padding: 2.5rem;
//   box-shadow: 0 15px 35px rgba(0,0,0,0.1), 
//               0 5px 15px rgba(0,0,0,0.07);
//   text-align: center;
//   max-width: 500px;
// //   width: 90%;
//   z-index: 10;
//   transition: transform 0.3s ease-out;
  
//   h2 {
//     color: #2d3748;
//     margin-bottom: 1rem;
//     font-size: 2rem;
//   }
  
//   p {
//     color: #718096;
//     margin-bottom: 2rem;
//     font-size: 1.1rem;
//   }
  
//   @media (max-width: 768px) {
//     padding: 1.5rem;
    
//     h2 {
//       font-size: 1.5rem;
//     }
    
//     p {
//       font-size: 1rem;
//     }
//   }
// `;

// const ButtonGroup = styled.div`
//   display: flex;
//   gap: 1rem;
//   justify-content: center;
  
//   @media (max-width: 480px) {
//     flex-direction: column;
//     gap: 0.75rem;
//   }
// `;

// const NavButton = styled.button`
//   padding: 0.75rem 1.5rem;
//   border: none;
//   border-radius: 50px;
//   background: ${props => props.color};
//   color: white;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
//   &:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 7px 14px rgba(0,0,0,0.1);
//   }
  
//   &:active {
//     transform: translateY(0);
//   }
  
//   @media (max-width: 480px) {
//     padding: 0.75rem 1rem;
//   }
// `;

// export default HelperHome;




// Here's a version using only Material-UI components and styling:

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  Typography,
  keyframes,
  styled
} from '@mui/material';

// Sample images - replace with your actual image paths
const imageSet1 = [
  '/images/icon1.svg', '/images/icon2.svg', '/images/icon3.svg', 
  '/images/icon4.svg', '/images/icon5.svg', '/images/icon6.svg',
  '/images/icon7.svg', '/images/icon8.svg', '/images/icon9.svg',
  '/images/icon10.svg', '/images/icon11.svg', '/images/icon12.svg'
];

const imageSet2 = [
  '/images/icon13.svg', '/images/icon14.svg', '/images/icon15.svg',
  '/images/icon16.svg', '/images/icon17.svg', '/images/icon18.svg',
  '/images/icon19.svg', '/images/icon20.svg', '/images/icon21.svg',
  '/images/icon22.svg', '/images/icon23.svg', '/images/icon24.svg'
];

const imageSet3 = [
  '/images/icon25.svg', '/images/icon26.svg', '/images/icon27.svg',
  '/images/icon28.svg', '/images/icon29.svg', '/images/icon30.svg',
  '/images/icon31.svg', '/images/icon32.svg', '/images/icon33.svg',
  '/images/icon34.svg', '/images/icon35.svg', '/images/icon36.svg'
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
    width: 60,
    height: 60,
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    opacity: 0.7,
    transition: 'all 0.3s ease',
    
    '&:hover': {
      opacity: 1,
      transform: 'scale(1.1)',
    },
    
    '@media (max-width: 768px)': {
      width: 40,
      height: 40,
    },
  },
});

const FloatingBox = styled(Card)({
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: '2.5rem',
  boxShadow: '0 15px 35px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.07)',
  textAlign: 'center',
  maxWidth: 500,
  width: '90%',
  zIndex: 10,
  transition: 'transform 0.3s ease-out',
  
  '@media (max-width: 768px)': {
    padding: '1.5rem',
  },
});

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
  const floatingBoxRef = useRef(null);

  // Handle mouse move for parallax effect on floating box
  useEffect(() => {
    const floatingBox = floatingBoxRef.current;
    
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      floatingBox.style.transform = `translate(
        ${x * 20 - 10}px, 
        ${y * 20 - 10}px
      )`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <HomeContainer>
      {/* Animated rows */}
      <ImageRow direction="left" speed="40s" images={imageSet1} />
      <ImageRow direction="right" speed="50s" images={imageSet2} />
      <ImageRow direction="left" speed="60s" images={imageSet3} />
      
      {/* Floating navigation box */}
      <FloatingBox ref={floatingBoxRef}>
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
      </FloatingBox>
    </HomeContainer>
  );
};

export default HelperHome;