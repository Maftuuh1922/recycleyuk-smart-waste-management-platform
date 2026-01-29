import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { AuthPage } from '@/pages/AuthPage'
import WargaDashboard from '@/pages/WargaDashboard'
import TpuWorkspace from '@/pages/TpuWorkspace'
import { Toaster } from '@/components/ui/sonner'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <AuthPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: <WargaDashboard />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/workspace",
    element: <TpuWorkspace />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: <div className="p-8">Admin Center Placeholder</div>,
    errorElement: <RouteErrorBoundary />,
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)