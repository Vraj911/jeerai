export interface AppNotification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  targetId: string;
  type: 'mention' | 'assignment' | 'status_change' | 'comment';
}
export interface NotificationPageResponse {
  content: AppNotification[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  last: boolean;
}
