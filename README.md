# Frontegg Custom Admin UI Sample

This is a sample application demonstrating how to build a custom user management UI on top of Frontegg's REST API. The application showcases a complete admin dashboard with user profile management, subscription handling, and role-based access control.

## ⚡ Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd frontegg-custom-admin-ui-sample
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

## 🚀 Features

### User Profile Management
- **Profile Page**: Clean, responsive profile display with user information
- **Edit Profile**: Modal form for updating user metadata including:
  - University/College information
  - Qualifications and graduation year
  - Address details (structured as object with address1, city, state, postCode, country)
  - Phone number with E.164 validation
  - **Profile Picture Upload**: File upload with immediate preview and automatic upload to Frontegg
- **Security Settings**: Direct access to Frontegg Admin Portal
- **Real-time Updates**: Profile refreshes automatically after successful updates

### Admin Dashboard
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

### Technical Features
- **Optimized API Usage**: Single vendor token fetch per session to avoid rate limits
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript implementation with proper type definitions
- **Performance**: Efficient data fetching and caching strategies

## 🔧 API Integration

### Authentication Flow
- Uses Frontegg's Next.js SDK for authentication
- Implements role-based access control
- Handles JWT token management automatically

### User Management APIs
- **Get User Profile**: `GET /identity/resources/users/v2/me`
- **Update User Profile**: `PUT /identity/resources/users/v2/me`
- **Get All Users**: `GET /identity/resources/users/v2`
- **Update User (Admin)**: `PUT /identity/resources/users/v1`

### Subscription Management APIs
- **Get Subscription Plans**: `GET /entitlements/resources/plans/v1`
- **Get User Subscriptions**: `GET /entitlements/resources/entitlements/v2?userId={userId}`
- **Create Subscription**: `POST /entitlements/resources/entitlements/v2`
- **Update Subscription**: `PATCH /entitlements/resources/entitlements/v2/{id}`
- **Delete Subscription**: `DELETE /entitlements/resources/entitlements/v2/{id}`

### Vendor Token Management
- **Get Vendor Token**: `POST /auth/vendor/`
- Optimized to fetch once per session and cache until expiration
- Used for all admin operations requiring elevated permissions

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

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

**3. Profile picture upload not working**
- Check that the file size is under 5MB
- Verify the file is a valid image format (JPG, PNG, GIF)
- Ensure your Frontegg tenant supports profile picture uploads

**4. Mobile menu not working**
- Clear browser cache and refresh the page
- Check browser console for JavaScript errors
- Ensure you're using a modern browser with JavaScript enabled

### Getting Help
- Check the [Frontegg Documentation](https://docs.frontegg.com/)
- Review the browser console for error messages
- Open an issue in this repository with detailed error information

## 📝 Customization

### Adding New User Fields
1. Update the metadata structure in profile components
2. Add form fields to `ProfileEditModal.tsx`
3. Update display logic in profile and admin pages

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
- Open an issue in this repository

## 🙏 Acknowledgments

- Built with [Frontegg](https://frontegg.com/) for authentication and user management
- Powered by [Next.js](https://nextjs.org/) for the React framework
- Styled with modern CSS techniques and best practices