"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [error, setError] = useState("");

  const API_BASE = "https://smvd-server.onrender.com";

  // Handle incoming shares from the PWA manifest
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get("url") || params.get("text");
    if (sharedUrl) {
      const detectedUrl = extractUrl(sharedUrl);
      if (detectedUrl) {
        setUrl(detectedUrl);
        fetchPreview(detectedUrl);
      }
    }
  }, []);

  const extractUrl = (text: string) => {
    const match = text.match(/\bhttps?:\/\/\S+/gi);
    return match ? match[0] : null;
  };

  const fetchPreview = async (targetUrl: string) => {
    if (!targetUrl) return;
    setLoading(true);
    setError("");
    setVideoData(null);
    try {
      const res = await fetch(`${API_BASE}/preview?url=${encodeURIComponent(targetUrl)}`);
      if (!res.ok) throw new Error("Failed to fetch video details");
      const data = await res.json();
      setVideoData(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen gradient-bg flex flex-col items-center px-4 py-8 md:py-12">
      {/* App Header */}
      <div className="w-full max-w-md text-center mb-10 space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600/10 mb-4 ring-1 ring-blue-600/20 shadow-inner">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">VidFetch</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Download high-quality videos instantly</p>
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col gap-6">
        {/* Input Section */}
        <div className="glass p-1.5 rounded-[2rem] shadow-2xl flex items-center gap-2 ring-1 ring-black/5 dark:ring-white/10">
          <input
            type="text"
            placeholder="Paste video link here..."
            className="flex-1 bg-transparent px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-lg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPreview(url)}
          />
          <button
            onClick={() => fetchPreview(url)}
            disabled={!url || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white p-4 rounded-[1.5rem] transition-all active:scale-95 shadow-lg shadow-blue-500/30 flex items-center justify-center min-w-[64px]"
          >
            {loading ? (
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold border border-red-100 dark:border-red-900/30 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Preview Content */}
        {videoData && (
          <div className="glass rounded-[2.5rem] p-5 shadow-2xl border border-white/20 dark:border-white/5 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 mb-6 group">
              <img
                src={videoData.thumbnail}
                alt="Thumbnail"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                 <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {videoData.source}
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-6 line-clamp-2 px-1">
              {videoData.title}
            </h2>

            <a
              href={`${API_BASE}/download?url=${encodeURIComponent(url)}`}
              className="group relative flex items-center justify-center w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-[1.8rem] font-bold text-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Video
              </span>
            </a>
          </div>
        )}

        {/* Info Cards */}
        {!videoData && !loading && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="glass p-4 rounded-3xl text-center space-y-2 border-white/10">
              <div className="text-2xl">⚡</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fast</p>
            </div>
            <div className="glass p-4 rounded-3xl text-center space-y-2 border-white/10">
              <div className="text-2xl">💎</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">HD Quality</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-10 pb-4 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
          Supported: TikTok • Instagram • X
        </p>
        <p className="mt-2 text-slate-300 dark:text-slate-700 text-[10px] uppercase tracking-[0.2em]">
          Rule Creationz Premium
        </p>
      </footer>
    </main>
  );
}