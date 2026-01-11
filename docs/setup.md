# Setup Breadcrumbs

This document explains how this project was initially set up, not how to use the template for new projects. For that, see the [README](../README.md) file.

1. Cloned My [Template for Web Apps](https://github.com/joelbreit/react-tailwind-template#)
2. Started a new git repo (`rm -rf .git`, `git init`)
3. Installed dependencies: `npm install`
4. That's it!

## Capacitor

```sh
# Capacitor Setup
npm install @capacitor/core @capacitor/cli
npx cap init
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
npm run build
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode
npx cap open ios

# Assets
npm install -g @capacitor/assets
```