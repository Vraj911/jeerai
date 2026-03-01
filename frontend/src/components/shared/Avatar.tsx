import { cn } from '@/lib/utils';
import type { User } from '@/types/user';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-5 w-5 text-[10px]',
  md: 'h-7 w-7 text-xs',
  lg: 'h-9 w-9 text-sm',
};

export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted flex items-center justify-center font-medium text-muted-foreground shrink-0',
        sizes[size]
      )}
    >
      {user.name.charAt(0)}
    </div>
  );
}
