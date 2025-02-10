import React, { useState } from 'react';
import clsx from 'clsx';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface InputProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  state?: 'normal' | 'error' | 'success' | 'warning';
  type?: 'text' | 'password' | 'email' | 'textarea';
  className?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  rows?: number;
  radius?: 'square' | 'md' | 'lg' | 'full';
}

const Input: React.FC<InputProps> = ({
  id,
  name,
  label,
  placeholder = '',
  state = 'normal',
  type = 'text',
  className,
  value,
  defaultValue,
  onChange,
  required = false,
  disabled = false,
  error,
  rows,
  radius = 'md',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const baseStyles = `appearance-none border w-full py-[12px] px-[14px] text-gray-700 leading-tight
     focus:outline-none transition duration-200 dark:text-white dark:bg-[#1D2939] dark:border-white dark:border-opacity-[6%]`;

  const stateStyles: Record<string, string> = {
    normal: 'border-gray-300 focus:border-blue-300 focus:ring-1 focus:ring-blue-300 dark:focus:border-blue-300 dark:focus:ring-blue-300',
    error: 'border-red-500 focus:border-red-300 focus:ring-1 focus:ring-red-300 dark:focus:border-red-300 dark:focus:ring-red-300',
    success: 'border-green-500 focus:border-green-300 focus:ring-1 focus:ring-green-300 dark:focus:border-green-300 dark:focus:ring-green-300',
    warning: 'border-yellow-500 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300 dark:focus:border-yellow-300 dark:focus:ring-yellow-300',
  };

  const radiusStyles: Record<string, string> = {
    square: 'rounded-none',
    md: 'rounded-[8px]',
    lg: 'rounded-[12px]',
    full: 'rounded-full',
  };

  const disabledStyles = disabled
    ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
    : '';

  const iconColor = showPassword ? 'gray' : 'gray';

  const renderPasswordInput = () => (
    <div className="relative mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block mb-2 font-medium text-gray-700 text-sm dark:text-gray-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={clsx(baseStyles, stateStyles[state], radiusStyles[radius], disabledStyles, className)}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <button
        type="button"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="absolute top-[50px] transform -translate-y-1/2 right-3 flex items-center"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <FaEyeSlash color={iconColor} /> : <FaEye color={iconColor} />}
      </button>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );

  const renderTextareaInput = () => (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block mb-2 font-medium text-gray-700 text-sm dark:text-gray-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
        className={clsx(baseStyles, stateStyles[state], radiusStyles[radius], disabledStyles, className)}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );

  const renderDefaultInput = () => (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block mb-2 font-medium text-gray-700 text-sm dark:text-gray-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={clsx(baseStyles, stateStyles[state], radiusStyles[radius], disabledStyles, className)}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );

  if (type === 'password') return renderPasswordInput();
  if (type === 'textarea') return renderTextareaInput();
  return renderDefaultInput();
};

export default Input;