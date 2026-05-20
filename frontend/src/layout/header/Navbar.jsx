import React from 'react';
import logoImg from '../../assets/logo.png';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../../components/ui/DropdownMenu';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, role, profile, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Find Doctors', href: '/doctors' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const displayName = role === 'doctor' 
    ? (profile?.name || user?.displayName) 
    : (profile?.name || user?.displayName || user?.email?.split('@')[0]);
  const photoURL = role === 'doctor' 
    ? (profile?.avatar || user?.photoURL) 
    : (profile?.photoURL || user?.photoURL);
  const initials = (displayName || '?')[0].toUpperCase();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-background-primary/80 backdrop-blur-md border-border py-3" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="DocLink" className="h-10 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-text-primary">
            Doc<span className="text-accent-primary">Link</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "nav-link",
                location.pathname === link.href && "text-accent-primary"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" onClick={toggleTheme} className="text-text-secondary hover:text-accent-primary transition-colors px-2">
            {isDarkMode ? <Lucide.Sun className="w-5 h-5" /> : <Lucide.Moon className="w-5 h-5" />}
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer outline-none">
                <div className="flex items-center gap-3 bg-background-tertiary/50 border border-border/50 rounded-full pl-3 pr-1 py-1 hover:border-accent-primary/50 transition-colors">
                  <span className="text-sm font-medium text-text-secondary truncate max-w-[100px]">
                    {displayName}
                  </span>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={photoURL} />
                    <AvatarFallback className="bg-accent-primary text-white text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="right">
                <div className="px-3 py-2 border-b border-border/50 mb-1">
                  <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Account</p>
                  <p className="text-sm text-text-primary truncate">{user.email}</p>
                </div>

                <DropdownMenuItem onClick={() => {
                  if (role === "admin") navigate("/admin/dashboard");
                  else if (role === "doctor") navigate("/doctor/dashboard");
                  else navigate("/patient/dashboard");
                }}>
                  <Lucide.LayoutDashboard className="w-4 h-4" />
                  My Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  if (role === "admin") navigate("/admin/settings");
                  else if (role === "doctor") navigate("/doctor/availability");
                  else navigate("/patient/profile");
                }}>
                  <Lucide.UserCircle className="w-4 h-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} variant="danger">
                  <Lucide.LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login/patient">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register/patient">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" onClick={toggleTheme} className="text-text-primary px-2">
            {isDarkMode ? <Lucide.Sun className="w-5 h-5" /> : <Lucide.Moon className="w-5 h-5" />}
          </Button>
          <button 
            className="text-text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <Lucide.X /> : <Lucide.Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-background-secondary border-b border-border px-6 py-4 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="nav-link py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 bg-background-tertiary/50 rounded-xl mb-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={photoURL} />
                    <AvatarFallback className="bg-accent-primary text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-primary">
                      {displayName}
                    </span>
                    <span className="text-xs text-text-secondary">{user.email}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    if (role === "admin") navigate("/admin/dashboard");
                    else if (role === "doctor") navigate("/doctor/dashboard");
                    else navigate("/patient/dashboard");
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full justify-start"
                >
                  <Lucide.LayoutDashboard className="w-5 h-5 mr-2" /> My Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    if (role === "admin") navigate("/admin/settings");
                    else if (role === "doctor") navigate("/doctor/availability");
                    else navigate("/patient/profile");
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full justify-start"
                >
                  <Lucide.UserCircle className="w-5 h-5 mr-2" /> Profile Settings
                </Button>
                <Button variant="ghost" onClick={() => logout()} className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10">
                  <Lucide.LogOut className="w-5 h-5 mr-2" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/login/patient" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/register/patient" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
