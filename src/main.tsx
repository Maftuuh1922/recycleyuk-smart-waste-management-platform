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
import TpuMap from '@/pages/TpuMap'
import RequestDetail from '@/pages/RequestDetail'
import LiveTracking from '@/pages/LiveTracking'
import AdminCenter from '@/pages/AdminCenter'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminUsers from '@/pages/AdminUsers'
import AdminTpu from '@/pages/AdminTpu'
import AdminReports from '@/pages/AdminReports'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
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
    path: "/history",
    element: <WargaDashboard />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/workspace",
    element: <TpuWorkspace />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/tpu/map",
    element: <TpuMap />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/request/:id",
    element: <RequestDetail />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/tracking/:id",
    element: <LiveTracking />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: <AdminCenter />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/users",
    element: <AdminUsers />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/tpu",
    element: <AdminTpu />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/reports",
    element: <AdminReports />,
    errorElement: <RouteErrorBoundary />,
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <ErrorBoundary>
          <RouterProvider router={router} />
          <Toaster />
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)