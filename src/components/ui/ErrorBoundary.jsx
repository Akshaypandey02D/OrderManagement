import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-full min-h-[400px]">
          <Card className="glass p-12 text-center max-w-md border-rose-500/20 bg-rose-500/5">
            <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-black text-textMain mb-2">Critical Module Failure</h2>
            <p className="text-sm text-textMuted mb-8 tracking-tight font-medium opacity-80 uppercase leading-relaxed">
              An unexpected algorithmic error has occurred in this module. The rest of the console remains operational.
            </p>
            <Button 
               onClick={() => window.location.reload()} 
               className="w-full bg-rose-500 hover:bg-rose-600 text-white border-none shadow-lg shadow-rose-500/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Reboot Module
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
