import React from 'react';
import { motion } from 'framer-motion';

const Select = ({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder,
    error,
    required = false,
    disabled = false,
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

            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`
          w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 
          text-gray-900 dark:text-white 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}

                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 dark:text-red-400 flex items-center"
                >
                    <span className="mr-1">⚠️</span>
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default Select;