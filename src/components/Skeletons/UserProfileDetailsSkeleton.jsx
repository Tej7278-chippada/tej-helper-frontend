import {
  // Dialog,
  // DialogTitle,
  DialogContent,
  Box,
  Skeleton,
  Avatar,
  Grid,
  // IconButton,
} from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import Slide from '@mui/material/Slide';

const UserProfileDetailsSkeleton = ({ open, onClose, isMobile }) => {
  return (
    // <Dialog
    //   fullWidth
    //   open={open}
    //   onClose={onClose}
    //   fullScreen={isMobile}
    //   TransitionComponent={Slide}
    //   TransitionProps={{ direction: 'up' }}
    //   sx={{
    //     '& .MuiPaper-root': { borderRadius: '14px' },
    //   }}
    // >
    //   {/* Title */}
    //   <DialogTitle>
    //     <Box display="flex" alignItems="center" justifyContent="space-between">
    //       <Skeleton width={140} height={28} />
    //       <IconButton onClick={onClose}>
    //         <CloseIcon />
    //       </IconButton>
    //     </Box>
    //   </DialogTitle>

      <DialogContent sx={{ p: 2, scrollbarWidth:'none', }}>
        {/* Profile Header */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            mb: 2,
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <Box display="flex" gap={2} mb={2}>
            <Avatar sx={{ width: 60, height: 60 }}>
              <Skeleton variant="circular" width={60} height={60} />
            </Avatar>

            <Box flex={1}>
              <Skeleton width="40%" height={26} />
              <Skeleton width="70%" height={18} />
              <Skeleton width="90%" height={18} />
            </Box>
          </Box>

          {/* Interests + Network */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Skeleton width={100} height={20} />
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={70}
                    height={24}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Skeleton width={100} height={20} />
              <Box display="flex" gap={3} mt={1}>
                <Skeleton width={80} height={18} />
                <Skeleton width={80} height={18} />
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Trust Level */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            mb: 2,
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <Skeleton width={120} height={20} />
          <Box display="flex" flexDirection="column" alignItems="center" mt={1}>
            <Skeleton width={120} height={24} />
            <Skeleton width={100} height={18} />
          </Box>
        </Box>

        {/* Tabs */}
        <Box display="flex" justifyContent="center" gap={2} mb={2}>
          <Skeleton width={120} height={32} />
          <Skeleton width={100} height={32} />
        </Box>

        {/* List Items */}
        <Box sx={{ maxHeight: isMobile ? 500 : 300, overflowY: 'auto' }}>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Skeleton width="60%" height={20} />
              <Skeleton width="90%" height={16} />
              <Skeleton width="40%" height={14} />
            </Box>
          ))}
        </Box>
      </DialogContent>
    // </Dialog>
  );
};

export default UserProfileDetailsSkeleton;
