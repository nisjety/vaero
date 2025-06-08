# Clerk Profile Integration - Væro Weather App

## Overview
This document explains the Clerk authentication profile integration in the Væro weather application, including the UserProfile and UserButton components with comprehensive styling and functionality.

## Components

### 1. UserProfile Page (`/user-profile/[[...user-profile]]/page.tsx`)

**Features:**
- Beautiful aurora animated background matching the app's design
- Glass-morphism styling with backdrop blur effects
- Comprehensive dark theme customization
- Responsive layout that works on all screen sizes
- Path-based routing configuration
- Complete profile management capabilities

**Key Configuration:**
```tsx
<UserProfile 
  path="/user-profile"
  routing="path"
  appearance={{
    variables: {
      colorPrimary: '#5B46BF', // Aurora purple color
      colorBackground: 'transparent',
      colorText: 'white',
      colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
      colorInputBackground: 'rgba(255, 255, 255, 0.1)',
      colorInputText: 'white',
      borderRadius: '0.75rem',
      fontFamily: 'Inter, sans-serif',
      // Additional color variables for comprehensive theming
      colorDanger: '#DC2626',
      colorSuccess: '#059669',
      colorWarning: '#D97706',
      colorNeutral: 'rgba(255, 255, 255, 0.8)',
      colorTextOnPrimaryBackground: 'white',
      spacingUnit: '1rem',
    },
    elements: {
      // Extensive glass-morphism styling for all elements
      rootBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        padding: '2rem',
      },
      // ... more comprehensive element styling
    }
  }}
/>
```

### 2. UserButton Component (in HeaderSection.tsx)

**Features:**
- Integrated seamlessly into the header design
- Custom glass-morphism styling that matches the aurora theme
- Dark theme popover with beautiful blur effects
- Direct navigation to UserProfile page
- Displays user's first name next to the avatar
- Hover effects and smooth transitions

**Key Configuration:**
```tsx
<UserButton 
  afterSignOutUrl="/"
  userProfileUrl="/user-profile"
  showName={false}
  appearance={{
    elements: {
      avatarBox: {
        width: '28px',
        height: '28px',
      },
      userButtonTrigger: {
        padding: '0',
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.12)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
      },
      userButtonPopoverCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      },
      // ... comprehensive popover styling
    },
    variables: {
      colorPrimary: '#5B46BF',
      colorText: 'white',
      colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '0.75rem',
    }
  }}
/>
```

## Features Included

### UserProfile Page Features:
- **Account Management**: Change email, password, phone number
- **Profile Information**: Update name, profile picture, username
- **Security Settings**: Two-factor authentication, connected accounts
- **Session Management**: View and manage active sessions
- **Account Deletion**: Delete account option

### UserButton Features:
- **Quick Profile Access**: Click avatar to access profile menu
- **Sign Out**: Quick sign out option in the dropdown
- **Profile Navigation**: Direct link to full profile page
- **Account Switching**: If multiple accounts are connected

## Styling Theme

Both components use a consistent dark theme with:
- **Primary Color**: `#5B46BF` (aurora purple)
- **Background**: Glass-morphism with backdrop blur
- **Text**: White and semi-transparent white variants
- **Borders**: Subtle white borders with transparency
- **Hover Effects**: Smooth transitions and enhanced visibility

## Navigation Flow

1. **Header UserButton** → Click avatar
2. **Dropdown Menu** → Select "Manage account" or "Profile"
3. **UserProfile Page** → Full profile management interface
4. **Return** → Browser back button or navigate away

## Mobile Responsiveness

The profile page includes responsive breakpoints:
- **Desktop**: Full-width with centered content
- **Tablet**: Optimized spacing and layout
- **Mobile**: Stacked layout with mobile-friendly interactions

## Security Features

- **Session Management**: Users can view and revoke active sessions
- **Two-Factor Authentication**: Built-in 2FA support
- **Account Recovery**: Password reset and account recovery flows
- **Secure Sign Out**: Proper session cleanup on sign out

## Customization Notes

The styling is heavily customized to match Væro's design language:
- Aurora background animations
- Norwegian color scheme and typography
- Glass-morphism effects throughout
- Smooth transitions and micro-interactions
- Consistent spacing and layout patterns

## Testing Checklist

- [ ] UserButton displays correctly in header
- [ ] UserButton dropdown menu appears with correct styling
- [ ] Navigation to profile page works smoothly
- [ ] Profile page loads with correct styling and animations
- [ ] All profile management features function correctly
- [ ] Sign out flow works properly
- [ ] Mobile responsiveness works across devices
- [ ] Dark theme consistency across all elements
