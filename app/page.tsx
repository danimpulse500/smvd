"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VidFetchApp() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [error, setError] = useState("");

  const API_BASE = "https://smvd-server.onrender.com";
  const searchParams = useSearchParams();

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

  // Handle incoming shares from the PWA manifest
  useEffect(() => {
    const sharedUrl = searchParams.get("url") || searchParams.get("text") || searchParams.get("title");
    if (sharedUrl) {
      const detectedUrl = extractUrl(sharedUrl);
      if (detectedUrl && detectedUrl !== url) {
        setUrl(detectedUrl);
        fetchPreview(detectedUrl);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <main className="fixed inset-0 gradient-bg flex flex-col overflow-hidden sm:max-w-md sm:mx-auto sm:border-x sm:border-slate-200 dark:sm:border-slate-800 shadow-2xl bg-slate-50 dark:bg-slate-950">
      
      {/* App Bar */}
      {/* <header className="safe-top flex items-center justify-center p-4 border-b border-slate-200/50 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">VidFetch</h1>
        </div>
      </header> */}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 relative hide-scrollbar">
        
        {/* Intro or Video Card */}
        {videoData ? (
          <div className="glass rounded-3xl p-4 shadow-xl border border-white/20 dark:border-white/5 animate-in fade-in zoom-in-95 duration-500 mt-2">
            <div className="relative aspect-[4/5] sm:aspect-video rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 mb-4 group shadow-inner">
              <img
                src={videoData.thumbnail}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                 <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-3 border border-white/10">
                  {videoData.source}
                </span>
                <h2 className="text-white font-bold text-xl leading-tight line-clamp-2">
                  {videoData.title}
                </h2>
              </div>
            </div>

            <a
              href={`${API_BASE}/download?url=${encodeURIComponent(url)}`}
              className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg transition-transform active:scale-95 shadow-lg shadow-blue-500/40"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save Video
            </a>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-80 pb-10">
            <div className="w-24 h-24 bg-blue-600/10 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-blue-600/20 dark:ring-blue-500/20 shadow-inner">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3 tracking-tight">Paste a Link</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px] leading-relaxed">
              We'll extract the video in high quality directly to your device.
            </p>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="animate-in slide-in-from-top-2 fade-in p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100 dark:border-red-900/50 shadow-sm">
             <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="leading-tight">{error}</span>
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="safe-bottom p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5 z-10 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-full ring-1 ring-black/5 dark:ring-white/10 transition-shadow focus-within:ring-blue-500/50 focus-within:shadow-md">
          <input
            type="text"
            placeholder="https://..."
            className="flex-1 bg-transparent px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-base w-full"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPreview(url)}
          />
          <button
            onClick={() => fetchPreview(url)}
            disabled={!url || loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white p-3.5 rounded-full transition-all active:scale-95 flex items-center justify-center shrink-0"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center mt-5 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
           Made with <span className="text-red-500">❤️</span> by <a href="https://dextrus.presa.pro" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Dextrus</a>
        </p>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-bg flex items-center justify-center text-white">Loading...</div>}>
      <VidFetchApp />
    </Suspense>
  );
}