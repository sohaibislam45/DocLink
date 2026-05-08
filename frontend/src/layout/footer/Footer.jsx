import React from 'react';
import * as Lucide from 'lucide-react';
import logoImg from '../../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-primary pt-20 pb-10 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="DocLink" className="h-10 w-auto object-contain" />
              <span className="text-xl font-bold tracking-tight text-text-primary">
                Doc<span className="text-accent-primary">Link</span>
              </span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Premium virtual healthcare platform connecting patients with top-rated medical specialists worldwide.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center hover:bg-accent-primary transition-colors">
                <Lucide.Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center hover:bg-accent-primary transition-colors">
                <Lucide.Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center hover:bg-accent-primary transition-colors">
                <Lucide.Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center hover:bg-accent-primary transition-colors">
                <Lucide.Linkedin className="w-5 h-5" />
              </a>
            </div>

          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-lg font-bold">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="text-text-secondary hover:text-accent-primary transition-colors">Home</a></li>
              <li><a href="#doctors" className="text-text-secondary hover:text-accent-primary transition-colors">Find Doctors</a></li>
              <li><a href="#how-it-works" className="text-text-secondary hover:text-accent-primary transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="text-text-secondary hover:text-accent-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent-primary transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Specialties */}
          <div className="flex flex-col gap-6">
            <h4 className="text-lg font-bold">Specialties</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="text-text-secondary hover:text-accent-primary transition-colors">Cardiology</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent-primary transition-colors">Dermatology</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent-primary transition-colors">Neurology</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent-primary transition-colors">Pediatrics</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent-primary transition-colors">Psychiatry</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-6">
            <h4 className="text-lg font-bold">Contact Us</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3 text-text-secondary">
                <Lucide.Mail className="w-5 h-5 text-accent-primary" />
                <span>[EMAIL_ADDRESS]</span>
              </li>
              <li className="flex items-center gap-3 text-text-secondary">
                <Lucide.Phone className="w-5 h-5 text-accent-primary" />
                <span>01912345678</span>
              </li>
              <li className="flex items-start gap-3 text-text-secondary">
                <Lucide.MapPin className="w-5 h-5 text-accent-primary shrink-0" />
                <span>Uttara Sector 10, Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-sm">
            © {currentYear} DocLink Healthcare. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-text-secondary hover:text-text-primary text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-text-secondary hover:text-text-primary text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-text-secondary hover:text-text-primary text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
