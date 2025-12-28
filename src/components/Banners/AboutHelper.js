// /components/AboutHelper.js
import React from 'react';
import { Box, Grid, Card, Typography } from '@mui/material';

const AboutHelper = ({ isMobile, darkMode }) => {

  const getGlassmorphismStyle = (opacity = 0.16, blur = 18) => ({
    background: darkMode
      ? `rgba(25,25,25,${opacity})`
      : `rgba(255,255,255,${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    borderRadius: '14px',
  });

  const sections = [
    {
      title: 'Local Help, When You Need It',
      image: '/aboutHelper/community_help.jpg',
      points: [
        'Helper is a community-driven platform connecting people who need help with trusted local helpers.',
        'From part-time jobs to urgent requests, Helper bridges local needs with real people.',
        'Hire, help, volunteer, or respond to emergencies — all in one app.',
      ],
    },
    {
      title: 'For Job Posters',
      image: '/aboutHelper/post_job.jpg',
      points: [
        'Post your requirement and find reliable local helpers within minutes.',
        'Hire cleaners, tutors, delivery staff, or volunteers easily.',
        'Emergency needs like plumbers or blood donors are connected instantly.',
      ],
    },
    {
      title: 'For Helpers',
      image: '/aboutHelper/earn_skills.jpg',
      points: [
        'Turn your skills into income with nearby paid gigs.',
        'Browse jobs that match your skills and availability.',
        'Help your community while earning with transparent reviews.',
      ],
    },
    {
      title: 'Community & Emergency',
      image: '/aboutHelper/emergency_help.jpg',
      points: [
        'Immediate local help during emergencies when every minute matters.',
        'From blood donors to urgent repairs, find real people nearby.',
        'Community-powered support that saves time and lives.',
      ],
    },
    {
      title: 'Search alerts for Lost Child or Pet',
      image: '/aboutHelper/lost_child.jpg',
      points: [
        'Instant local alerts for lost children and missing pets',
        'Help search nearby and earn rewards for successful finds',
        'Find faster with local eyes and real-time alerts',
      ],
    },
    {
      title: 'For Students',
      image: '/aboutHelper/student_jobs.jpg',
      points: [
        'Do part-time jobs in your free time and earn pocket money nearby.',
        'Flexible gigs that fit your class schedule.',
        'Study, earn, and grow without long travel.',
      ],
    },
    {
      title: 'For Business Owners',
      image: '/aboutHelper/local_business.jpg',
      points: [
        'Post your business and reach nearby customers instantly.',
        'Get local leads and grow within your neighborhood.',
        'Build trust with ratings and visibility.',
      ],
    },
    {
      title: 'Daily & Multi-Skill Workers',
      image: '/aboutHelper/daily_workers.jpg',
      points: [
        'Receive daily work alerts near your location.',
        'Use multiple skills to earn more income.',
        'Switch jobs easily and never miss opportunities.',
      ],
    },
    {
      title: 'Stay in Your Hometown',
      image: '/aboutHelper/stay_local.jpg',
      points: [
        'Work nearby, earn locally, and stay close to family.',
        'No migration needed for income.',
        'Local work for a stable and comfortable life.',
      ],
    },
  ];

  return (
    <Box sx={{ position: 'relative', p: 1, }}>
      <Box
        sx={{
          mb: 1,
          p: 3,
          textAlign: 'center',
          ...getGlassmorphismStyle(0.2, 22),
        }}
      >
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          fontWeight={700}
          gutterBottom
          sx={{ color: darkMode ? '#fff' : '#222' }}
        >
          About Helper
        </Typography>

        <Typography
          variant="body1"
          sx={{ opacity: 0.85, maxWidth: 600, mx: 'auto', color: darkMode ? '#ccc' : '#555' }}
        >
          Helper connects local needs with trusted people for work, volunteering,
          and emergencies — all in one simple community-powered platform.
        </Typography>
      </Box>
      <Grid container spacing={isMobile ? 0.5 : 1} direction="row-reverse">

        {sections.map((section, index) => (
          <Grid
            item
            xs={12}
            key={index}
            sx={{
              display: 'flex',
              justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: index % 2 === 0 ? 'column' : 'column',
                alignItems: index % 2 === 0 ? 'flex-start' : 'flex-end',
                // justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start',
                gap: 3,
                p: 2,
                width: '100%',
                ...getGlassmorphismStyle(),
              }}
            >
                <Box sx={{ display: 'flex',
                flexDirection: index % 2 === 0 ? 'row' : 'row-reverse', 
                // justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start',
                alignItems: 'center',
                 gap: 3,}}>
              {/* Image */}
              <Box
                component="img"
                src={section.image}
                alt={section.title}
                sx={{
                  width: isMobile ? 180 : 280,
                  height: 'auto',
                  borderRadius: '12px',
                  objectFit: 'contain',
                }}
              />

              {/* Content */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant={isMobile ? 'subtitle1' : 'h6'}
                  fontWeight={600}
                  gutterBottom
                  sx={{ color: darkMode ? '#fff' : '#333', }}
                >
                  {section.title}
                </Typography>

                {!isMobile && (section.points.map((text, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{ opacity: 0.85, mb: 0.5, color: darkMode ? '#ccc' : '#555', }}
                  >
                    • {text}
                  </Typography>
                )))}
              </Box>
              </Box>
                {isMobile &&
                <Box sx={{ flexGrow: 1 }}> 
                    {section.points.map((text, i) => (
                    <Typography
                        key={i}
                        variant="body2"
                        sx={{ opacity: 0.85, mb: 0.5, color: darkMode ? '#ccc' : '#555', }}
                    >
                        • {text}
                    </Typography>
                    ))}
                </Box>}
            </Box>
          </Grid>
        ))}

      </Grid>
      {/* <Box sx={{ mt: 1 }}>
        <Divider sx={{ mb: 2, opacity: 0.3 }} /> */}

        <Box
          sx={{
            p: 3, mt: 1,
            textAlign: 'center',
            ...getGlassmorphismStyle(0.18, 20),
          }}
        >
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            fontWeight={700}
            gutterBottom
            sx={{ color: darkMode ? '#fff' : '#222' }}
          >
            Your Community, One App
          </Typography>

          <Typography
            variant="body2"
            sx={{ opacity: 0.85, mb: 1.5, color: darkMode ? '#ccc' : '#555' }}
          >
            Post a task, find work, or help someone nearby.
            Helper makes helping and earning simple.
          </Typography>

          {/* <Typography
            variant="caption"
            sx={{ opacity: 0.6, color: darkMode ? '#aaa' : '#666' }}
          >
            © {new Date().getFullYear()} Helper • Built for local communities
          </Typography>
        </Box> */}
      </Box>
    </Box>
  );
};

export default AboutHelper;
