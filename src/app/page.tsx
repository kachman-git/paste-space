'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();
  const [joinSlug, setJoinSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [expiresIn, setExpiresIn] = useState<string>('24h');

  const handleCreateSpace = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: spaceName || undefined,
          is_secret: isSecret,
          passphrase: isSecret ? passphrase : undefined,
          expires_in: expiresIn,
        }),
      });

      const data = await res.json();
      if (data.slug) {
        // Copy URL to clipboard
        const url = `${window.location.origin}/${data.slug}`;
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          // Clipboard may not be available
        }
        router.push(`/${data.slug}`);
      }
    } catch (err) {
      console.error('Create space error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinSlug.trim()) return;
    // Extract slug from URL or use as-is
    let slug = joinSlug.trim();
    try {
      const url = new URL(slug);
      slug = url.pathname.replace('/', '');
    } catch {
      // Not a URL, use as-is
    }
    router.push(`/${slug}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/[0.07] rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/[0.07] rounded-full blur-[120px] animate-pulse-glow animation-delay-200" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-cyan-600/[0.04] rounded-full blur-[100px] animate-float" />
      </div>

      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">PasteSpace</span>
          </div>
        </header>

        {/* Hero */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8 animate-fade-in-up">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-medium text-violet-300">Universal Clipboard for Everyone</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up animation-delay-200">
              <span className="text-white">Copy. Paste.</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Share Instantly.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
              Create a shared space and paste text, images, code, files, or links.
              Everything syncs in real-time. No sign-up needed.
            </p>
          </div>

          {/* Action area */}
          <div className="max-w-lg mx-auto animate-fade-in-up animation-delay-600">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl">
              {/* Quick create */}
              <Button
                onClick={handleCreateSpace}
                size="lg"
                className="w-full mb-6"
                disabled={creating}
              >
                {creating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Space
                  </div>
                )}
              </Button>

              {/* Advanced options toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                Advanced options
              </button>

              {/* Advanced options */}
              {showAdvanced && (
                <div className="space-y-4 mb-6 animate-fade-in-up">
                  {/* Space name */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">Space name (optional)</label>
                    <input
                      type="text"
                      value={spaceName}
                      onChange={(e) => setSpaceName(e.target.value)}
                      placeholder="My shared clipboard"
                      className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 text-sm transition-all"
                    />
                  </div>

                  {/* Expire */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">Expires after</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '1 hour', value: '1h' },
                        { label: '24 hours', value: '24h' },
                        { label: '7 days', value: '7d' },
                        { label: 'Never', value: 'permanent' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setExpiresIn(opt.value)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${expiresIn === opt.value
                              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                              : 'bg-white/[0.05] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08] hover:text-gray-300'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Secret toggle */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm text-gray-300 font-medium">Secret Space</span>
                      <p className="text-xs text-gray-500 mt-0.5">Require a passphrase to access</p>
                    </div>
                    <button
                      onClick={() => setIsSecret(!isSecret)}
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${isSecret ? 'bg-violet-600' : 'bg-white/10'
                        }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${isSecret ? 'left-[22px]' : 'left-0.5'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Passphrase input */}
                  {isSecret && (
                    <div className="animate-fade-in-up">
                      <label className="block text-xs text-gray-500 mb-1.5 font-medium">Passphrase</label>
                      <input
                        type="password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Enter a secret passphrase..."
                        className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 text-sm transition-all"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-gray-600 font-medium">OR JOIN EXISTING</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Join space */}
              <form onSubmit={handleJoinSpace} className="flex gap-2">
                <input
                  type="text"
                  value={joinSlug}
                  onChange={(e) => setJoinSlug(e.target.value)}
                  placeholder="Paste a space link or code..."
                  className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 text-sm transition-all"
                />
                <Button type="submit" variant="secondary" disabled={!joinSlug.trim()}>
                  Join
                </Button>
              </form>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-16">
            {[
              {
                icon: (
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instant Sharing',
                desc: 'Create a space in one click. Paste anything. Share the link. Done.',
                gradient: 'from-violet-500/10 to-indigo-500/10',
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
                title: 'Real-Time Sync',
                desc: 'Everything updates live across all connected devices and users.',
                gradient: 'from-cyan-500/10 to-blue-500/10',
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Secret Spaces',
                desc: 'Protect your space with a passphrase. Only invited people can access.',
                gradient: 'from-amber-500/10 to-orange-500/10',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Supported content types */}
          <div className="text-center mt-16">
            <p className="text-xs text-gray-600 mb-4 font-medium uppercase tracking-wider">Supports everything you paste</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['Text', 'Images', 'Code', 'Files', 'URLs', 'GIFs'].map((type) => (
                <span
                  key={type}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t border-white/[0.04]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              © {new Date().getFullYear()} PasteSpace
            </span>
            <span className="text-xs text-gray-600">
              Powered by Supabase
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
