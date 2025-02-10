import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch } from '../../app/store';
import { signupThunk } from '../../features/slices/authSlice';
import Input from '../lib/Input';
import Checkbox from '../lib/Checkbox';
import Button from '../lib/Button';
import FormDivider from '../common/Divider';
import ContinueWithGoogle from '../common/ContinueWithGoogle';

const Signup: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const dispatch: AppDispatch = useDispatch();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert(t('accept_terms_alert'));
      return;
    }

    dispatch(signupThunk(formData));
  };

  return (
    <main className="flex items-center justify-center h-screen bg-[#F4F7FF]">
      <section className="w-[1305px] h-[861px] bg-[#EAEDFB] rounded-[28px] py-7 px-8 flex gap-x-[80px]">
        {/* Left Hero Section */}
        <div className="w-[616px] h-[803px] bg-[url('../../images/hero.png')] bg-cover rounded-[20px]"></div>

        {/* Right Signup Form */}
        <div className="w-[484px] pt-[150px]">
          <div className="flex flex-col space-y-[25px] mb-[30px]">
            <h1 className="text-[45px] font-bold text-[#3B3B3B]">{t('create_account')}</h1>
            <p className="text-[16px] text-[#3B3B3B]">
              {t('already_have_account')}{' '}
              <a href="/login" className="font-bold text-blue-600">
                {t('login')}
              </a>
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {/* First and Last Name */}
            <div className="flex gap-4">
              <Input
                id="first-name"
                placeholder={t('first_name')}
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg p-4 focus:ring-2 focus:ring-blue-500"
                required
              />
              <Input
                id="last-name"
                placeholder={t('last_name')}
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg p-4 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <Input
              id="email"
              placeholder={t('email')}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              type="email"
              className="w-full bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg p-4 focus:ring-2 focus:ring-blue-500"
              required
            />

       

            <Input
              type="password"
              onChange={(e) => handleInputChange('password', e.target.value)}
              value={formData.password}
              placeholder={t('enter_password')}
              label={t('password')}
              required
            />

            {/* Terms Checkbox */}
            <div className="flex items-center mt-4">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="mr-2"
              />
              <label htmlFor="terms" className="text-sm text-[#666]">
                {t('i_agree_to')}{' '}
                <a href="/terms" className="text-blue-500">
                  {t('terms_and_conditions')}
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full h-[48px] bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                disabled={!termsAccepted}
              >
                {t('create_account')}
              </Button>
            </div>
          </form>

          <FormDivider />

          <ContinueWithGoogle text={t('google_sign_in')} />
        </div>
      </section>
    </main>
  );
};

export default Signup;
