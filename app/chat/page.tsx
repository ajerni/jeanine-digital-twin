'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Twin from '@/components/twin';
import { ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleBack = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
            Digital Twin of Jeanine Erni
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Talk to Jeanine Erni&apos;s Digital Twin
          </p>

          <div className="h-[600px]">
            <Twin />
          </div>

          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>Jeanine Erni - AI Digital Twin</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
