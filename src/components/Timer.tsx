import { useEffect, useState } from 'react';

interface TimerProps {
  totalSec: number;
  onTimeUp: () => void;
}

export function Timer({ totalSec, onTimeUp }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSec);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getBackgroundColor = () => {
    if (secondsLeft <= 60) return 'bg-[var(--bk-error)]';
    if (secondsLeft <= 300) return 'bg-[var(--bk-warn)]';
    if (secondsLeft <= 600) return 'bg-[var(--bk-accent-weak)]';
    return 'bg-[var(--bk-surface)]';
  };

  const getTextColor = () => {
    if (secondsLeft <= 60) return 'text-white';
    if (secondsLeft <= 300) return 'text-white';
    return 'text-[var(--bk-text)]';
  };

  return (
    <div
      className={`px-4 py-2 rounded-md border border-[var(--bk-border)] ${getBackgroundColor()} ${getTextColor()} transition-colors duration-300`}
    >
      <div className="text-xs text-[var(--bk-text-muted)] mb-0.5">残り時間</div>
      <div className="font-mono text-lg font-semibold tabular-nums">
        {formatTime(secondsLeft)}
      </div>
    </div>
  );
}
