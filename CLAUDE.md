# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server with Prisma generation and Next.js turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint for code quality checks

### Database Management
- `pnpm prisma-generate` - Generate Prisma client from schema
- `pnpm prisma-format` - Format the Prisma schema file
- `pnpm prisma-migrate-dev` - Run database migrations in development
- `pnpm prisma-studio` - Open Prisma Studio GUI for database visualization
- `pnpm prisma-seed` - Seed the database with initial data
- `pnpm vercel-build` - Production build with Prisma generation and migration deployment

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM with PostgreSQL
- **Authentication**: Better Auth with organization support, bearer tokens, and username features
- **State Management**: React hooks, custom API hooks, and Tanstack Table for data tables
- **UI Components**: Radix UI primitives with custom wrappers

### Project Structure

#### Core Directories
- `/src/app` - Next.js app directory with page components and API routes
  - `(auth)` - Authentication pages (sign-in, sign-up) with layout
  - `(dashboard)` - Protected dashboard pages with sidebar layout
  - `api` - API routes organized by resource
- `/src/components` - Reusable UI components
  - `ui` - Base UI components (buttons, forms, tables, etc.)
  - Custom business components
- `/src/lib` - Core utilities and configurations
  - `auth.ts` - Better Auth configuration with plugins
  - `auth-client.ts` - Frontend auth client
  - `prisma.ts` - Prisma client singleton
  - `api/` - API service classes and error handling
- `/src/hooks` - Custom React hooks for API operations
- `/src/schemas` - Zod schemas for validation
- `/src/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations

### Database Architecture
The application uses Prisma ORM with PostgreSQL. Key models include:
- **User**: Authentication and profile information
- **Organization**: Multi-tenant support with member roles
- **Store**: Physical locations with addresses and coordinates
- **Material**: Recyclable materials categorized for tracking
- **Bin**: Recycling bins associated with stores and materials
- **Coupon**: Rewards that can be redeemed with points
- **RecycleHistory**: Track user recycling activities and earned points
- **RedeemHistory**: Track coupon redemption history
- **UserTotalPoint**: Aggregate points per user

### API Pattern
The application follows a consistent pattern for API routes:
1. Authentication check using `getSession()`
2. Permission verification with Better Auth's permission system
3. Request validation using Zod schemas
4. Database operations through Prisma
5. Standardized error responses

### Component Architecture
- Page components are client-side (`"use client"`) for interactivity
- Business logic encapsulated in custom hooks (e.g., `useApiCrud`)
- UI components are modular and composable
- Form handling uses React Hook Form with Zod validation
- Data tables use Tanstack Table with server-side pagination

### Authentication & Authorization
- Better Auth handles user authentication with email/password and OAuth
- Role-based access control (RBAC) with admin and user roles
- Organization-based permissions for multi-tenant support
- Session management with bearer token support

### Environment Configuration
The application requires these environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_BASE_URL` - Application base URL for authentication

### Critical Rules - DO NOT VIOLATE

- **NEVER create mock data or simplified components** unless explicitly told to do so

- **NEVER replace existing complex components with simplified versions** - always fix the actual problem

- **ALWAYS work with the existing codebase** - do not create new simplified alternatives

- **ALWAYS find and fix the root cause** of issues instead of creating workarounds

- When debugging issues, focus on fixing the existing implementation, not replacing it

- When something doesn't work, debug and fix it - don't start over with a simple version

- **ALWAYS check Mantine v8 DOCS before making changes** to mantine components - they have breaking changes https://mantine.dev/getting-started/

### TypeScript and Linting

- ALWAYS add explicit types to all function parameters, variables, and return types


- Fix all linter and TypeScript errors immediately - don't leave them for the user to fix

- When making changes to multiple files, check each one for type errors

### Prisma Usage

- NEVER use raw SQL queries ($queryRaw, $queryRawUnsafe) - always use Prisma Client methods

- When relations don't exist in the schema, use separate queries with findMany() and create lookup maps

- Always check the Prisma schema before assuming relations exist