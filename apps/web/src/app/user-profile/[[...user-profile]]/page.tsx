'use client';

import { UserProfile } from '@clerk/nextjs';

const UserProfilePage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Test header to see if page loads */}
      <div className="relative z-50 p-4">
        <h1 className="text-white text-2xl font-bold">User Profile Page</h1>
        <p className="text-white/70">If you can see this, the page is loading correctly.</p>
      </div>

      {/* Aurora Background */}
      <div className="fixed inset-0 aurora-bg">
        <div className="aurora-gradient"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <UserProfile 
            path="/user-profile"
            routing="path"
            appearance={{
              variables: {
                colorPrimary: '#5B46BF',
                colorBackground: 'transparent',
                colorText: 'white',
                colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
                colorInputBackground: 'rgba(255, 255, 255, 0.1)',
                colorInputText: 'white',
                borderRadius: '0.75rem',
                fontFamily: 'Inter, sans-serif',
                colorDanger: '#DC2626',
                colorSuccess: '#059669',
                colorWarning: '#D97706',
                colorNeutral: 'rgba(255, 255, 255, 0.8)',
                colorTextOnPrimaryBackground: 'white',
                spacingUnit: '1rem',
              },
              elements: {
                rootBox: {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  padding: '2rem',
                },
                card: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                },
                headerTitle: {
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                },
                headerSubtitle: {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                navbarButton: {
                  color: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
                navbarButtonActive: {
                  color: 'white',
                  backgroundColor: 'rgba(91, 70, 191, 0.3)',
                  borderColor: 'rgba(91, 70, 191, 0.5)',
                },
                formButtonPrimary: {
                  backgroundColor: '#5B46BF',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#4338CA',
                  },
                },
                formFieldInput: {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:focus': {
                    borderColor: '#5B46BF',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                },
                formFieldLabel: {
                  color: 'rgba(255, 255, 255, 0.9)',
                },
                identityPreview: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                profileSection: {
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
                profileSectionTitle: {
                  color: 'white',
                },
                profileSectionContent: {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
                badge: {
                  backgroundColor: 'rgba(91, 70, 191, 0.2)',
                  color: '#E8D5FF',
                  borderColor: 'rgba(91, 70, 191, 0.3)',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Global styles for aurora animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes aurora {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes aurora-shift {
            0%, 100% { 
              background: 
                radial-gradient(circle at 20% 80%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(30, 144, 255, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(255, 20, 147, 0.2) 0%, transparent 50%);
            }
            33% { 
              background: 
                radial-gradient(circle at 70% 30%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 30% 70%, rgba(30, 144, 255, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 60% 60%, rgba(255, 20, 147, 0.2) 0%, transparent 50%);
            }
            66% { 
              background: 
                radial-gradient(circle at 50% 90%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 90% 10%, rgba(30, 144, 255, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 10% 50%, rgba(255, 20, 147, 0.2) 0%, transparent 50%);
            }
          }

          .aurora-bg {
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #5b21b6 75%, #7c2d12 100%);
            background-size: 400% 400%;
            animation: aurora 20s ease infinite;
          }

          .aurora-gradient {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 80%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(30, 144, 255, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255, 20, 147, 0.2) 0%, transparent 50%);
            animation: aurora-shift 15s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
};

export default UserProfilePage;