import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/admin');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/admin');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Check for "user not found" or "invalid credentials" errors
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Account Not Found',
              description: 'No account exists with this email. Please create a new account to continue.',
              variant: 'destructive',
            });
            // Automatically switch to sign up mode
            setIsLogin(false);
            return;
          }
          throw error;
        }

        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Account created successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-4">
      <SEOHead 
        title={isLogin ? 'Sign In' : 'Sign Up'}
        description={isLogin ? 'Sign in to manage your events and registrations' : 'Create an account to manage events and register for upcoming events'}
      />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="gradient-coral text-foreground h-16 w-16 rounded-2xl flex items-center justify-center shadow-coral">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" className="w-8 h-8">
                <g id="smiley-smirk">
                  <path id="Subtract" fill="currentColor" stroke="currentColor" strokeWidth="0.5" fillRule="evenodd" d="M1.83645 1.83645C3.06046 0.612432 4.82797 0 7 0s3.9395 0.612432 5.1636 1.83645C13.3876 3.06046 14 4.82797 14 7s-0.6124 3.9395 -1.8364 5.1636C10.9395 13.3876 9.17203 14 7 14s-3.93954 -0.6124 -5.16355 -1.8364C0.612432 10.9395 0 9.17203 0 7s0.612432 -3.93954 1.83645 -5.16355ZM5.0769 4.98816c0 -0.34518 -0.27982 -0.625 -0.625 -0.625 -0.34517 0 -0.625 0.27982 -0.625 0.625v0.7c0 0.34518 0.27983 0.625 0.625 0.625 0.34518 0 0.625 -0.27982 0.625 -0.625v-0.7Zm5.0962 0c0 -0.34518 -0.27983 -0.625 -0.625 -0.625 -0.34518 0 -0.625 0.27982 -0.625 0.625v0.7c0 0.34518 0.27982 0.625 0.625 0.625 0.34517 0 0.625 -0.27982 0.625 -0.625v-0.7Zm0.1787 2.42929c0.3217 0.12505 0.4812 0.48724 0.3561 0.80897 -0.2805 0.72182 -0.75537 1.29603 -1.40641 1.68306 -0.64416 0.38292 -1.4264 0.56282 -2.30149 0.56282 -0.34518 0 -0.625 -0.2798 -0.625 -0.62501 0 -0.34518 0.27982 -0.625 0.625 -0.625 0.7083 0 1.25628 -0.14564 1.66273 -0.38728 0.39956 -0.23753 0.69571 -0.58697 0.88012 -1.06143 0.12505 -0.32173 0.48725 -0.48117 0.80895 -0.35613Z" clipRule="evenodd"></path>
                </g>
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isLogin ? 'Sign in to manage your events' : 'Join us to create amazing events'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-border bg-card focus:border-accent focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-border bg-card focus:border-accent focus:ring-accent"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-coral text-accent-foreground font-semibold rounded-xl shadow-coral hover:shadow-lift transition-all duration-300"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        Made with ❤️ by Kenyi from Kenya
      </footer>
    </div>
  );
};

export default Auth;
