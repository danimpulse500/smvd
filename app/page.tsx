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
    setLoading(true);
    setError("");
    setVideoData(null);
    try {
      const res = await fetch(`${API_BASE}/preview?url=${encodeURIComponent(targetUrl)}`);
      if (!res.ok) throw new Error("Failed to fetch video details");
      const data = await res.json();
      setVideoData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-md my-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">VidFetch</h1>
        <p className="text-slate-500">Paste a link to save to gallery</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Input Section */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste TikTok, IG, or X link..."
            className="flex-1 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={() => fetchPreview(url)}
            disabled={!url || loading}
            className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "..." : "Fetch"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Stage 2: The Preview Card */}
        {videoData && (
          <div className="bg-white rounded-3xl p-4 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 mb-4">
              <img
                src={videoData.thumbnail}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-mono">
                {videoData.source}
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-800 line-clamp-2 mb-4">
              {videoData.title}
            </h2>

            <a
              href={`${API_BASE}/download?url=${encodeURIComponent(url)}`}
              className="block w-full text-center bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-colors"
            >
              Download Video
            </a>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      {!videoData && !loading && (
        <div className="mt-auto py-8 text-slate-400 text-sm text-center">
          <p>Works with Instagram, TikTok, and X</p>
          <p className="mt-1">Built by Rule Creationz</p>
        </div>
      )}
    </main>
  );
}