// src/components/TermsAndPolicies/PrivacyPolicy.js
import React, { useEffect } from 'react';
import { Box, Typography, Container, List, ListItem, ListItemText } from '@mui/material';
import Layout from '../Layout';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  });
  return (
    <Layout>
      <Container maxWidth="md">
        <Box py={4}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Privacy Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            Last updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </Typography>

          <Typography variant="body1" paragraph>
            At Helper, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our community-driven platform connecting people who need help with those willing to offer it.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            1. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information to provide better services to our users. This includes:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Account Information: Name, email, phone number, profile picture, and user credentials" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Service Information: Details of help requests and service offerings you post" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Location Data: To connect you with nearby helpers or service requests" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Payment Information: Necessary for processing transactions for paid services" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Communications: Messages between users regarding services" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Usage Data: How you interact with our platform to improve our services" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            Your information may be used to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Facilitate connections between help seekers and providers" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Process payments for services rendered through our platform" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Personalize your experience and show relevant service listings" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Communicate important updates about our services" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Improve our platform and develop new features" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Ensure safety and security of our community" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            3. Information Sharing and Disclosure
          </Typography>
          <Typography variant="body1" paragraph>
            We may share information in the following circumstances:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• With other users: Necessary information to facilitate services (e.g., contact details for confirmed bookings)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Service Providers: Third parties who help us operate our platform (payment processors, hosting services)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Legal Compliance: When required by law or to protect our rights and safety" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Business Transfers: In connection with a merger, acquisition, or sale of assets" />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph>
            We never sell your personal information to third parties.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            4. Location Data
          </Typography>
          <Typography variant="body1" paragraph>
            Our platform uses location data to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Show relevant service listings in your area" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Connect you with helpers or requests nearby" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Improve location-based features of our service" />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph>
            You can control location sharing through your device or browser settings.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            5. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your data, including:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Encryption of sensitive data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Secure servers and infrastructure" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Regular security assessments" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Access controls limiting who can view user information" />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph>
            However, no method of transmission over the Internet is 100% secure.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            6. Data Retention
          </Typography>
          <Typography variant="body1" paragraph>
            We retain your information for as long as your account is active or as needed to provide services. Even after account deletion, we may retain certain information as required by law or for legitimate business purposes.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            7. Your Rights and Choices
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Access and update your personal information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Delete your account and associated data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Opt-out of marketing communications" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Control location sharing preferences" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Export your data from our platform" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            8. Children's Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            9. Changes to This Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this policy periodically. The updated version will be posted on our website with a revised "Last updated" date. We will notify you of significant changes through email or platform notifications.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
            10. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            For any privacy-related concerns, please contact:
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            Email: helper-in.privacy@gmail.com
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default PrivacyPolicy;