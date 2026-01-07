import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { upsertProfile } from '../../utils/profiles';

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'official', label: 'Government Official' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'analyst', label: 'Data Analyst' },
  { value: 'leader', label: 'Community Leader' },
  { value: 'viewer', label: 'Viewer' },
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const defaultRole = useMemo(() => state?.intendedRole || 'viewer', [state]);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!fullName?.trim()) { setError('Please enter your full name'); return; }
    if (!role) { setError('Please select a role'); return; }
    try {
      setLoading(true);
      await upsertProfile(user?.id, { full_name: fullName.trim(), role, organization: organization?.trim() || null });
      localStorage.removeItem('ecowatch.intendedRole');
      navigate('/environmental-dashboard', { replace: true });
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-card border border-border rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary rounded-lg">
            <Icon name="UserPlus" size={22} color="#FFFFFF" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">Complete Your Profile</h1>
            <p className="text-sm text-muted-foreground">Set your role and basic details to personalize your dashboard</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e?.target?.value)} placeholder="e.g. Vanshika Yadav" required />
          <Select label="Role" options={roleOptions} value={role} onChange={setRole} />
          <Input label="Organization (optional)" value={organization} onChange={(e) => setOrganization(e?.target?.value)} placeholder="e.g. Department of Environment" />

          {error ? (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">{error}</div>
          ) : null}

          <Button type="submit" variant="default" iconName="Save" iconPosition="left" fullWidth loading={loading}>
            Save and Continue
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
