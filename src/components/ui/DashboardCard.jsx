import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  delay = 0
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      accent: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      accent: 'text-green-600 dark:text-green-400'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
      accent: 'text-yellow-600 dark:text-yellow-400'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      accent: 'text-purple-600 dark:text-purple-400'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      accent: 'text-red-600 dark:text-red-400'
    }
  };

  const changeColorClasses = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          {change && (
            <p className={`text-sm font-medium ${changeColorClasses[changeType]}`}>
              {change} vs mês anterior
            </p>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`w-16 h-16 ${colorClasses[color].bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-8 h-8 ${colorClasses[color].icon} group-hover:scale-110 transition-transform duration-300`} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;