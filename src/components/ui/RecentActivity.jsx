import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

const RecentActivity = ({
  activities,
  title = 'Atividade Recente',
  delay = 0
}) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10';
      case 'info':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
      case 'error':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
      default:
        return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + index * 0.1 }}
              className={`flex items-start space-x-4 p-4 rounded-xl border-l-4 ${getActivityColor(activity.type)} hover:shadow-md transition-all duration-300`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                  {activity.message}
                </p>
                {activity.user && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    por {activity.user}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {activity.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma atividade recente
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
