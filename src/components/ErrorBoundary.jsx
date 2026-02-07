import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-10 text-center">
                    <h1 className="text-2xl font-black uppercase text-red-600 mb-4">Something went wrong</h1>
                    <p className="text-zinc-600 mb-8 max-w-md">
                        The application encountered an unexpected error.
                    </p>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 text-left w-full max-w-2xl overflow-auto">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Error Details</h3>
                        <pre className="text-red-500 font-mono text-xs whitespace-pre-wrap break-all">
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-4 mb-2">Stack Trace</h3>
                        <pre className="text-zinc-400 font-mono text-[10px] whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 bg-black text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
