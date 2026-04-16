import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './core/AppContext';
import AppRoutes from './routes/AppRoutes';

/**
 * Enterprise Order Management System
 * Refined entry point with decoupled routing architecture.
 */
function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
