import axios from 'axios';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { activityApi } from '@/api/activity.api';
import { issueApi } from '@/api/issue.api';
import { useUIStore } from '@/store/ui.store';
import { useNotificationStore } from '@/store/notification.store';
import { useSessionStore } from '@/store/session.store';
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
  const token = useSessionStore((state) => state.token);
  const currentUser = useSessionStore((state) => state.currentUser);
  const currentWorkspace = useSessionStore((state) => state.currentWorkspace);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rngRef = useRef(createDeterministicRng(1087));
  const inFlightRef = useRef(false);
  const disabledRef = useRef(false);

  useEffect(() => {
    if (!token || !currentUser || !currentWorkspace) {
      disabledRef.current = false;
      inFlightRef.current = false;
      return;
    }

    const rng = rngRef.current;
    let nextAt = Date.now() + MIN_INTERVAL_MS + Math.floor(rng() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS));

    const tick = async () => {
      if (disabledRef.current || inFlightRef.current || Date.now() < nextAt) {
        return;
      }

      inFlightRef.current = true;

      try {
        const r1 = rng();
        const r2 = rng();
        const updatedIssue = await issueApi.simulateRandomUpdate(r1);
        if (!updatedIssue) {
          disabledRef.current = true;
          return;
        }

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
      } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404)) {
          disabledRef.current = true;
        }
      } finally {
        inFlightRef.current = false;
        nextAt = Date.now() + MIN_INTERVAL_MS + Math.floor(rng() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS));
      }
    };

    intervalRef.current = setInterval(() => {
      void tick();
    }, TICK_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      inFlightRef.current = false;
    };
  }, [currentUser, currentWorkspace, qc, token]);
}

