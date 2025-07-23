import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Avatar,
  Button,
  TextField,
  Typography,
  Divider,
  IconButton,
  Paper,
  Tab,
  Tabs,
  useTheme,
  alpha,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { changePassword, updateInformation } from '../../services/user.service';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// Validation schemas
const profileSchema = yup.object().shape({
  description: yup.string().max(1000, 'Description cannot exceed 1000 characters'),
});

const userInfoSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number').required('Phone number is required'),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  repeatPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserSettings() {
  const theme = useTheme();
  const user = useSelector((state: any) => state.user.user);
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user.profilePicture || '');

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch: watchProfile,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      description: user.description || '',
    },
  });

  // User info form
  const {
    register: registerUserInfo,
    handleSubmit: handleUserInfoSubmit,
    formState: { errors: userInfoErrors },
  } = useForm({
    resolver: yupResolver(userInfoSchema),
    defaultValues: {
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onProfileSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('profileDescription', data.description);
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
      await updateInformation(formData);
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to update profile', { variant: 'error' });
    }
  };

  const onUserInfoSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('phoneNumber', data.phoneNumber);
      await updateInformation(formData);
      enqueueSnackbar('User information updated successfully', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to update user information', { variant: 'error' });
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      resetPassword();
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to change password', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ 
      maxWidth: '800px', 
      mx: 'auto', 
      p: 3,
      backgroundColor: theme.palette.background.default,
      borderRadius: 2,
      boxShadow: theme.shadows[1]
    }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        User Settings
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
          },
        }}
      >
        <Tab label="My Account" />
        <Tab label="User Profile" />
        <Tab label="Password" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.background.paper, 0.6) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={previewUrl}
              sx={{ width: 80, height: 80, mr: 2 }}
            />
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-input"
                type="file"
                onChange={handleProfilePictureChange}
              />
              <label htmlFor="profile-picture-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<EditIcon />}
                >
                  Change Avatar
                </Button>
              </label>
            </Box>
          </Box>

          <form onSubmit={handleUserInfoSubmit(onUserInfoSubmit)}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              error={!!userInfoErrors.email}
              helperText={userInfoErrors.email?.message?.toString()}
              {...registerUserInfo('email')}
            />
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              margin="normal"
              error={!!userInfoErrors.phoneNumber}
              helperText={userInfoErrors.phoneNumber?.message?.toString()}
              {...registerUserInfo('phoneNumber')}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
          </form>
        </Paper>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.background.paper, 0.6) }}>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <TextField
              fullWidth
              label="About Me"
              variant="outlined"
              multiline
              rows={4}
              margin="normal"
              error={!!profileErrors.description}
              helperText={profileErrors.description?.message}
              {...registerProfile('description')}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              startIcon={<SaveIcon />}
            >
              Save Profile
            </Button>
          </form>
        </Paper>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.background.paper, 0.6) }}>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              variant="outlined"
              margin="normal"
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              variant="outlined"
              margin="normal"
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              variant="outlined"
              margin="normal"
              error={!!passwordErrors.repeatPassword}
              helperText={passwordErrors.repeatPassword?.message}
              {...registerPassword('repeatPassword')}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              startIcon={<SaveIcon />}
            >
              Change Password
            </Button>
          </form>
        </Paper>
      </TabPanel>
    </Box>
  );
}