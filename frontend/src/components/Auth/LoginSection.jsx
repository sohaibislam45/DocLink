import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { showError, showSuccess } from '../../lib/swal';

const LoginSection = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      showSuccess('Welcome back! Logged in successfully.');
      navigate('/');
    } catch (err) {
      showError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      showSuccess('Welcome back! Logged in successfully.');
      navigate('/');
    } catch (err) {
      showError('Failed to log in with Google.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 pt-32 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-background-secondary/50 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-primary/10 text-accent-primary mb-4">
                <LogIn className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">Welcome Back</h1>
              <p className="text-text-secondary">Enter your details to access your account</p>
            </div>



            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-accent-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-background-tertiary/50 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-medium text-text-secondary">Password</label>
                  <button type="button" className="text-xs font-semibold text-accent-primary hover:underline">Forgot password?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-accent-primary transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background-tertiary/50 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-accent-primary/20"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <span className="relative px-4 bg-transparent text-sm text-text-secondary">or continue with</span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-2xl border-border/50 hover:bg-background-tertiary/50 gap-3"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <p className="mt-8 text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-accent-primary hover:underline">
                Create one now
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginSection;
