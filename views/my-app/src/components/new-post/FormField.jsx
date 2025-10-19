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
    "w-full bg-[var(--color-input-bg)] border border-[var(--color-header-border)] rounded-lg p-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]";

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select className={inputClasses} value={value ?? ''} onChange={onChange} {...rest}>
          {React.Children.toArray(children)}
        </select>
      );
    }
    if (type === 'textarea') {
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
    }
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
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{label}</label>}
      {renderInput()}
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
