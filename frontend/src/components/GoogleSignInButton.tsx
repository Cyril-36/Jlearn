import { useEffect, useRef } from 'react';

interface GoogleSignInButtonProps {
  clientId: string;
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}

export default function GoogleSignInButton({
  clientId,
  disabled = false,
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId || !containerRef.current) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 20;

    const interval = window.setInterval(() => {
      if (!containerRef.current) {
        window.clearInterval(interval);
        return;
      }

      if (window.google?.accounts?.id) {
        window.clearInterval(interval);
        containerRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => onCredential(credential),
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 380,
        });
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        window.clearInterval(interval);
        onError('Google sign-in is not available right now. Please try again shortly.');
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [clientId, onCredential, onError]);

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      <div ref={containerRef} className="min-h-[44px]" />
    </div>
  );
}
