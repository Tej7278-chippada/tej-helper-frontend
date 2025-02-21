// src/components/Admin.js
import React, { useCallback, useEffect, useState } from 'react';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Card, Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,Alert,
    Box,
    Toolbar,} from '@mui/material';
import { addSellerProduct, addUserPost, deleteSellerProduct, fetchMySellerProducts, updateSellerProduct } from '../api/api';
import { useTheme } from '@emotion/react';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import Layout from '../Layout';

function PostService() {
    const [openDialog, setOpenDialog] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    postStatus: '',
    peopleCount: '',
    gender: '',
    serviceDays: '',
    description: '',
    media: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [loading, setLoading] = useState(false); // to show loading state
  const [submitError, setSubmitError] = useState(''); // Error for failed product submission
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' }); // For notifications
  const theme = useTheme();
//   const navigate = useNavigate();


    // const fetchProductsData = useCallback(async () => {
    //     setLoading(true);
    //     try {
    //       const response = await fetchMySellerProducts();
    //       setProducts(response.data); // Set products returned by the API
    //     } catch (error) {
    //       console.error('Error fetching seller products:', error);
    //       setNotification({ open: true, message: 'Failed to fetch products.', type: 'error' });
    //     } finally {
    //       setLoading(false);
    //     }
    //   }, []);
    
    //   useEffect(() => {
    //     // fetchProducts().then((response) => setProducts(response.data));
    //     // localStorage.setItem('currentPage', currentPage); // Persist current page to localStorage
    //     fetchProductsData();
    
    //     // window.addEventListener('scroll', handleScroll);
    //     return () => {
    //     //   window.removeEventListener('scroll', handleScroll);
    //     //   if (scrollTimeoutRef.current) {
    //     //     clearTimeout(scrollTimeoutRef.current);
    //     //   }
    //     };
    //   }, [fetchProductsData]);
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loading state
        const data = new FormData();
    
        // Add only new media files to FormData
        newMedia.forEach((file) => data.append('media', file));
        // Append form data
        Object.keys(formData).forEach(key => {
          if (key !== 'media') data.append(key, formData[key]);
        });
    
        // Include IDs of existing media to keep
        const mediaToKeep = existingMedia.filter(media => !media.remove).map(media => media._id);
        if (mediaToKeep.length > 0) {
          data.append('existingMedia', JSON.stringify(mediaToKeep));
        }
        
        try {
          if (editingProduct) {
            await updateSellerProduct(editingProduct._id, data);
            showNotification(`${formData.title} details updated successfully.`, 'success');
          } else {
            await addUserPost(data);
            showNotification(`New Post "${formData.title}" is added successfully.`, 'success');
          }
        //   await fetchProductsData(); // Refresh products list
          handleCloseDialog();       // Close dialog
        } catch (error) {
          console.error("Error submitting product:", error);
          showNotification(
            editingProduct
              ? `${formData.title} details can't be updated, please try again later.`
              : `New product can't be added, please try again later.`,
            'error'
          );
        } finally {
          setLoading(false); // Stop loading state
        }
      };
      const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
      };
    
    //   const handleEdit = (product) => {
    //     setEditingProduct(product);
    //     setFormData({
    //       title: product.title,
    //       price: product.price,
    //       categories: product.categories,
    //       gender: product.gender,
    //       stockStatus: product.stockStatus,
    //       stockCount: product.stockCount,
    //       deliveryDays: product.deliveryDays,
    //       description: product.description,
    //       // media: null, // Reset images to avoid re-uploading
    //     });
    //     setExistingMedia(product.media.map((media, index) => ({ data: media.toString('base64'), _id: index.toString(), remove: false })));
    //     setOpenDialog(true);
    //   };
    
      const handleDeleteMedia = (mediaId) => {
        setExistingMedia(existingMedia.map(media => media._id === mediaId ? { ...media, remove: true } : media));
      };
    
      const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
      
        // Filter files larger than 2MB
        const oversizedFiles = selectedFiles.filter(file => file.size > 2 * 1024 * 1024);
        const totalMediaCount = selectedFiles.length + existingMedia.filter((media) => !media.remove).length;
      
        // Check for conditions and update errors
        if (oversizedFiles.length > 0 && totalMediaCount > 5) {
          setMediaError("Photo size must be less than 2MB && Maximum 5 photos allowed.");
        } else if (oversizedFiles.length > 0 || totalMediaCount > 5) {
          setMediaError(
            `${oversizedFiles.length > 0 ? "Files must be under 2MB each." : ""} ${totalMediaCount > 5 ? "Maximum 5 photos allowed." : ""}`
          );
        } else {
          setMediaError("");
      
          // Append newly selected files at the end of the existing array
          setNewMedia(prevMedia => [...prevMedia, ...selectedFiles]);
        }
      };
    //   const handleDelete = async (productId) => {
    //     const product = products.find((p) => p._id === productId); // Find the product to get its title
      
    //     if (!product) {
    //       showNotification("Product not found for deletion.", "error");
    //       return;
    //     }
      
    //     try {
    //       await deleteSellerProduct(productId);
    //       showNotification(`Product "${product.title}" deleted successfully.`, "success");
    //       await fetchProductsData(); // Refresh products list
    //     } catch (error) {
    //       console.error("Error deleting product:", error);
    //       showNotification(`Failed to delete "${product.title}". Please try again later.`, "error");
    //     }
    //   };
    
      const showNotification = (message, severity) => {
        setNotification({ open: true, message, severity });
      };

    const handleOpenDialog = () => {
        // Reset form data to empty
        setFormData({
            title: '',
            price: '',
            categories: '',
            gender: '',
            postStatus: '',
            peopleCount: '',
            serviceDays: '',
            description: '',
            media: null,
        });
        setEditingProduct(null); // Ensure it's not in editing mode
        setExistingMedia([]); // Clear any existing media
        setNewMedia([]); // Clear new media files
        setOpenDialog(true);
    };
    
    const handleCloseDialog = () => {
        setEditingProduct(null);
        setExistingMedia([]);
        setNewMedia([]);
        setOpenDialog(false);
        setMediaError('');
        setSubmitError(''); // Clear submission error when dialog is closed
        setFormData({ title: '', price: '', categories: '', gender: '', postStatus: '', peopleCount: '', serviceDays: '', description: '', media: null });
    };



    return (
        <Layout>
        <Box>
        <Toolbar > {/* style={{ display: 'flex', marginTop: '5rem', marginBottom: '-3rem' }} */}
            <Typography variant="h6" style={{ flexGrow: 1 }}>
            User Posts
            </Typography>
            
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
              sx={{
                backgroundColor: '#1976d2', // Primary blue
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '24px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  backgroundColor: '#1565c0', // Darker shade on hover
                },
                display: 'flex',
                alignItems: 'center',
                gap: '8px', marginRight: '10px'
              }}
            >
              <AddShoppingCartRoundedIcon sx={{ fontSize: '20px' }} />
              {/* <span style={{ fontSize: '14px', fontWeight: '500' }}>Add Product</span> */}
            </Button>
            
        </Toolbar>
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth fullScreen={true} sx={{
            margin: '1rem',
            '& .MuiPaper-root': { // Target the dialog paper
                borderRadius: '16px', // Apply border radius
                scrollbarWidth: 'thin',
            },
        }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0rem' }}>
                    <Card style={{ borderRadius: '1rem' }}>
                        {/* Existing media with delete option */}
                        {existingMedia.length > 0 && (
                            <div style={{ marginBottom: '1rem', margin: '1rem' }}>
                                <Typography variant="subtitle1">Existing Images</Typography>
                                <div style={{ display: 'flex', overflowX: 'scroll', scrollbarWidth: 'none', scrollbarColor: '#888 transparent' }}>
                                    {existingMedia.map((media) => (
                                        !media.remove && (
                                            <div key={media._id} style={{ position: 'relative', margin: '5px' }}>
                                                <img src={`data:image/jpeg;base64,${media.data}`} alt="Product Media" style={{ height: '200px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} />
                                                <Button size="small" color="secondary" onClick={() => handleDeleteMedia(media._id)}>Remove</Button>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                    <Card style={{ borderRadius: '1rem', marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1rem', margin: '1rem' }}>
                            <Typography variant="subtitle1">Add Product Photos</Typography>
                            <input type="file" multiple onChange={handleFileChange} />
                            {/* onChange={(e) => setFormData({ ...formData, images: e.target.files })} */}
                            <Typography variant="body2">Note : Maximum 5 Photos & Each Photo size should less than 2 MB</Typography>
                            {mediaError && <Alert severity="error">{mediaError}</Alert>}
                            {newMedia.length > 0 && (
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto', scrollbarWidth: 'none', scrollbarColor: '#888 transparent' }}>
                                    {newMedia.map((file, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index}`}
                                                style={{
                                                    height: '200px',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                    flexShrink: 0,
                                                    cursor: 'pointer' // Make the image look clickable
                                                }}
                                            />
                                            <Button
                                                size="small"
                                                color="secondary"
                                                onClick={() => setNewMedia((prev) => prev.filter((_, i) => i !== index))}>
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div></Card>
                    <TextField
                        label="Post Title"
                        fullWidth
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <FormControl fullWidth>
                        <InputLabel>Categories</InputLabel>
                        <Select
                            value={formData.categories}
                            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                            required
                        >
                            <MenuItem value="Paid">Paid Service</MenuItem>
                            <MenuItem value="UnPaid">UnPaid Service</MenuItem>
                            <MenuItem value="Emergency">Emergency Service</MenuItem>
                        </Select>
                    </FormControl>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <TextField
                            label="Price to the service (INR)"
                            type="number"
                            fullWidth
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Required Gender to service</InputLabel>
                            <Select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                required
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Kids">Kids</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <FormControl fullWidth required>
                            <InputLabel>Post Status</InputLabel>
                            <Select
                                value={formData.postStatus}
                                onChange={(e) => setFormData({ ...formData, postStatus: e.target.value })}
                                required
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="InActive">Inactive</MenuItem>
                                <MenuItem value="Closed">Closed</MenuItem>
                            </Select>
                        </FormControl>
                        {/* {formData.stockStatus === 'In Stock' && ( */}
                            <TextField
                                label="People Count"
                                type="number"
                                fullWidth
                                value={formData.peopleCount}
                                onChange={(e) => setFormData({ ...formData, peopleCount: e.target.value })} required
                            />
                        {/* )} */}
                    </div>
                    <TextField
                        label="Service Days"
                        type="number"
                        fullWidth
                        value={formData.serviceDays}
                        onChange={(e) => setFormData({ ...formData, serviceDays: e.target.value })}
                        required
                    />
                    <TextField
                        label="Description"
                        multiline
                        rows={6}
                        fullWidth
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />


                </DialogContent>
                {submitError && <Alert severity="error" style={{ margin: '1rem' }}>{submitError}</Alert>}
                <DialogActions sx={{ margin: '2rem', gap: '1rem' }}>
                    <Button onClick={handleCloseDialog} disabled={loading} variant='text' color='warning' sx={{ borderRadius: '8px' }}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        style={loading ? { cursor: 'wait' } : {}} sx={{ borderRadius: '8px' }}
                    >
                        {loading ? 'Processing...' : (editingProduct ? 'Update Product' : 'Add Product')}
                    </Button>
                </DialogActions>
            </form>

        </Dialog>
        </Box>
        </Layout>
    );

}

export default PostService;
