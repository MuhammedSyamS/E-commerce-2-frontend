import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Check if it's a chunk load error
        const isChunkError = error.message && (
            error.message.includes("Failed to fetch dynamically imported module") ||
            error.message.includes("Loading chunk") ||
            error.name === "ChunkLoadError"
        );
        return { hasError: true, isChunkError };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // Check for chunk load errors and auto-reload once
        const isChunkError = error.message && (
            error.message.includes("Failed to fetch dynamically imported module") ||
            error.message.includes("Loading chunk") ||
            error.name === "ChunkLoadError"
        );

        if (isChunkError) {
            const hasReloaded = sessionStorage.getItem('chunk_error_reload');
            if (!hasReloaded) {
                sessionStorage.setItem('chunk_error_reload', 'true');
                window.location.reload();
                return;
            }
        }

        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-10 text-center">
                    <h1 className="text-2xl font-black uppercase text-red-600 mb-4">
                        {this.state.isChunkError ? "App Update Available" : "Something went wrong"}
                    </h1>
                    <p className="text-zinc-600 mb-8 max-w-md">
                        {this.state.isChunkError
                            ? "A new version of SLOOK is available. We're reloading to get you the latest updates."
                            : "The application encountered an unexpected error."}
                    </p>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 text-left w-full max-w-2xl overflow-auto">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Error Details</h3>
                        <pre className="text-red-500 font-mono text-xs whitespace-pre-wrap break-all">
                            {this.state.isChunkError
                                ? "Critical: Chunk Load Failure (Likely due to a new deployment)."
                                : this.state.error && this.state.error.toString()}
                        </pre>
                        {!this.state.isChunkError && (
                            <>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-4 mb-2">Stack Trace</h3>
                                <pre className="text-zinc-400 font-mono text-[10px] whitespace-pre-wrap max-h-60 overflow-y-auto">
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </>
                        )}
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
