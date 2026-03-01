import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Filter, Group, Settings2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface QuickFiltersState {
  myIssues: boolean;
  recentlyUpdated: boolean;
  highPriority: boolean;
}

export interface BoardViewSettings {
  compactCards: boolean;
  showAssignee: boolean;
  showPriority: boolean;
}

interface BoardControlBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  quickFilters: QuickFiltersState;
  onQuickFiltersChange: (next: QuickFiltersState) => void;
  groupBy: 'none' | 'assignee' | 'priority';
  onGroupByChange: (value: 'none' | 'assignee' | 'priority') => void;
  viewSettings: BoardViewSettings;
  onViewSettingsChange: (next: BoardViewSettings) => void;
}

export function BoardControlBar({
  search,
  onSearchChange,
  quickFilters,
  onQuickFiltersChange,
  groupBy,
  onGroupByChange,
  viewSettings,
  onViewSettingsChange,
}: BoardControlBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border bg-secondary/30 p-2">
      <div className="relative min-w-[260px] flex-1">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search board issues..."
          className="h-8 pl-8"
          aria-label="Board search"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-3.5 w-3.5" />
            Quick Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={quickFilters.myIssues}
            onCheckedChange={(checked) =>
              onQuickFiltersChange({ ...quickFilters, myIssues: Boolean(checked) })
            }
          >
            My Issues
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={quickFilters.recentlyUpdated}
            onCheckedChange={(checked) =>
              onQuickFiltersChange({ ...quickFilters, recentlyUpdated: Boolean(checked) })
            }
          >
            Recently Updated
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={quickFilters.highPriority}
            onCheckedChange={(checked) =>
              onQuickFiltersChange({ ...quickFilters, highPriority: Boolean(checked) })
            }
          >
            High Priority
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1">
        <Group className="h-3.5 w-3.5 text-muted-foreground" />
        <Select value={groupBy} onValueChange={(value: 'none' | 'assignee' | 'priority') => onGroupByChange(value)}>
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="assignee">Assignee</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Settings2 className="h-3.5 w-3.5" />
            View
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>View Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={viewSettings.compactCards}
            onCheckedChange={(checked) =>
              onViewSettingsChange({ ...viewSettings, compactCards: Boolean(checked) })
            }
          >
            Compact cards
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={viewSettings.showAssignee}
            onCheckedChange={(checked) =>
              onViewSettingsChange({ ...viewSettings, showAssignee: Boolean(checked) })
            }
          >
            Show assignee
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={viewSettings.showPriority}
            onCheckedChange={(checked) =>
              onViewSettingsChange({ ...viewSettings, showPriority: Boolean(checked) })
            }
          >
            Show priority
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
