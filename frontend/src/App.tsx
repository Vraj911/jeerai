import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { RouterProvider } from '@/app/providers/RouterProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { NotificationBootstrap } from '@/components/system/NotificationBootstrap';
const App = () => (
  <ThemeProvider>
    <QueryProvider>
      <TooltipProvider>
        <NotificationBootstrap />
        <Toaster />
        <RouterProvider />
      </TooltipProvider>
    </QueryProvider>
  </ThemeProvider>
);
export default App;
