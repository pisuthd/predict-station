import { RouterProvider } from 'react-router';
import { router } from './router';
import { CLIProvider, WalletValidationProvider } from './context/CLIContext';
import { AIProvider } from './context/AIContext';
import { SessionProvider } from './context/SessionContext';

export default function App() {
  return (
    <CLIProvider>
      <WalletValidationProvider>
        <AIProvider>
          <SessionProvider>
            <RouterProvider router={router} />
          </SessionProvider>
        </AIProvider>
      </WalletValidationProvider>
    </CLIProvider>
  );
}
