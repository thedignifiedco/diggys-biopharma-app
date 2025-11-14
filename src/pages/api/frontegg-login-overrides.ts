import type { NextApiRequest, NextApiResponse } from 'next';

// Biopharma-themed login page overrides for Frontegg hosted mode
// This endpoint returns only the themeV2 and localizations overrides
// See: https://developers.frontegg.com/ciam/sdks/customizations/configuration-old#customization-in-the-hosted-mode

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS for Frontegg to fetch this endpoint
  // Set all CORS headers before handling the request
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
    // Include all common Frontegg headers to avoid repeated CORS errors
    'Access-Control-Allow-Headers': 'Content-Type, x-frontegg-framework, X-Frontegg-Framework, x-frontegg-sdk, X-Frontegg-Sdk, frontegg-requested-application-id, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  // Set all CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight requests - must return headers before ending
  if (req.method === 'OPTIONS') {
    res.status(204).end(); // 204 No Content for OPTIONS
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check the requested application ID from headers
  const requestedAppId = req.headers['frontegg-requested-application-id'] as string | undefined;
  
  // Replace with your actual application ID
  const ALLOWED_APPLICATION_ID = '834a523d-9a3c-4678-9212-e70f930f07b4';
  
  // Only return overrides if the application ID matches
  if (requestedAppId !== ALLOWED_APPLICATION_ID) {
    console.log(`Request from application ID: ${requestedAppId || 'none'} - not matching allowed ID`);
    return res.status(200).json({});
  }

  console.log(`Request from application ID: ${requestedAppId} - applying customizations`);

  // Biopharma-themed customization overrides
  const overrides = {
    themeV2: {
      loginBox: {
        // Theme styling
        themeName: 'modern',
        
        // Logo customization - replace with your actual logo URL
        logo: {
          image: 'http://localhost:3000/pharmacy.png',
          alt: 'Dignified Labs Biopharma Logo',
          maxHeight: '60px'
        },

        // Root background - medical/research aesthetic with gradient
        // If you want to use a background image, provide a URL and combine with gradient
        rootStyle: {
          // For gradient only:
          // background: 'linear-gradient(135deg, #0066cc 0%, #004499 50%, #003366 100%)',
          // For background image with gradient overlay, use:
          background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.6) 0%, rgba(0, 68, 153, 0.6) 50%, rgba(0, 51, 102, 0.6) 100%), url("http://localhost:3000/molecule-pattern-background.jpg")',
          // Or for image only:
          // backgroundImage: 'url("https://your-domain.com/path-to-background-image.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        },
        
        // Alternative: Background image at loginBox level (if rootStyle doesn't work)
        // backgroundImage: 'https://your-domain.com/path-to-background-image.jpg',

        // Box styling - clean, professional medical aesthetic
        boxStyle: {
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 102, 204, 0.15)',
          border: '1px solid rgba(0, 102, 204, 0.1)',
          padding: '40px',
          maxWidth: '480px'
        },

        // Typography - professional, readable
        typography: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          color: '#1a1a1a'
        },

        // Input field styling - clean, medical aesthetic
        inputTheme: {
          base: {
            backgroundColor: '#f8f9fa',
            borderColor: '#e0e7ed',
            color: '#1a1a1a',
            borderRadius: '8px',
            borderWidth: '2px',
            borderStyle: 'solid',
            fontSize: '15px',
            fontWeight: '400',
            height: '48px',
            padding: '0 16px',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          },
          hover: {
            borderColor: '#0066cc',
            backgroundColor: '#ffffff'
          },
          focus: {
            borderColor: '#0066cc',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.1)',
            outline: 'none'
          },
          error: {
            borderColor: '#dc3545',
            backgroundColor: '#fff5f5'
          }
        },

        // Submit button - prominent medical blue
        submitButtonTheme: {
          base: {
            backgroundColor: '#0066cc',
            color: '#ffffff',
            borderColor: 'transparent',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            height: '48px',
            padding: '0 24px',
            transition: 'all 0.2s ease',
            textTransform: 'none',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)'
          },
          hover: {
            backgroundColor: '#0052a3',
            boxShadow: '0 6px 16px rgba(0, 102, 204, 0.4)',
            transform: 'translateY(-1px)'
          },
          active: {
            backgroundColor: '#004499',
            transform: 'translateY(0)'
          }
        },

        // Link button styling
        linkButtonTheme: {
          base: {
            color: '#0066cc',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'color 0.2s ease'
          },
          hover: {
            color: '#0052a3',
            textDecoration: 'underline'
          }
        },

        // Social login buttons - medical blue theme
        socialLogins: {
          divider: {
            text: 'OR',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '500'
          }
        },

        // Signup page specific customization
        signup: {
          // Signup-specific customizations can go here
        },

        // Login page specific customization
        login: {
            docTitle: 'Dignified Labs - Clinical Research Portal Login',
          // Login-specific customizations can go here
        },

        // BoxFooter at loginBox level (not nested under login or signup)
        // Using HTML string format since this is JSON response, not React component
        boxFooter: {
          html: '<div style="text-align: center; margin-top: 30px; font-size: 12px; line-height: 16px; color: #36373C;">By continuing, I agree to Dignified Labs\' <a target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: none;" href="https://dignifiedlabs.com/terms">Terms of Service</a> and <a target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: none;" href="https://dignifiedlabs.com/policy">Privacy Policy</a>.</div>',
          // Fallback: text with styling if HTML is not supported
          text: 'By continuing, I agree to Dignified Labs\' Terms of Service and Privacy Policy.',
          style: {
            textAlign: 'center',
            marginTop: '30px',
            fontSize: '12px',
            lineHeight: '16px',
            color: '#36373C'
          }
        },

        // MFA/Verification styling
        mfa: {
          boxStyle: {
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 102, 204, 0.15)'
          }
        },

        // Error styling
        errorTheme: {
          color: '#dc3545',
          backgroundColor: '#fff5f5',
          borderColor: '#dc3545',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '14px',
          marginTop: '8px'
        }
      }
    },
    localizations: {
      en: {
        loginBox: {
          login: {
            title: 'Welcome to Dignified Labs',
            subtitle: 'Clinical Research Portal',
            emailLabel: 'Professional Email',
            passwordLabel: 'Password',
            submitButtonText: 'Access Portal',
            forgotPasswordText: 'Forgot your password?',
            noAccountText: 'New to our platform?',
            signUpText: 'Request Access',
            docTitle: 'Dignified Labs - Clinical Research Portal Login'
          },
          signup: {
            title: 'Join Dignified Labs',
            subtitle: 'Request access to our clinical research platform',
            emailLabel: 'Professional Email',
            passwordLabel: 'Create Password',
            nameLabel: 'Full Name',
            submitButtonText: 'Request Access',
            hasAccountText: 'Already have access?',
            signInText: 'Sign In',
            docTitle: 'Dignified Labs - Request Access',
            disclaimerCheckboxLabel: 'I acknowledge that I am an authorized biopharmaceutical research professional',
            termsLinkText: 'Terms of Service',
            privacyLinkText: 'Privacy Policy',
            passwordRequirements: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
          },
          forgotPassword: {
            title: 'Reset Password',
            subtitle: 'Enter your professional email to receive password reset instructions',
            emailLabel: 'Professional Email',
            submitButtonText: 'Send Reset Instructions',
            backToLoginText: 'Back to Login',
            docTitle: 'Dignified Labs - Reset Password'
          },
          activateAccount: {
            title: 'Activate Your Account',
            subtitle: 'Your account activation is required to access the clinical research portal',
            submitButtonText: 'Activate Account',
            docTitle: 'Dignified Labs - Activate Account'
          },
          mfa: {
            title: 'Two-Factor Authentication',
            subtitle: 'Enter the verification code from your authenticator app',
            submitButtonText: 'Verify',
            docTitle: 'Dignified Labs - Two-Factor Authentication'
          },
          errors: {
            invalidEmail: 'Please enter a valid professional email address',
            requiredField: 'This field is required',
            passwordTooShort: 'Password must be at least 8 characters',
            passwordTooWeak: 'Password must include uppercase, lowercase, number, and special character',
            invalidCredentials: 'Invalid email or password. Please try again.',
            accountLocked: 'Account temporarily locked due to multiple failed attempts. Please try again later.',
            networkError: 'Network error. Please check your connection and try again.',
            genericError: 'An error occurred. Please try again or contact support.'
          }
        }
      }
    }
  };

  res.status(200).json(overrides);
}

