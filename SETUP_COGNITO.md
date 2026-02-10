# AWS Cognito Setup Guide

## Step 1: Install Dependencies

Run these commands:

```bash
npm install aws-amplify @aws-amplify/ui-react
```

## Step 2: AWS Console Setup

1. Go to AWS Console → Amazon Cognito
2. Click "Create user pool"
3. Configure the following:
   - **Sign-in options**: Email
   - **Password policy**: Choose your requirements
   - **MFA**: Optional (recommended for production)
   - **User account recovery**: Email
   - **Self-registration**: Enabled
   - **Email provider**: Use Cognito (or configure SES for production)
4. Create an **App client**:
   - App type: Public client
   - App client name: event-planning-app
   - Authentication flows: ALLOW_USER_PASSWORD_AUTH, ALLOW_REFRESH_TOKEN_AUTH
5. Note these values:
   - **User Pool ID**: us-east-1_XXXXXXXXX
   - **App Client ID**: xxxxxxxxxxxxxxxxxxxx
   - **Region**: us-east-1 (or your region)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root with:

```
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_AWS_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
```

## Step 4: Implementation

The authentication components have been created in:
- `src/config/amplify.js` - Amplify configuration
- `src/components/Auth/AuthWrapper.jsx` - Authentication wrapper
- `src/components/Auth/SignIn.jsx` - Custom sign-in component
- `src/components/Auth/SignUp.jsx` - Custom sign-up component

## Step 5: Test Authentication

1. Run `npm run dev`
2. You should see the sign-in page
3. Click "Create account" to sign up
4. Check your email for verification code
5. Sign in with your credentials

## Optional: Backend API with Cognito

If you need a Node.js backend to verify Cognito tokens:

```bash
npm install express aws-jwt-verify cors
```

See `server/index.js` for the backend implementation.

## Security Notes

- Never commit `.env` file to git
- Use AWS SES for production email delivery
- Enable MFA for production
- Set up proper CORS policies
- Use HTTPS in production
