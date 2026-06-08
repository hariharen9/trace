import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[900]"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(108,99,255,0.12) 0%, var(--color-void) 70%)' }}>

      {/* Glass card */}
      <div className="w-[400px] max-w-[calc(100vw-40px)] rounded-3xl border border-b2 p-10 text-center animate-fade-in"
        style={{
          background: 'var(--color-glass)',
          backdropFilter: 'blur(32px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.4)',
          boxShadow: '0 40px 120px rgba(0,0,0,.6), 0 0 0 1px rgba(108,99,255,0.08)',
        }}>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <span className="w-3 h-3 rounded-full bg-primary animate-pulse-dot"
            style={{ boxShadow: '0 0 14px var(--color-primary)' }} />
          <span className="font-display text-3xl font-extrabold tracking-[-0.04em]">TRACE</span>
        </div>

        {/* Tagline */}
        <p className="text-t2 text-sm leading-relaxed mb-2">
          Not just a map. A canvas for your coordinates, a timeline of your footprints.
        </p>
        <p className="text-t3 text-xs mb-10">
          Sign in to start mapping your world.
        </p>

        {/* Google Sign-in Button */}
        <button
          onClick={signIn}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 border border-b2 hover:border-ba hover:-translate-y-px hover:shadow-lg"
          style={{
            background: 'var(--color-elevated)',
          }}>
          {/* Google "G" logo */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 000 24c0 3.77.9 7.35 2.56 10.52l7.97-5.93z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.93C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span className="text-t1">Continue with Google</span>
        </button>

        {/* Footer */}
        <p className="text-t3 text-[10px] mt-8 leading-relaxed">
          Your data is stored securely and belongs to you.
        </p>
      </div>
    </div>
  );
}
