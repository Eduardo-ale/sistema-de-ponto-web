import React from 'react';

const Input = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false,
    type = 'text',
    ...props
}) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`
                    w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors duration-200
                    ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                {...props}
            />

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;