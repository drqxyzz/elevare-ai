'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow.getTime() - now.getTime();

            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm font-mono bg-background/50 px-3 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span className="text-indigo-700 dark:text-indigo-300 font-bold">
                Resets in: {timeLeft}
            </span>
        </div>
    );
}
