'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, BookOpen, Linkedin, Globe, Mail, Check } from 'lucide-react';

export default function LandingPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(password);
      if (success) {
        router.push('/chat');
      } else {
        setError('Invalid password. Please try again.');
        setPassword('');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // To update: replace the numbers below with character codes for your email
  // Use: 'your-email@example.com'.split('').map(c => c.charCodeAt(0)).join(',')
  const emailChars = [106, 101, 97, 110, 105, 110, 101, 46, 101, 114, 110, 105, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109];
  const emailAddress = String.fromCharCode(...emailChars);
  
  const handleEmailCopy = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(emailAddress);
      setEmailCopied(true);
      setTimeout(() => {
        setEmailCopied(false);
      }, 3000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = emailAddress;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setEmailCopied(true);
        setTimeout(() => {
          setEmailCopied(false);
        }, 3000);
      } catch {
        console.error('Failed to copy email');
      }
      document.body.removeChild(textArea);
    }
  };
  
  const personalLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/jeanine-erni-76a90248/',
      icon: Linkedin,
      description: 'Professional Profile',
    },
      {
        name: 'Blog',
        url: 'https://www.jeanineblog.ch',
        icon: BookOpen,
        description: "Jeanine's Blog",
      },
    {
      name: 'Website',
      url: 'https://sway.cloud.microsoft/bDv9uKDLcLNnyINH',
      icon: Globe,
      description: 'Personal Website',
    },
    {
      name: 'Email',
      url: '#',
      icon: Mail,
      description: 'Get in Touch',
      isEmail: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Email Copied Notification */}
      {emailCopied && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px]">
            <Check className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Email copied!</p>
              <p className="text-sm text-green-100">{emailAddress}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Jeanine Erni
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Willkommen in meinem digital space
            </p>
            <p className="text-lg text-gray-500">
              Finanzen | Schulwesen | Theater | Reisen
            </p>
          </div>

          {/* Personal Links Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Connect With Me
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  onClick={link.isEmail ? handleEmailCopy : undefined}
                  target={link.isEmail ? undefined : '_blank'}
                  rel={link.isEmail ? undefined : 'noopener noreferrer'}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-slate-400 cursor-pointer"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <link.icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{link.name}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Password Entry Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 overflow-hidden ring-2 ring-slate-200">
                <Image 
                  src="/avatar.png" 
                  alt="Jeanine Erni" 
                  width={64} 
                  height={64} 
                  className="rounded-full object-cover w-full h-full"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                AI Digital Twin
              </h2>
              <p className="text-gray-600">
                Ask Jeanine for password to chat with her AI digital twin
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent text-gray-800 text-center text-lg"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!password || isLoading}
                className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Access Digital Twin
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                This digital twin uses AI to represent my professional experience and knowledge
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Jeanine Erni. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
