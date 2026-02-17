# Technology Stack

**Analysis Date:** 2026-02-17

## Languages

**Primary:**
- TypeScript 5.9.2 - All application code and configuration
- JavaScript - Build configuration, babel config

**Secondary:**
- JSX/TSX - React component markup, used throughout `app/`, `components/`, `services/`

## Runtime

**Environment:**
- React Native 0.81.5 - Cross-platform mobile framework
- Expo 54.0.32 - React Native framework and development environment
- Node.js (via Bun) - Development environment

**Package Manager:**
- Bun - Primary package manager and runtime
- Lockfile: `bun.lock` (present)

## Frameworks

**Core:**
- Expo Router 6.0.22 - File-based routing system for navigation
- React 19.1.0 - UI library (web and native)
- React Native 0.81.5 - Native component rendering
- React DOM 19.1.0 - Web rendering support

**UI & Styling:**
- NativeWind 4.2.1 - Tailwind CSS for React Native
- Tailwind CSS 3.4.17 - CSS utility framework
- React Native Web 0.21.0 - React Native components on web
- Expo Linear Gradient 15.0.8 - Gradient rendering
- React Native SVG 15.12.1 - SVG support

**Navigation:**
- React Navigation 7.1.8 - Core navigation library
- React Navigation Bottom Tabs 7.4.0 - Tab bar navigation
- React Navigation Elements 2.6.3 - Navigation components
- Expo Router 6.0.22 - File-based routing (primary router)

**Maps & Geolocation:**
- RNMapbox Maps 10.2.10 - Mapbox integration for React Native
- Expo Location 19.0.8 - Device geolocation
- Expo Haptics 15.0.8 - Haptic feedback

**Media & Images:**
- Expo Image Picker 17.0.10 - Photo/camera selection
- Expo Image Manipulator 14.0.8 - Image processing
- Expo Image 3.0.11 - Image component
- React Native Image Crop Picker 0.51.1 - Image cropping
- with-rn-image-crop-picker 0.2.0 - Image crop configuration plugin

**Internationalization:**
- i18next 25.8.5 - Translation framework
- react-i18next 16.5.4 - React bindings for i18next
- Expo Localization 17.0.8 - Device locale detection

**Testing:**
- ESLint 9.25.0 - Code linting
- ESLint Config Expo 10.0.0 - Expo-specific linting rules
- Prettier Plugin Tailwind CSS 0.5.11 - CSS class sorting

**Build/Dev:**
- Expo Dev Client 6.0.20 - Local development client
- React Native Gesture Handler 2.28.0 - Gesture system
- React Native Reanimated 4.2.1 - Animation library
- React Native Worklets 0.7.2 - Worklet support for Reanimated
- Babel 7+ - JavaScript transpiler (via metro.config.js)
- Metro - React Native bundler

## Key Dependencies

**Critical:**
- React Native Auth0 5.4.0 - OAuth2 authentication via Auth0
- Async Storage 2.2.0 - Persistent key-value storage
- React Native Safe Area Context 5.4.0 - Safe area handling
- React Native Screens 4.16.0 - Native screen optimization

**Authentication:**
- Expo Apple Authentication 8.0.8 - Native Apple Sign-In
- react-native-auth0 5.4.0 - Auth0 identity provider integration

**Icons & Assets:**
- Expo Vector Icons 15.0.3 - Icon library
- Expo Symbols 1.0.8 - iOS Symbols support
- Expo Google Fonts Nunito Sans 0.4.2 - Custom fonts

**Utilities:**
- Expo Constants 18.0.13 - Manifest and constants
- Expo Linking 8.0.11 - URL/deep linking
- Expo Splash Screen 31.0.13 - Splash screen configuration
- Expo Status Bar 3.0.9 - Status bar styling
- Expo System UI 6.0.9 - System UI integration
- Expo Web Browser 15.0.10 - Web browser integration

## Configuration

**Environment:**
- `.env` file - Contains API configuration and Auth0 credentials
- `EXPO_PUBLIC_API_BASE_URL` - Backend API base URL (default: `http://localhost:3000`)
- `EXPO_PUBLIC_AUTH0_DOMAIN` - Auth0 tenant domain (`libretalk-dev.eu.auth0.com`)
- `EXPO_PUBLIC_AUTH0_CLIENT_ID` - Auth0 application client ID
- `EXPO_PUBLIC_AUTH0_AUDIENCE` - Auth0 API audience
- `EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN` - Mapbox API token for map rendering

**Linting & Formatting:**
- `eslint.config.js` - ESLint configuration
- `.prettierrc` - Prettier formatter config (references prettier-plugin-tailwindcss)
- `tailwind.config.js` - Tailwind CSS configuration

**Build & Compilation:**
- `tsconfig.json` - TypeScript compiler options with strict mode enabled
- `babel.config.js` - Babel transpiler configuration
- `metro.config.js` - React Native bundler configuration
- `app.json` - Expo application configuration

**Path Aliases:**
- `@/*` - Maps to root directory for absolute imports

## Platform Requirements

**Development:**
- Bun runtime (per CLAUDE.md)
- TypeScript 5.9.2 support
- Node.js compatible environment (via Bun)
- Android SDK tools (for android builds)
- Xcode/iOS SDK (for iOS builds)

**Target Platforms:**
- iOS 11+ (via Expo)
- Android 5.0+ (via Expo)
- Web (via React Native Web and Expo web)

**Platform-Specific:**
- iOS: Apple Sign-In support configured in `app.json`
- Android: Cleartext traffic enabled (`usesCleartextTraffic: true`)
- Web: Static output configured

---

*Stack analysis: 2026-02-17*
