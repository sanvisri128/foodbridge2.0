// CountdownTimer — dynamic, second-by-second countdown for food expiry
import { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function CountdownTimer({ expiryTime, compact = false }) {
  const calculateTimeLeft = useCallback(() => {
    const diff = new Date(expiryTime).getTime() - Date.now();
    if (diff <= 0) {
      return { total: 0, hours: 0, minutes: 0, seconds: 0, expired: true, urgent: true };
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const urgent = hours < 2; // Under 2 hours is critical
    const warning = hours < 6; // Under 6 hours is warning

    return {
      total: diff,
      hours,
      minutes,
      seconds,
      expired: false,
      urgent,
      warning,
    };
  }, [expiryTime]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  if (timeLeft.expired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
        <AlertTriangle className="w-3 h-3" />
        Expired
      </span>
    );
  }

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
          timeLeft.urgent
            ? 'bg-red-100 text-red-700 animate-pulse'
            : timeLeft.warning
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        <Clock className="w-3 h-3" />
        {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ''}
        {timeLeft.minutes}m left
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
        timeLeft.urgent
          ? 'bg-red-50 border-red-200 text-red-800 animate-pulse'
          : timeLeft.warning
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${timeLeft.urgent ? 'text-red-600' : 'text-emerald-600'}`} />
      <span>
        Expires in{' '}
        <strong className="font-bold">
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </strong>
      </span>
    </div>
  );
}
