import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { activityApi } from '@/api/activity.api';
import { issueApi } from '@/api/issue.api';
import { useUIStore } from '@/store/ui.store';
import { useNotificationStore } from '@/store/notification.store';
import type { AppNotification } from '@/types/notification';

const MIN_INTERVAL_MS = 20000;
const MAX_INTERVAL_MS = 40000;
const TICK_MS = 1000;

function createDeterministicRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function useRealtimeSimulation(): void {
  const qc = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rngRef = useRef(createDeterministicRng(1087));

  useEffect(() => {
    const rng = rngRef.current;
    let nextAt = Date.now() + MIN_INTERVAL_MS + Math.floor(rng() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS));

    const tick = async () => {
      if (Date.now() < nextAt) {
        return;
      }

      const r1 = rng();
      const r2 = rng();
      const updatedIssue = await issueApi.simulateRandomUpdate(r1);
      const activity = await activityApi.addFromIssueUpdate(updatedIssue, r2);
      const notification: AppNotification = {
        id: `notif-rt-${Date.now()}`,
        title: `${activity.targetKey} updated`,
        description: activity.detail,
        read: false,
        createdAt: activity.createdAt,
        targetId: activity.targetId,
        type: 'status_change',
      };

      useNotificationStore.getState().pushNotification(notification);
      useUIStore.getState().setActivityPulse(true);

      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['activities'] });

      nextAt = Date.now() + MIN_INTERVAL_MS + Math.floor(rng() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS));
    };

    intervalRef.current = setInterval(() => {
      void tick();
    }, TICK_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [qc]);
}

