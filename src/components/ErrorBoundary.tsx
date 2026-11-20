import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border-2 border-[#E3DAC9] p-8 max-w-md w-full text-center shadow-lg space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-extrabold text-[#2B2625]">
              Mana allinchu (Algo salió mal)
            </h2>
            <p className="text-sm text-[#5C5450]">
              Ocurrió un error inesperado en la aplicación. Puedes intentar recargar la página.
            </p>
            {this.state.error && (
              <details className="text-left bg-[#FAF6EF] rounded-xl p-3 border border-[#E3DAC9]">
                <summary className="text-xs font-bold text-[#5C5450] cursor-pointer">
                  Detalles técnicos
                </summary>
                <pre className="mt-2 text-[10px] text-red-700 whitespace-pre-wrap break-words">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-xl bg-[#1E6B65] hover:bg-[#134844] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-3 rounded-xl bg-[#B84A28] hover:bg-[#8F3419] text-white font-bold text-sm cursor-pointer transition-colors"
              >
                Recargar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
