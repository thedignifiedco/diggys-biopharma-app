# Dignified BioPharma - Clinical Research Portal

A comprehensive Next.js application demonstrating Frontegg's authentication and user management capabilities in a biopharmaceutical research context. This application showcases custom onboarding flows, hosted login page customization, role-based access control, and secure clinical research data management.

## 🧬 Overview

This application serves as a **Clinical Research Portal** for biopharmaceutical professionals, providing secure access to:
- Clinical trial data and research documents
- Regulatory submissions and compliance information
- Patient enrollment and trial progress tracking
- Role-based content protection for sensitive research data

Built with [Frontegg](https://frontegg.com/) for enterprise-grade authentication and user management, this demo highlights advanced features including custom onboarding workflows, hosted login page customization, and comprehensive admin capabilities.

## ⚡ Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd diggys-biopharma-app
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env-sample .env.local
   # Edit .env.local with your Frontegg credentials
   ```

3. **Run the app**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

> **Need help finding your credentials?** Check the [Setup section](#⚙️-setup) below for detailed instructions.

## 🚀 Key Features

### 🎨 Custom Hosted Login Page Customization
- **Biopharma-themed design**: Professional medical blue color scheme with molecular pattern backgrounds
- **Custom branding**: Logo, colors, typography, and messaging tailored for clinical research
- **Application-specific overrides**: Conditional customization based on application ID
- **Complete localization**: Biopharma-specific terminology ("Clinical Research Portal", "Professional Email", etc.)
- **Terms & Privacy footer**: Custom footer with links to terms of service and privacy policy

See [LOGIN_CUSTOMIZATION.md](./LOGIN_CUSTOMIZATION.md) for detailed setup instructions.

### 👤 Mandatory Onboarding Flow
- **Post-login trigger**: Automatically appears after every login for new users
- **Profile completion**: Collects comprehensive user information including:
  - Professional details (Company, Job Title, University, Qualification, Graduation Year)
  - Contact information (Phone, Address)
  - Profile picture upload
- **Validation**: All fields (except profile picture) are required before submission
- **Unclosable modal**: Users cannot dismiss the form until completion
- **Metadata tracking**: Sets `onboardingComplete: true` flag in user metadata upon completion
- **One-time flow**: Only shows for users who haven't completed onboarding

### 🔐 Custom Sign-Up Flow
- **Email domain SSO detection**: Automatically redirects to SSO provider if domain is SSO-enabled
- **User existence check**: Validates if user already exists before creation
- **Smart redirects**: Redirects existing users to login with email pre-filled
- **User creation**: Creates new users with default role assignment
- **Email verification**: Prompts users to verify their email after sign-up

### 🏥 Clinical Research Portal
- **Role-based access control**: Content protection for users with "approved_user" or "admin" roles
- **Clinical trial data**: Access to trial protocols, study reports, and data analyses
- **Research documents**: Filtered document access based on user role
- **Access denied messaging**: Clear communication for unauthorized access attempts

### 👥 User Profile Management
- **Profile Page**: Clean, responsive profile display with user information
- **Edit Profile**: Modal form for updating user metadata including:
  - University/College information
  - Qualifications and graduation year
  - Address details (structured as object with address1, city, state, postCode, country)
  - Phone number with E.164 validation
  - **Profile Picture Upload**: File upload with immediate preview and automatic upload to Frontegg
- **Security Settings**: Direct access to Frontegg Admin Portal
- **Real-time Updates**: Profile refreshes automatically after successful updates

### 🛡️ Admin Dashboard
- **User List View**: Scalable list interface with expandable rows for large user bases
- **Role-based Access**: Admin-only access with proper authorization checks
- **Comprehensive User Information**: 
  - Professional Information (Job Title, University, Qualification, Graduation Year)
  - Address Information (Address, Country, Postcode)
  - Contact Details (Phone)
  - Subscription Details (Multiple plans with expiration dates and status indicators)
- **User Management**: Edit user profiles and manage subscriptions
- **Subscription Management**: 
  - View all user subscriptions with plan names and expiration dates
  - Assign new subscription plans with custom expiration dates
  - Update existing subscription expiration dates
  - Remove user subscriptions
  - Visual status indicators (active/expired)

### 🔧 Technical Features
- **Optimized API Usage**: Single vendor token fetch per session to avoid rate limits
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript implementation with proper type definitions
- **Performance**: Efficient data fetching and caching strategies
- **Security**: Open redirect protection, CORS configuration, and secure token management

## 🎯 Use Case: Biopharmaceutical Research

This application demonstrates how Frontegg can be used to build secure, compliant platforms for biopharmaceutical research organizations:

- **HIPAA Compliance**: Secure infrastructure with audit trails and access controls
- **Role-Based Access**: Granular permissions for researchers, administrators, and approved users
- **Data Protection**: Sensitive clinical trial data protected by authentication and authorization
- **Professional Onboarding**: Comprehensive user profile collection for research professionals
- **Custom Branding**: Biopharma-themed UI that builds trust and professionalism

## 🎨 Customization Guide

### Hosted Login Page Customization

The application includes a fully customized hosted login page with biopharma-themed styling. See [LOGIN_CUSTOMIZATION.md](./LOGIN_CUSTOMIZATION.md) for:
- Setup instructions
- Customization options
- Troubleshooting guide
- Production deployment steps

**Quick Setup:**
```bash
# 1. Set environment variable
export FRONTEGG_OVERRIDES_URL=http://localhost:3000/api/frontegg-login-overrides

# 2. Run configuration script
npm run configure-login-overrides
```

### Onboarding Flow Customization

The onboarding modal can be customized by editing `src/components/OnboardingModal.tsx`:
- Add/remove form fields
- Modify validation rules
- Update styling and layout
- Change completion criteria

### Adding New User Fields

1. Update the metadata structure in profile components
2. Add form fields to `OnboardingModal.tsx` and `ProfileEditModal.tsx`
3. Update display logic in profile and admin pages
4. Update validation rules if needed

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_FRONTEGG_CLIENT_ID`
   - `NEXT_PUBLIC_FRONTEGG_API_KEY`
   - `NEXT_PUBLIC_FRONTEGG_BASE_URL`
   - `NEXT_PUBLIC_FRONTEGG_API_URL`
   - `FRONTEGG_OVERRIDES_URL` (production URL)
3. Deploy automatically on push to main branch
4. Run `npm run configure-login-overrides` with production URL after deployment

## 🔧 Troubleshooting

### Common Issues

**1. Authentication not working**
- Verify your `NEXT_PUBLIC_FRONTEGG_CLIENT_ID` is correct
- Check that your `NEXT_PUBLIC_FRONTEGG_BASE_URL` matches your tenant URL
- Ensure your Frontegg app is properly configured

**2. API calls failing**
- Verify your `NEXT_PUBLIC_FRONTEGG_API_KEY` has the correct permissions
- Check that your `NEXT_PUBLIC_FRONTEGG_API_URL` is set to `https://api.frontegg.com`
- Ensure your user has the necessary roles for admin operations

**3. Onboarding modal not appearing**
- Check browser console for errors
- Verify user metadata is being fetched correctly
- Ensure `onboardingComplete` flag is not already set to `true`

**4. Login page customizations not showing**
- Verify `FRONTEGG_OVERRIDES_URL` is set correctly
- Run the configuration script: `npm run configure-login-overrides`
- Check CORS headers in the overrides endpoint
- Verify the application ID matches in the overrides endpoint

**5. Profile picture upload not working**
- Check that the file size is under 5MB
- Verify the file is a valid image format (JPG, PNG, GIF)
- Ensure your Frontegg tenant supports profile picture uploads

**6. SSO redirect not working**
- Verify SSO is configured for the email domain in Frontegg
- Check that the SSO address validation allows your SSO provider
- Review browser console for validation errors

### Getting Help
- Check the [Frontegg Documentation](https://docs.frontegg.com/)
- Review the browser console for error messages
- See [LOGIN_CUSTOMIZATION.md](./LOGIN_CUSTOMIZATION.md) for login customization issues
- Open an issue in this repository with detailed error information

## 📝 Project Structure

```
diggys-biopharma-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page with biopharma content
│   │   ├── layout.tsx               # Root layout with OnboardingGuard
│   │   ├── profile/                 # User profile page
│   │   ├── admin/                   # Admin dashboard
│   │   ├── research/                # Clinical research portal (role-protected)
│   │   └── [...frontegg-router]/    # Frontegg route handler
│   ├── components/
│   │   ├── Header.tsx               # Global header with login button
│   │   ├── SignUpForm.tsx           # Custom sign-up flow
│   │   ├── OnboardingModal.tsx      # Mandatory onboarding form
│   │   ├── OnboardingGuard.tsx      # Onboarding flow trigger
│   │   └── ProfileEditModal.tsx     # Profile editing modal
│   └── pages/
│       └── api/
│           └── frontegg-login-overrides.ts  # Hosted login customization endpoint
├── scripts/
│   └── configure-login-overrides.ts # Script to configure login overrides
├── LOGIN_CUSTOMIZATION.md           # Detailed login customization guide
└── README.md                        # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or support:
- Check the [Frontegg Documentation](https://docs.frontegg.com/)
- Review [LOGIN_CUSTOMIZATION.md](./LOGIN_CUSTOMIZATION.md) for login customization help
- Open an issue in this repository

## 🙏 Acknowledgments

- Built with [Frontegg](https://frontegg.com/) for authentication and user management
- Powered by [Next.js](https://nextjs.org/) for the React framework
- Styled with modern CSS techniques and best practices
