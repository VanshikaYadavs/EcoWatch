import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ProfileDetails = ({ profileData, onProfileChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleFieldChange = (field, value) => {
    onProfileChange({
      ...profileData,
      [field]: value
    });
    // Clear validation error for this field
    if (validationErrors?.[field]) {
      setValidationErrors({ ...validationErrors, [field]: null });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFieldChange('profilePhoto', reader?.result);
      };
      reader?.readAsDataURL(file);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const handleSave = () => {
    const errors = {};
    if (!profileData?.name) errors.name = 'Name is required';
    if (!profileData?.email) errors.email = 'Email is required';
    else if (!validateEmail(profileData?.email)) errors.email = 'Invalid email format';
    
    if (Object.keys(errors)?.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsEditing(false);
    console.log('Profile saved:', profileData);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Profile Photo Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-border">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {profileData?.profilePhoto ? (
              <img src={profileData?.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Icon name="User" size={40} color="var(--color-muted-foreground)" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
            <Icon name="Camera" size={16} />
            <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} />
          </label>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-semibold text-foreground">{profileData?.name}</h2>
          <p className="text-sm text-muted-foreground">{profileData?.email}</p>
          <p className="text-sm text-muted-foreground mt-1">{profileData?.organization}</p>
        </div>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          iconName={isEditing ? 'Check' : 'Edit'}
          iconPosition="left"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? 'Save' : 'Edit Profile'}
        </Button>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="User" size={20} color="var(--color-primary)" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            type="text"
            value={profileData?.name}
            onChange={(e) => handleFieldChange('name', e?.target?.value)}
            disabled={!isEditing}
            required
            error={validationErrors?.name}
          />
          <Input
            label="Email Address"
            type="email"
            value={profileData?.email}
            onChange={(e) => handleFieldChange('email', e?.target?.value)}
            disabled={!isEditing}
            required
            error={validationErrors?.email}
          />
          <Input
            label="Phone Number"
            type="tel"
            value={profileData?.phone}
            onChange={(e) => handleFieldChange('phone', e?.target?.value)}
            disabled={!isEditing}
          />
          <Input
            label="Location"
            type="text"
            value={profileData?.location}
            onChange={(e) => handleFieldChange('location', e?.target?.value)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Organization Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Building" size={20} color="var(--color-primary)" />
          Organization Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Organization"
            type="text"
            value={profileData?.organization}
            onChange={(e) => handleFieldChange('organization', e?.target?.value)}
            disabled={!isEditing}
          />
          <Input
            label="Department"
            type="text"
            value={profileData?.department}
            onChange={(e) => handleFieldChange('department', e?.target?.value)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Validation Messages */}
      {Object.keys(validationErrors)?.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <Icon name="AlertCircle" size={20} color="var(--color-error)" className="mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Validation Errors</h4>
            <p className="text-sm text-muted-foreground">
              Please correct the errors above before saving.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;