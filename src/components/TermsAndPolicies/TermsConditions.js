// src/components/TermsAndPolicies/TermsConditions.js
import React, { useEffect } from 'react';
import { Box, Typography, Container, List, ListItem, ListItemText, Divider } from '@mui/material';
import Layout from '../Layout';

const TermsConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  });
  return (
    <Layout>
      <Container maxWidth="md">
        <Box py={4}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Terms and Conditions
          </Typography>
          
          {/* <Typography variant="body1" paragraph>
            Last updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </Typography> */}
          <Typography variant="body1" paragraph>
            Last updated on Dec 19, 2025
          </Typography>

          <Typography variant="body1" paragraph>
            Welcome to Helper, a community-driven platform connecting people who need help with those willing to offer it. These Terms and Conditions ("Terms") govern your use of our website, mobile application, and services ("Platform").
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing or using our Platform, you agree to be bound by these Terms. If you disagree with any part, you may not access the Platform.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            2. User Responsibilities
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• You must be at least 18 years old to use our services" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• You agree to provide accurate and complete information in your profile and posts" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• You are responsible for maintaining the confidentiality of your account credentials" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Any fraudulent activity may result in termination of your access" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• You agree to respect other users and maintain a positive community environment" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            3. Service Listings and Bookings
          </Typography>
          <Typography variant="body1" paragraph>
            When posting service offerings or help requests:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• You must accurately represent your skills, services, and requirements" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Pricing must be clearly stated and include any additional fees" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Both service providers and requesters must honor confirmed bookings" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Cancellations should be communicated as early as possible" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            4. Payments and Transactions
          </Typography>
          <Typography variant="body1" paragraph>
            For paid services:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• All payments are processed through secure third-party payment gateways" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Service providers are responsible for fulfilling services as described" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Disputes should be reported through our platform's resolution system" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Helper acts as an intermediary and is not responsible for service quality disputes" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            5. User Conduct and Content
          </Typography>
          <Typography variant="body1" paragraph>
            You agree not to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Post false, misleading, or deceptive content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Harass, intimidate, or bully other users" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Post unlawful, defamatory, or harmful content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Use the platform for any illegal activities" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Reverse engineer or hack our Platform" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            6. Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>
            All content on this Platform, including text, graphics, logos, and software, is our property or licensed to us and protected by copyright laws. User-generated content remains the property of the user, but you grant Helper a license to display and distribute that content on our platform.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            7. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            Helper shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including but not limited to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Disputes between service providers and requesters" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Quality of services provided by third parties" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Injuries or damages occurring during service provision" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Technical issues beyond our control" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            8. Account Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activities, or otherwise harm our community. Users may appeal termination by contacting our support team.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            9. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms shall be governed by and construed in accordance with the laws of India.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            10. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify these Terms at any time. Your continued use after changes constitutes acceptance of the modified Terms.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            For any questions regarding these Terms:
          </Typography>
          {/* <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            Email: helper-in.support@gmail.com
          </Typography> */}
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            Email: helper.in.dev@gmail.com
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default TermsConditions;