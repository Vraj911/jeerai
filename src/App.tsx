import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { RouterProvider } from '@/app/providers/RouterProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

const App = () => (
  <ThemeProvider>
    <QueryProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider />
      </TooltipProvider>
    </QueryProvider>
  </ThemeProvider>
);

export default App;
