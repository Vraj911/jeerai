import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { RouterProvider } from '@/app/providers/RouterProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

const App = () => (
  <ThemeProvider>
    <QueryProvider>
      <TooltipProvider>
        <Toaster />
        <RouterProvider />
      </TooltipProvider>
    </QueryProvider>
  </ThemeProvider>
);

export default App;
