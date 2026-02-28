import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { activityApi } from '@/api/activity.api';

const MIN_INTERVAL_MS = 25000;
const MAX_INTERVAL_MS = 35000;

function getRandomInterval(): number {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

export function useRealtimeSimulation(): void {
  const qc = useQueryClient();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const schedule = () => {
      const delay = getRandomInterval();
      timeoutRef.current = setTimeout(() => {
        activityApi.simulateRandomEvent();
        qc.invalidateQueries({ queryKey: ['activities'] });
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [qc]);
}
