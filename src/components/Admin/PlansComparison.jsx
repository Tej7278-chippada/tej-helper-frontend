import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Stack
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function PlansComparisonMUI() {
  const [term, setTerm] = useState("1m");

  const plans = [
    {
      id: "free",
      title: "Free",
      prices: { "1m": 0, "3m": 0, "6m": 0 },
      highlights: ["Good for first-time users", "Includes ads"],
      features: {
        helperPage: { searchRange: "2km", customLocation: false },
        myPosts: {
          postsCount: { paid: 1, unpaid: 1, emergency: 1, service: 1 },
          notifyNearby: false,
          protectLocation: true,
          editLimit: 1,
          aiImage: true
        },
        postDetails: { chatsPerDay: 5 },
        notifications: { chat: false, whatsapp: false },
        advertisements: true
      }
    },
    {
      id: "mid",
      title: "Mid",
      prices: { "1m": 99, "3m": 199, "6m": 349 },
      highlights: ["Best value", "Notify nearby users"],
      features: {
        helperPage: { searchRange: "5km", customLocation: false },
        myPosts: {
          postsCount: { paid: 2, unpaid: 1, emergency: 3, service: 2 },
          notifyNearby: 2,
          protectLocation: true,
          editLimit: 3,
          aiImage: true
        },
        postDetails: { chatsPerDay: 10 },
        notifications: { chat: true, whatsapp: false },
        advertisements: true
      }
    },
    {
      id: "pro",
      title: "Advanced",
      prices: { "1m": 199, "3m": 349, "6m": 549 },
      highlights: ["Top-tier features", "No ads"],
      features: {
        helperPage: { searchRange: "10km", customLocation: true },
        myPosts: {
          postsCount: { paid: 5, unpaid: 3, emergency: 5, service: 3 },
          notifyNearby: 5,
          protectLocation: true,
          editLimit: Infinity,
          aiImage: true
        },
        postDetails: { chatsPerDay: 20 },
        notifications: { chat: true, whatsapp: true },
        advertisements: false
      }
    }
  ];

  return (
    <Box p={4} maxWidth="lg" mx="auto">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Plans & Features
        </Typography>

        <ToggleButtonGroup
          value={term}
          exclusive
          onChange={(e, v) => v && setTerm(v)}
          size="small"
        >
          <ToggleButton value="1m">1 Month</ToggleButton>
          <ToggleButton value="3m">3 Months</ToggleButton>
          <ToggleButton value="6m">6 Months</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card sx={{ borderRadius: 3, p: 1 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {plan.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.highlights.join(" • ")}
                    </Typography>
                  </Box>

                  <Typography variant="h5" fontWeight={700}>
                    {plan.prices[term] === 0 ? "Free" : `₹${plan.prices[term]}`}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <Section title="Helper Page" />
                  <FeatureRow label="Search Range" value={plan.features.helperPage.searchRange} />
                  <FeatureRow
                    label="Custom Location to Find Posts"
                    available={plan.features.helperPage.customLocation}
                  />

                  <Section title="My Posts Page" />
                  <FeatureRow
                    label="Posts Count"
                    value={`Paid: ${plan.features.myPosts.postsCount.paid}, Unpaid: ${plan.features.myPosts.postsCount.unpaid}, Emergency: ${plan.features.myPosts.postsCount.emergency}, Service: ${plan.features.myPosts.postsCount.service}`}
                  />
                  <FeatureRow
                    label="Notify Nearby Users"
                    available={Boolean(plan.features.myPosts.notifyNearby)}
                    meta={typeof plan.features.myPosts.notifyNearby === "number" ? `${plan.features.myPosts.notifyNearby} km` : undefined}
                  />
                  <FeatureRow
                    label="Protect Location Privacy"
                    available={plan.features.myPosts.protectLocation}
                    meta="~500m offset"
                  />
                  <FeatureRow
                    label="Post Editing"
                    value={plan.features.myPosts.editLimit === Infinity ? "Unlimited" : `${plan.features.myPosts.editLimit} times`}
                  />
                  <FeatureRow label="AI Image Generation" available={plan.features.myPosts.aiImage} />

                  <Section title="Post Details" />
                  <FeatureRow label="Chats / Day" value={plan.features.postDetails.chatsPerDay} />

                  <Section title="Notifications" />
                  <FeatureRow label="Chat Notifications" available={plan.features.notifications.chat} />
                  <FeatureRow label="WhatsApp Updates" available={plan.features.notifications.whatsapp} />

                  <Section title="Other" />
                  <FeatureRow label="Advertisements" available={plan.features.advertisements} />
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, borderRadius: 2 }}
                >
                  Choose {plan.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography mt={3} variant="caption" color="text.secondary">
        * All location-protection placements use an approximate 500m offset.
      </Typography>
    </Box>
  );
}

function Section({ title }) {
  return (
    <Box display="flex" alignItems="center" gap={1} mt={2}>
      <Typography variant="subtitle2" fontWeight={600}>
        {title}
      </Typography>
      <InfoOutlinedIcon fontSize="12px" color="disabled" />
    </Box>
  );
}

function FeatureRow({ label, available, value, meta }) {
  return (
    <Box display="flex" justifyContent="space-between" py={0.5}>
      <Typography variant="body2">{label}</Typography>

      <Box display="flex" alignItems="center" gap={1}>
        {typeof available === "boolean" ? (
          available ? (
            <CheckIcon color="success" fontSize="small" />
          ) : (
            <CloseIcon color="error" fontSize="small" />
          )
        ) : (
          <Typography variant="body2" fontWeight={500}>
            {value}
          </Typography>
        )}

        {meta && (
          <Typography variant="caption" color="text.secondary">
            {meta}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
