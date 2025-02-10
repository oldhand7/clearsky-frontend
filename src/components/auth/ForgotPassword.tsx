import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  requestPasswordResetThunk,
  resetPasswordThunk,
} from '../../features/slices/authSlice';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import Input from '../lib/Input';
import Button from '../lib/Button';
import Logo from '../common/Logo';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(requestPasswordResetThunk({ email })).unwrap();
      toast.success(t('verification_code_sent'));
      setStep(2);
    } catch (err) {
      toast.error(err as string);
    }
  };

  const handleVerificationAndPasswordResetSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t('password_must_match'));
      return;
    }

    try {
      await dispatch(
        resetPasswordThunk({ email, otp: verificationCode, newPassword })
      ).unwrap();
      toast.success(t('password_reset_success'));
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      toast.error(err as string);
    }
  };

  const passwordStrength = () => {
    if (newPassword.length < 6) return { strength: t('weak'), color: 'text-red-500' };
    if (newPassword.length < 10) return { strength: t('medium'), color: 'text-orange-500' };
    if (/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && newPassword.length >= 10)
      return { strength: t('strong'), color: 'text-green-500' };
    return { strength: t('super_strong'), color: 'text-darkgreen' };
  };

  const getIconColor = () => {
    const theme = localStorage.getItem('theme');
    return theme === 'dark' ? 'white' : 'black';
  };

  return (
    <main className="w-full h-screen flex justify-center items-center">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <section className="w-[1305px] h-[861px] bg-[#EAEDFB] rounded-[28px] py-7 px-8 flex gap-x-[80px]">
        {/* Hero Section */}
        <div className="w-[616px] h-[803px] bg-[url('../../images/hero.png')] bg-cover rounded-[20px]"></div>

        {/* Forgot Password Form */}
        <div className="w-[484px] pt-[80px]">
          <div className="flex flex-col space-y-[25px] my-[25px]">
            <Logo width={126.95} height={24.5} />
            <h1 className="text-[45px] font-bold text-[#3B3B3B]">
              {t('forgot_password')}
            </h1>
            <p className="text-[16px] text-[#3B3B3B]">
              {step === 1 ? t('enter_email') : t('reset_password_instructions')}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <Input
                type="email"
                placeholder={t('enter_email')}
                label={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('sending_email') : t('send_verification_code')}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerificationAndPasswordResetSubmit} className="space-y-6">
              <Input
                type="text"
                placeholder={t('enter_verification_code')}
                label={t('verification_code')}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('enter_new_password')}
                  label={t('new_password')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash color={getIconColor()} /> : <FaEye color={getIconColor()} />}
                </button>
                {newPassword.length > 0 && (
                  <p className={`text-sm mt-1 ${passwordStrength().color}`}>
                    {passwordStrength().strength}
                  </p>
                )}
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('confirm_new_password')}
                label={t('confirm_password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('verifying') : t('reset_password')}
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;
