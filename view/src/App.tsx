import React from 'react';
import { AppContext, AppProvider } from './context/AppContext';
import { Home } from './pages/Home';
import './styles/styles.scss';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const App = () => {

  const queryClient = new QueryClient()


  const AppState = ({ children }: any) => {
    return (
      <AppProvider>
        {children}
      </AppProvider>
    )
  }

  return (
    <AppState>
      <QueryClientProvider client={queryClient}>
        <Home />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </AppState>
  )
}
