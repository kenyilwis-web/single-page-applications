import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from './AuthSheet';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && pendingRoute) {
      navigate(pendingRoute);
      setPendingRoute(null);
      setIsAuthOpen(false);
    }
  }, [user, pendingRoute, navigate]);

  return createPortal(
    <>
      <nav className="fixed top-6 left-6 right-6 z-[2000] flex items-center justify-between">
        {/* Logo and Nav Links */}
        <div className="flex items-center gap-1">
          {/* Logo */}
          <div className="gradient-coral text-foreground h-11 w-11 rounded-xl flex items-center justify-center shadow-coral">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" className="w-5 h-5">
              <g id="smiley-smirk">
                <path id="Subtract" fill="currentColor" stroke="currentColor" strokeWidth="0.5" fillRule="evenodd" d="M1.83645 1.83645C3.06046 0.612432 4.82797 0 7 0s3.9395 0.612432 5.1636 1.83645C13.3876 3.06046 14 4.82797 14 7s-0.6124 3.9395 -1.8364 5.1636C10.9395 13.3876 9.17203 14 7 14s-3.93954 -0.6124 -5.16355 -1.8364C0.612432 10.9395 0 9.17203 0 7s0.612432 -3.93954 1.83645 -5.16355ZM5.0769 4.98816c0 -0.34518 -0.27982 -0.625 -0.625 -0.625 -0.34517 0 -0.625 0.27982 -0.625 0.625v0.7c0 0.34518 0.27983 0.625 0.625 0.625 0.34518 0 0.625 -0.27982 0.625 -0.625v-0.7Zm5.0962 0c0 -0.34518 -0.27983 -0.625 -0.625 -0.625 -0.34518 0 -0.625 0.27982 -0.625 0.625v0.7c0 0.34518 0.27982 0.625 0.625 0.625 0.34517 0 0.625 -0.27982 0.625 -0.625v-0.7Zm0.1787 2.42929c0.3217 0.12505 0.4812 0.48724 0.3561 0.80897 -0.2805 0.72182 -0.75537 1.29603 -1.40641 1.68306 -0.64416 0.38292 -1.4264 0.56282 -2.30149 0.56282 -0.34518 0 -0.625 -0.2798 -0.625 -0.62501 0 -0.34518 0.27982 -0.625 0.625 -0.625 0.7083 0 1.25628 -0.14564 1.66273 -0.38728 0.39956 -0.23753 0.69571 -0.58697 0.88012 -1.06143 0.12505 -0.32173 0.48725 -0.48117 0.80895 -0.35613Z" clipRule="evenodd"></path>
              </g>
            </svg>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 ml-2">
            <Link 
              to="/" 
              className="relative overflow-hidden bg-card text-foreground h-11 px-5 flex items-center text-sm font-medium rounded-xl border border-border hover:border-accent hover:text-accent transition-all duration-300 shadow-soft"
            >
              Discover
            </Link>
            <button 
              onClick={() => {
                if (user) {
                  navigate('/create-event');
                } else {
                  setPendingRoute('/create-event');
                  setIsAuthOpen(true);
                }
              }}
              className="relative overflow-hidden bg-card text-foreground h-11 px-5 flex items-center text-sm font-medium rounded-xl border border-border hover:border-accent hover:text-accent transition-all duration-300 shadow-soft"
            >
              Create Event
            </button>
            {user && (
              <Link 
                to="/my-events" 
                className="relative overflow-hidden bg-card text-foreground h-11 px-5 flex items-center text-sm font-medium rounded-xl border border-border hover:border-accent hover:text-accent transition-all duration-300 shadow-soft"
              >
                My Events
              </Link>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Auth Button - Desktop */}
          <div className="hidden md:block">
            {user ? (
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
                className="bg-secondary text-secondary-foreground h-11 px-5 flex items-center text-sm font-medium rounded-xl border border-border hover:bg-muted transition-all duration-300"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="gradient-coral text-accent-foreground h-11 px-6 flex items-center text-sm font-semibold rounded-xl shadow-coral hover:shadow-lift transition-all duration-300"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Menu Button - Mobile Only */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative overflow-hidden bg-card text-foreground h-11 w-11 rounded-xl border border-border flex items-center justify-center shadow-soft hover:border-accent transition-all duration-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation - Full Screen */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[3000] flex flex-col animate-fade-in">
          {/* Header with close */}
          <div className="gradient-dark flex items-center justify-between px-6 py-6">
            <div className="gradient-coral text-foreground h-11 w-11 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" className="w-5 h-5">
                <g id="smiley-smirk">
                  <path id="Subtract" fill="currentColor" stroke="currentColor" strokeWidth="0.5" fillRule="evenodd" d="M1.83645 1.83645C3.06046 0.612432 4.82797 0 7 0s3.9395 0.612432 5.1636 1.83645C13.3876 3.06046 14 4.82797 14 7s-0.6124 3.9395 -1.8364 5.1636C10.9395 13.3876 9.17203 14 7 14s-3.93954 -0.6124 -5.16355 -1.8364C0.612432 10.9395 0 9.17203 0 7s0.612432 -3.93954 1.83645 -5.16355ZM5.0769 4.98816c0 -0.34518 -0.27982 -0.625 -0.625 -0.625 -0.34517 0 -0.625 0.27982 -0.625 0.625v0.7c0 0.34518 0.27983 0.625 0.625 0.625 0.34518 0 0.625 -0.27982 0.625 -0.625v-0.7Zm5.0962 0c0 -0.34518 -0.27983 -0.625 -0.625 -0.625 -0.34518 0 -0.625 0.27982 -0.625 0.625v0.7c0 0.34518 0.27982 0.625 0.625 0.625 0.34517 0 0.625 -0.27982 0.625 -0.625v-0.7Zm0.1787 2.42929c0.3217 0.12505 0.4812 0.48724 0.3561 0.80897 -0.2805 0.72182 -0.75537 1.29603 -1.40641 1.68306 -0.64416 0.38292 -1.4264 0.56282 -2.30149 0.56282 -0.34518 0 -0.625 -0.2798 -0.625 -0.62501 0 -0.34518 0.27982 -0.625 0.625 -0.625 0.7083 0 1.25628 -0.14564 1.66273 -0.38728 0.39956 -0.23753 0.69571 -0.58697 0.88012 -1.06143 0.12505 -0.32173 0.48725 -0.48117 0.80895 -0.35613Z" clipRule="evenodd"></path>
                </g>
              </svg>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Menu items */}
          <div className="flex-1 flex flex-col bg-background">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center text-foreground text-2xl font-medium border-b border-border hover:bg-secondary transition-colors animate-fade-in"
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            >
              Discover
            </Link>
            <button 
              onClick={() => {
                if (user) {
                  navigate('/create-event');
                } else {
                  setPendingRoute('/create-event');
                  setIsAuthOpen(true);
                }
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center text-foreground text-2xl font-medium border-b border-border hover:bg-secondary transition-colors animate-fade-in"
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              Create Event
            </button>
            {user ? (
              <>
                <Link 
                  to="/my-events" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center text-foreground text-2xl font-medium border-b border-border hover:bg-secondary transition-colors animate-fade-in"
                  style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
                >
                  My Events
                </Link>
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center text-muted-foreground text-2xl font-medium hover:bg-secondary transition-colors animate-fade-in"
                  style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  setIsAuthOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center text-accent text-2xl font-semibold hover:bg-secondary transition-colors animate-fade-in"
                style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    
    <AuthSheet isOpen={isAuthOpen} onClose={() => { setIsAuthOpen(false); setPendingRoute(null); }} />
    </>,
    document.body
  );
};
