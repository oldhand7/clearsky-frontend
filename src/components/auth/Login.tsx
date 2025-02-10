import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginThunk } from '../../features/slices/authSlice';
import FormDivider from '../common/Divider';
import ContinueWithGoogle from '../common/ContinueWithGoogle';
import Input from '../lib/Input';
import Button from '../lib/Button';
import Checkbox from '../lib/Checkbox';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleInputChange = (field: keyof typeof credentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(loginThunk(credentials));

      if (loginThunk.fulfilled.match(resultAction)) {
        const userData = resultAction.payload;
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        window.location.href = '/';
      } else {
        console.error('Login failed:', resultAction.payload);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  if (isAuthenticated) {
    window.location.href = '/';
  }

  return (
    <main className="w-full h-screen flex justify-center items-center">
      <section className="w-[1305px] h-[861px] bg-[#EAEDFB] rounded-[28px] py-7 px-8 flex gap-x-[80px]">
        {/* Hero Section */}
        <div className="w-[616px] h-[803px] bg-[url('../../images/hero.png')] bg-cover rounded-[20px]"></div>

        {/* Login Form */}
        <div className="w-[484px] pt-[150px]">
          <div className="flex flex-col space-y-[25px] my-[25px]">
            <h1 className="text-[45px] font-bold text-[#3B3B3B]">{t('login')}</h1>
            <p className="text-[16px] text-[#3B3B3B]">{t('welcome_back')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="email"
              onChange={(e) => handleInputChange('email', e.target.value)}
              value={credentials.email}
              placeholder={t('enter_email')}
              label={t('email')}
              required
            />

            <Input
              type="password"
              onChange={(e) => handleInputChange('password', e.target.value)}
              value={credentials.password}
              placeholder={t('enter_password')}
              label={t('password')}
              required
            />

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <div className="flex items-center mt-4">
              <Checkbox
                id="remember"
                label={t('remember_me')}
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="dark:text-white"
              />
            </div>

            <div className="flex flex-col items-center mt-8">
              <Button type="submit" className="w-full h-[48px]" disabled={loading}>
                {loading ? t('signing_in') : t('login')}
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

export default Login;
