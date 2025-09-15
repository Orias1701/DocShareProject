// src/components/new-post/FormField.jsx
import React from 'react';

const FormField = ({
  label,
  type = 'text',
  placeholder,
  children,
  rows,
  value,
  onChange,
  error,
  ...rest
}) => {
  const inputClasses =
    "w-full bg-[#1C2028] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500";

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            className={inputClasses}
            value={value ?? ''}
            onChange={onChange}
            {...rest}
          >
            {React.Children.toArray(children)}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            placeholder={placeholder}
            className={inputClasses}
            rows={rows}
            value={value ?? ''}
            onChange={onChange}
            {...rest}
          />
        );
      default:
        return (
          <input
            type={type}
            placeholder={placeholder}
            className={inputClasses}
            value={value ?? ''}
            onChange={onChange}
            {...rest}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      {renderInput()}
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
