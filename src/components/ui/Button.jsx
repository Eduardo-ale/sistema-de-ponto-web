import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    className = '',
    onClick,
    ...props
}) => {
    const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
        outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-500'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

    return (
        <motion.button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            {...props}
        >
            {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : Icon ? (
                <Icon className="w-4 h-4 mr-2" />
            ) : null}

            {children}
        </motion.button>
    );
};

export default Button;