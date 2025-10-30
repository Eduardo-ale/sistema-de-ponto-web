import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, Activity } from 'lucide-react';

const SessionStatus = ({ lastActivity, isActive = true }) => {
    const [timeSinceActivity, setTimeSinceActivity] = useState(0);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const timeDiff = Math.floor((now - lastActivity) / 1000);
            setTimeSinceActivity(timeDiff);
        }, 1000);

        return () => clearInterval(interval);
    }, [lastActivity, isActive]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusColor = () => {
        if (timeSinceActivity < 300) return 'text-green-400'; // < 5 min
        if (timeSinceActivity < 600) return 'text-yellow-400'; // < 10 min
        return 'text-red-400'; // > 10 min
    };

    const getStatusIcon = () => {
        if (timeSinceActivity < 300) return Activity;
        if (timeSinceActivity < 600) return Clock;
        return Shield;
    };

    const StatusIcon = getStatusIcon();

    if (!isActive) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700"
        >
            <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />
            <span className={`text-xs font-mono ${getStatusColor()}`}>
                {formatTime(timeSinceActivity)}
            </span>
        </motion.div>
    );
};

export default SessionStatus;
