import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { fetchUserProfile, updateProfileAvatar, updateUserProfile, removeUserAccount } from '../../features/slices/profileSlice';
import { toast, ToastContainer } from 'react-toastify';
import Modal from '../common/Modal';
import Input from '../lib/Input';
import Button from '../lib/Button';
import { useTranslation } from 'react-i18next';
import SetNewPassword from './SetNewPassword';
import { DeleteIcon } from '../../assets/icons/Icons';

const Profile: React.FC = () => {
  const { t } = useTranslation();  // Specify the namespace 'profile'
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.userProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatePasswordModal, setUpdatePasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
  });

  const [deleteEmail, setDeleteEmail] = useState('');

  useEffect(() => {
    if (!profile) {
      dispatch(fetchUserProfile());
    } else {
      setFormData({
        username: profile.username || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
      });
    }
  }, [profile, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const formData = new FormData();
      formData.append('avatar', e.target.files[0]);
      const resultAction = await dispatch(updateProfileAvatar(formData));
      if (updateProfileAvatar.fulfilled.match(resultAction)) {
        toast.success(t('avatar_updated'));
        dispatch(fetchUserProfile());
      } else {
        toast.error(t('avatar_update_failed'));
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      setIsSaving(true);
      const resultAction = await dispatch(updateUserProfile({ ...profile, ...formData }));
      setIsSaving(false);
      if (updateUserProfile.fulfilled.match(resultAction)) {
        toast.success(t('profile_updated'));
        dispatch(fetchUserProfile());
      } else {
        toast.error(t('profile_update_failed'));
      }
    }
  };

  const handleDeleteAccount = () => {
    setIsModalOpen(true);
  };

  const handleEditUpdatePassword = () => {
    setUpdatePasswordModal(true)
  }

  const confirmDeleteAccount = async () => {
    setIsModalOpen(false);
    const resultAction = await dispatch(removeUserAccount());
    if (removeUserAccount.fulfilled.match(resultAction)) {
      localStorage.clear();
      toast.success(t('account_removed'));
      window.location.href = '/login';
    } else {
      toast.error(t('account_remove_failed'));
    }
  };

  const handleCloseUpdatePasswordModal = () => {
    setUpdatePasswordModal(false);
  };

  const cancelDeleteAccount = () => {
    setIsModalOpen(false);
  };

  const handleDeleteEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteEmail(e.target.value);
  };

  // Explicitly typing fileInputRef as an HTMLInputElement
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // Now TypeScript should recognize click() on HTMLInputElement
  };

  return (
    <div className="bg-white dark:bg-gray-900  mx-auto p-6 rounded-lg max-w-4xl">
      <div className='flex flex-col space-y-6'>

        <div className="w-[635px] p-6 bg-white dark:bg-gray-900 dark:border-gray-600 rounded-xl shadow border border-gray-200 flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-gray-900 dark:text-white text-xl font-bold">Profile</h1>
              <p className="text-gray-500 text-sm font-semibold">Customize your account details.</p>
            </div>
            <hr className="w-full border-gray-200 dark:border-gray-600" />
          </div>

          <div className="flex items-center gap-8">
            <div className="relative w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
              <div className="absolute inset-0 bg-white rounded-full shadow-inner flex items-center justify-center">
                <img
                  src={profile?.avatarUrl ? `${import.meta.env.VITE_API_BASE_URL}${profile.avatarUrl}` : ""}
                  alt={t('a')}
                  className="rounded-full h-full w-full"
                />
                <div className="w-8 h-8 bg-yellow-200 rounded-full blur-lg absolute" />
                <div className="w-6 h-6 bg-pink-300 rounded-full blur-lg absolute" />
              </div>
            </div>

            <button
              className="text-purple-600 text-sm font-bold underline relative"
              onClick={handleButtonClick}
            >
              Update photo
            </button>

            <input
              ref={fileInputRef}
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div>

          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="flex gap-6">
              <Input
                label={t('first_name')}
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="dark:bg-gray-700"
              />
              <Input
                label={t('last_name')}
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="dark:bg-gray-700"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Input
                label={t('email')}
                name="email"
                type="email"
                value={profile?.email || ''}
              />
            </div>

            <hr className="w-full border-gray-200 dark:border-gray-600" />

            <div className="flex gap-4 justify-end mt-6">
              <Button variant='light'>
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                className="w-full md:w-auto"
              >
                {isSaving ? t('saving') : t('save_changes')}
              </Button>
            </div>

          </form>



        </div>

        <div className="w-[635px] h-[88px] p-6 bg-white dark:bg-gray-900 dark:border-gray-600 rounded-xl shadow border border-gray-200 flex justify-between items-center">


          <div className="flex flex-col">
            <h1 className="text-gray-900 text-xl font-bold dark:text-white">Password</h1>
          </div>
          <Button
            variant="primary"
            onClick={handleEditUpdatePassword}
            className="w-full md:w-auto"
          >
            {t('update_password')}
          </Button>
        </div>

        <div className="w-[635px] h-[88px] p-6 bg-white rounded-xl dark:bg-gray-900 dark:border-gray-600 shadow border border-gray-200 flex  justify-between items-center gap-8">


          <div>
            <h1 className="text-gray-900 dark:text-white text-xl font-bold">Delete Account</h1>
          </div>

          <div className="flex justify-center">
            <Button
              variant="error"
              onClick={handleDeleteAccount}
              className="w-full"
            >
              {t('delete_account')}
            </Button>
          </div>
        </div>


      </div>


      <ToastContainer position="bottom-center" />




      <Modal isOpen={isUpdatePasswordModal} onClose={handleCloseUpdatePasswordModal}
        className="bg-white dark:bg-gray-900  shadow-lg mx-auto mt-20 !pb-0 rounded-lg max-w-md">
        <SetNewPassword />
      </Modal>


      <Modal isOpen={isModalOpen} onClose={cancelDeleteAccount} className="bg-white dark:bg-gray-900 shadow-lg mx-auto mt-20 p-6 rounded-lg max-w-md">
        <div className="w-12 bg-[#fee3e1] dark:bg-[#7f1d1d] rounded-[28px] border-8 border-[#fef2f1] dark:border-[#5a1a1a] justify-center items-center inline-flex">
          <DeleteIcon />
        </div>
        <div className="text-[#101828] dark:text-white text-xl font-bold font-['Manrope'] leading-9 mt-6">Delete account</div>
        <div className="text-[#475466] dark:text-gray-400 text-base font-medium font-['Manrope'] leading-[30px]">Are you sure you want to delete your account? This action is irreversible. Please enter your email to permanently delete your account.</div>
        <div className="w-full h-[0px] border border-[#eaecf0] dark:border-gray-700 my-6"></div>
        <div className="flex flex-col gap-2">
          <Input
            label={t('email')}
            name="deleteEmail"
            type="email"
            value={deleteEmail}
            onChange={handleDeleteEmailChange}
          />
        </div>

        <div className="w-full h-[0px] border border-[#eaecf0] dark:border-gray-700 my-6"></div>

        <div className="flex justify-end gap-4">
          <Button variant="light" onClick={cancelDeleteAccount} className='w-full'>
            {t('button_cancel')}
          </Button>
          <Button
            variant="error"
            onClick={confirmDeleteAccount}
            className='w-full'
            disabled={deleteEmail !== profile?.email}
          >
            {t('delete_account')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
