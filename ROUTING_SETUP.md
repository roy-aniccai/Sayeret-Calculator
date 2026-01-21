# Single-Track Calculator Routing Setup

This document explains the routing setup for the single-track calculator feature.

## Overview

The application now supports two separate calculator applications:

1. **Original Calculator** - Multi-track calculator with track selection
2. **Single-Track Calculator** - Campaign-optimized calculator for "reduce monthly installments" track

## URL Routes

- `/` - Original calculator (index.html → App.tsx)
- `/reduce-payments` - Single-track calculator (reduce-payments.html → SingleTrackApp.tsx)

## File Structure

### Entry Points
- `index.html` - Original calculator HTML entry point
- `reduce-payments.html` - Single-track calculator HTML entry point
- `index.tsx` - Original calculator React entry point
- `single-track.tsx` - Single-track calculator React entry point

### Build Configuration
- `vite.config.ts` - Updated with multiple entry points for both applications
- `firebase.json` - Updated with routing rules for `/reduce-payments` path

## Build Process

The build system generates two separate applications:

```bash
npm run build
```

This creates:
- `dist/index.html` with `main-[hash].js` (original calculator)
- `dist/reduce-payments.html` with `reduce-payments-[hash].js` (single-track calculator)

## Deployment

The Firebase hosting configuration handles routing:
- Requests to `/reduce-payments**` serve `reduce-payments.html`
- All other requests serve `index.html` (original calculator)

## Campaign Integration

Campaign users can be directed to:
- `https://yourdomain.com/reduce-payments` - Basic single-track calculator
- `https://yourdomain.com/reduce-payments?utm_source=facebook&utm_campaign=reduce-payments` - With campaign tracking

## Development

Both applications can be developed simultaneously:
- `npm run dev` - Starts development server
- Access original calculator at `http://localhost:3000/`
- Access single-track calculator at `http://localhost:3000/reduce-payments.html`

## Requirements Satisfied

This setup satisfies the following requirements:
- **4.2**: Maintains two distinct calculator products
- **5.1**: Enables seamless integration with Facebook campaigns through dedicated URL path