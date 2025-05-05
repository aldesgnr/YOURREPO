import { useEffect, useState } from 'react';
import { 
  Alert,
  Box, 
  Button, 
  Card, 
  CardContent, 
  Checkbox,
  CircularProgress, 
  Container, 
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid, 
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField, 
  Typography 
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { CompanyProfile, CompanyProfileCreate, CompanyProfileUpdate, CompanyType, RevenueRange } from '@/types/profile';
import { getUserProfile, createUserProfile, updateUserProfile } from '@/api/profile';

const ProfilePage = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CompanyProfileCreate | CompanyProfileUpdate>();

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setProfile(data);
        reset(data);
      } catch (err) {
        if ((err as any)?.response?.status === 404) {
          // Profile not found, that's okay for new users
          setProfile(null);
        } else {
          setError('Failed to load profile data');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: CompanyProfileCreate | CompanyProfileUpdate) => {
    try {
      setSaving(true);
      setError(null);
      
      let updatedProfile;
      if (profile) {
        // Update existing profile
        updatedProfile = await updateUserProfile(data as CompanyProfileUpdate);
      } else {
        // Create new profile
        updatedProfile = await createUserProfile(data as CompanyProfileCreate);
      }
      
      setProfile(updatedProfile);
      setSuccess(true);
    } catch (err) {
      setError('Failed to save profile data');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Company Profile
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Please provide your company information to receive personalized tax insights.
      </Typography>
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Company name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Company Name"
                      variant="outlined"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={saving}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="nip"
                  control={control}
                  rules={{ 
                    required: 'NIP is required',
                    pattern: {
                      value: /^\d{10}$/,
                      message: 'NIP must be 10 digits'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="NIP (Tax ID)"
                      variant="outlined"
                      fullWidth
                      error={!!errors.nip}
                      helperText={errors.nip?.message}
                      disabled={saving}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="vat_id"
                  control={control}
                  rules={{ 
                    pattern: {
                      value: /^PL\d{10}$/,
                      message: 'VAT ID must be in format PL followed by 10 digits'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="VAT ID (e.g., PL1234567890)"
                      variant="outlined"
                      fullWidth
                      error={!!errors.vat_id}
                      helperText={errors.vat_id?.message}
                      disabled={saving}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Industry"
                      variant="outlined"
                      fullWidth
                      disabled={saving}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="company_type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Company Type</InputLabel>
                      <Select
                        {...field}
                        label="Company Type"
                        disabled={saving}
                      >
                        <MenuItem value={CompanyType.SP_ZOO}>{CompanyType.SP_ZOO}</MenuItem>
                        <MenuItem value={CompanyType.SA}>{CompanyType.SA}</MenuItem>
                        <MenuItem value={CompanyType.JDG}>{CompanyType.JDG}</MenuItem>
                        <MenuItem value={CompanyType.OTHER}>{CompanyType.OTHER}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="pkd_code"
                  control={control}
                  rules={{ 
                    pattern: {
                      value: /^\d{2}\.\d{2}\.[A-Z]$/,
                      message: 'PKD code must be in format XX.XX.X'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="PKD/NACE Code (e.g., 62.01.Z)"
                      variant="outlined"
                      fullWidth
                      error={!!errors.pkd_code}
                      helperText={errors.pkd_code?.message}
                      disabled={saving}
                    />
                  )}
                />
              </Grid>
              
              {/* Tax Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Tax Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="cit_rate_reduced"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={saving}
                        />
                      }
                      label="Uses reduced CIT rate (9%)"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="estonian_cit"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={saving}
                        />
                      }
                      label="Uses Estonian CIT"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="revenue_range"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Revenue Range</InputLabel>
                      <Select
                        {...field}
                        label="Revenue Range"
                        disabled={saving}
                      >
                        <MenuItem value={RevenueRange.BELOW_200K}>{RevenueRange.BELOW_200K}</MenuItem>
                        <MenuItem value={RevenueRange.ABOVE_200K}>{RevenueRange.ABOVE_200K}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="related_party_transactions"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={saving}
                        />
                      }
                      label="Has related party transactions > 10M PLN"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="rd_relief"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={saving}
                        />
                      }
                      label="Uses R&D tax relief"
                    />
                  )}
                />
              </Grid>
              
              {/* Financial Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Financial Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="employee_count"
                  control={control}
                  rules={{ 
                    min: {
                      value: 0,
                      message: 'Employee count must be 0 or greater'
                    },
                    max: {
                      value: 9999,
                      message: 'Employee count must be 9999 or less'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Number of Employees (FTE)"
                      variant="outlined"
                      type="number"
                      fullWidth
                      error={!!errors.employee_count}
                      helperText={errors.employee_count?.message}
                      disabled={saving}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="annual_revenue"
                  control={control}
                  rules={{ 
                    min: {
                      value: 0,
                      message: 'Annual revenue must be 0 or greater'
                    },
                    max: {
                      value: 2000000000,
                      message: 'Annual revenue must be 2,000,000,000 or less'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Annual Revenue (PLN)"
                      variant="outlined"
                      type="number"
                      fullWidth
                      error={!!errors.annual_revenue}
                      helperText={errors.annual_revenue?.message}
                      disabled={saving}
                    />
                  )}
                />
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={saving}
                  sx={{ mt: 2 }}
                >
                  {saving ? <CircularProgress size={24} /> : profile ? 'Update Profile' : 'Create Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      
      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Success Snackbar */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Profile saved successfully
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
