import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: 'Account created!',
          description: 'You can now sign in with your credentials.'
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          // Check for "user not found" or "invalid credentials" errors
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Account Not Found',
              description: 'No account exists with this email. Please create a new account to continue.',
              variant: 'destructive',
            });
            setIsSignUp(true);
            return;
          }
          throw error;
        }
        
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.'
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[1000] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md gradient-dark z-[1001] shadow-2xl animate-slide-in-right">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-primary-foreground/60 hover:text-primary-foreground transition-colors p-2 rounded-lg hover:bg-primary-foreground/10"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="flex flex-col h-full px-8 pt-20 pb-8">
          <div className="mb-8">
            <h2 className="text-primary-foreground text-3xl font-semibold mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-primary-foreground/60 text-base">
              {isSignUp 
                ? 'Join us to create and manage your events' 
                : 'Sign in to continue to your account'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-primary-foreground/80 text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground px-4 py-3.5 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-primary-foreground/40"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-primary-foreground/80 text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground px-4 py-3.5 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-primary-foreground/40"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-coral text-accent-foreground font-semibold py-4 px-6 rounded-xl shadow-coral hover:shadow-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-foreground/60 hover:text-accent transition-colors text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one"}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 text-center">
            <p className="text-primary-foreground/40 text-sm">
              Made with ❤️ by Kenyi from Kenya
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
