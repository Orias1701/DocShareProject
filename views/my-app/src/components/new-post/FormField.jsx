import React from 'react';

/**
 * Component `FormField`
 * @description A reusable form field component with a label and an input/select/textarea.
 */
const FormField = ({ label, type = 'text', placeholder, children, rows }) => {
  const inputClasses = "w-full bg-[#1C2028] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500";

  const renderInput = () => {
    switch (type) {
      case 'select':
        return <select className={inputClasses}>{children}</select>;
      case 'textarea':
        return <textarea placeholder={placeholder} className={inputClasses} rows={rows}></textarea>;
      default:
        return <input type={type} placeholder={placeholder} className={inputClasses} />;
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {renderInput()}
    </div>
  );
};

export default FormField;