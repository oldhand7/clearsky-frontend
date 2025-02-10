import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { updatePassword } from '../../features/slices/profileSlice';
import { PasswordLockIcon } from '../../assets/icons/Icons';
import Button from '../lib/Button';
import Input from '../lib/Input';

const SetNewPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(updatePassword({ oldPassword, newPassword, confirmPassword })).unwrap();
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className=" mx-auto rounded-lg max-w-2xl">

      <ToastContainer position="bottom-center" />

      <div className="w-12 h-12 p-3  rounded-[10px] shadow border border-[#eaecf0] dark:border-gray-700 justify-center items-center inline-flex">
        <PasswordLockIcon />
      </div>
      <h1 className="mb-4 font-bold text-2xl text-gray-800 dark:text-white my-6">Reset password</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">Please enter your old password, and set a new password below.</p>
      <div className="w-full h-[0px] border border-[#eaecf0] dark:border-gray-700 mt-4"></div>
    
      <form onSubmit={handleUpdatePassword} className='my-6'>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700 text-sm dark:text-gray-300" htmlFor="old-password">
            Old Password
          </label>
          <Input
            type="text"
            id="old-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder='Enter Old Password'
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700 text-sm dark:text-gray-300" htmlFor="new-password">
            New Password
          </label>
          <Input
            type="text"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder='Enter the new password'
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700 text-sm dark:text-gray-300" htmlFor="confirm-password">
            Confirm New Password
          </label>
          <Input
            type="text"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder='Confirm the new password'
            required
          />
        </div>

        <div className="w-full h-[0px] border border-[#eaecf0] dark:border-gray-700 my-6"></div>
        <Button type="submit" disabled={isUpdating} className='w-full'>
        {isUpdating ? 'Updating...' : 'Reset Password'}

        </Button>
    
      </form>
    </div>
  );
};

export default SetNewPassword;
