import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Произошла ошибка
            </h1>
            
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Неизвестная ошибка'}
            </p>
            
            <div className="bg-gray-100 rounded p-4 mb-6 text-left">
              <p className="text-sm text-gray-700 font-mono break-words">
                {this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full"
              >
                Перезагрузить страницу
              </Button>
              
              <p className="text-xs text-gray-500">
                Если проблема повторяется, проверьте:
                <br />
                • Доступность прокси-сервера
                <br />
                • Консоль браузера (F12) для деталей
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
