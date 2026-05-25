import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Upload } from "./Upload";

const fallbackArt = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
  <rect width="160" height="160" rx="32" fill="#111827"/>
  <circle cx="80" cy="80" r="38" fill="#2563eb"/>
  <path d="M56 56h48c4.4 0 8 3.6 8 8v32c0 4.4-3.6 8-8 8H56c-4.4 0-8-3.6-8-8V64c0-4.4 3.6-8 8-8Zm4 4v32h40V60H60Zm-6 8v16h8V68h-8Z" fill="#f8fafc"/>
  <path d="M108 46c3.3 0 6 2.7 6 6v56c0 3.3-2.7 6-6 6" fill="none" stroke="#93c5fd" stroke-width="3" stroke-linecap="round"/>
</svg>
`)}`;

export const Dashboard = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    nickname: '',
    picture: ''
  });
  const [nickname, setNickname] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    axiosInstance.get('/api/profile')
      .then((res) => {
        if (!isMounted) return;

        const nextProfile = res.data.profile || {
          name: '',
          email: '',
          nickname: '',
          picture: ''
        };

        setProfile(nextProfile);
        setNickname(nextProfile.nickname || '');
        setPhotoPreview(nextProfile.picture || '');
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setStatus('Unable to load your profile right now.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isProfileModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileModalOpen]);

  const handlePhotoChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setStatus('Please choose an image file for your profile photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setPhotoPreview(result);
      setStatus('');
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    setStatus('');

    try {
      const res = await axiosInstance.put('/api/profile', {
        nickname,
        picture: photoPreview || profile.picture || ''
      });

      const nextProfile = res.data.profile || {
        name: profile.name,
        email: profile.email,
        nickname: '',
        picture: ''
      };

      setProfile(nextProfile);
      setNickname(nextProfile.nickname || '');
      setPhotoPreview(nextProfile.picture || '');
      setStatus('Profile updated successfully.');
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setStatus('Unable to save your profile right now.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="page-shell muted-copy">Loading your profile...</p>;
  }

  const isNewProfile = !profile.nickname?.trim();

  return (
    <div className="page-shell dashboard-stack">
      <section className="glass-panel profile-hero">
        <div className="profile-header-row">
          <img
            src={profile.picture || fallbackArt}
            alt={profile.nickname || profile.name || 'Profile photo'}
            className="profile-avatar"
          />
          <div className="profile-content">
            <p className="eyebrow">Profile overview</p>
            <h1 className="page-title">
              {profile.nickname || profile.name || 'New user'}
            </h1>
            <p className="muted-copy" style={{ marginTop: '0.55rem' }}>
              {profile.email}
            </p>
            <p className="page-copy">
              {isNewProfile
                ? 'Create your profile to personalize your dashboard.'
                : 'Update your profile details anytime from here.'}
            </p>
            <div className="inline-actions">
              <button
                type="button"
                className="glass-button glass-button-primary"
                onClick={() => setIsProfileModalOpen(true)}
              >
                {isNewProfile ? 'Create profile' : 'Update profile'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {isProfileModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-update-title"
            className="modal-card glass-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Update profile</p>
                <h2 id="profile-update-title" className="section-title">
                  {isNewProfile ? 'Create your profile' : 'Update your profile'}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close"
                aria-label="Close profile update form"
                onClick={() => setIsProfileModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="modal-form" onSubmit={handleProfileSave}>
              <label className="field-label">
                <span>Nickname</span>
                <input
                  type="text"
                  className="glass-input"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="Enter a nickname"
                />
              </label>

              <label className="field-label">
                <span>Profile photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="glass-file-input"
                  onChange={handlePhotoChange}
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="profile-preview"
                  />
                )}
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="glass-button glass-button-secondary"
                  onClick={() => setIsProfileModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="glass-button glass-button-primary"
                >
                  {isSaving ? 'Saving...' : isNewProfile ? 'Create profile' : 'Update profile'}
                </button>
              </div>

              {status && (
                <p className={status.includes('successfully') ? 'status-success' : 'status-error'}>
                  {status}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      <section className="glass-panel section-panel">
        <Upload />
      </section>
    </div>
  );
};
