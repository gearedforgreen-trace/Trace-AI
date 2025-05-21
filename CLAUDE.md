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
- **State Management**: RTK Query for API state management, React hooks for local state
- **Data Fetching**: RTK Query for all API communications (MANDATORY)
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
- `/src/store` - Redux store configuration and RTK Query API slices
  - `api/` - RTK Query API slice definitions
  - `index.ts` - Store configuration with RTK Query setup
- `/src/lib` - Core utilities and configurations
  - `auth.ts` - Better Auth configuration with plugins
  - `auth-client.ts` - Frontend auth client
  - `prisma.ts` - Prisma client singleton
- `/src/hooks` - Custom React hooks (non-API hooks only)
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

### RTK Query - MANDATORY API Communication Standard

**CRITICAL**: All API communications MUST use RTK Query. Do not create custom API hooks, direct axios calls, or fetch calls.

#### Why RTK Query is Mandatory:
- **Caching**: Automatic intelligent caching with cache invalidation
- **Loading States**: Built-in loading, error, and data states
- **Optimistic Updates**: Seamless user experience with optimistic mutations
- **Background Refetching**: Automatic data synchronization
- **Request Deduplication**: Prevents duplicate API calls
- **DevTools**: Excellent debugging experience
- **Consistency**: Standardized patterns across the entire application

#### RTK Query Setup Structure:

```typescript
// Base API configuration (already set up)
// /src/store/api/baseApi.ts
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/',
  }),
  tagTypes: ['Organization', 'Store', 'Bin', 'Material', 'Coupon'],
  endpoints: () => ({}),
});
```

#### Creating New API Slices:

When adding new entities, create API slices following this pattern:

```typescript
// /src/store/api/entityApi.ts
import { baseApi } from './baseApi';
import type { EntityType } from '@/types';
import { ApiPaginatedResponse, ApiEntityResponse } from '@/types/api';

export const entityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Query endpoints
    getEntities: builder.query<ApiPaginatedResponse<EntityType>, { page?: number; perPage?: number; filter?: string }>({
      query: ({ page = 1, perPage = 20, filter }) => {
        let url = `entities?page=${page}&perPage=${perPage}`;
        if (filter) url += `&filter=${filter}`;
        return url;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: 'Entity' as const, id })),
              { type: 'Entity', id: 'LIST' },
            ]
          : [{ type: 'Entity', id: 'LIST' }],
    }),
    
    // Mutation endpoints
    createEntity: builder.mutation<EntityType, Partial<EntityType>>({
      query: (entity) => ({
        url: 'entities',
        method: 'POST',
        body: entity,
      }),
      invalidatesTags: [{ type: 'Entity', id: 'LIST' }],
    }),
    
    updateEntity: builder.mutation<EntityType, { id: string; entity: Partial<EntityType> }>({
      query: ({ id, entity }) => ({
        url: `entities/${id}`,
        method: 'PUT',
        body: entity,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Entity', id },
        { type: 'Entity', id: 'LIST' },
      ],
    }),
    
    deleteEntity: builder.mutation<void, string>({
      query: (id) => ({
        url: `entities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Entity', id },
        { type: 'Entity', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetEntitiesQuery,
  useCreateEntityMutation,
  useUpdateEntityMutation,
  useDeleteEntityMutation,
} = entityApi;
```

#### Using RTK Query in Components:

```typescript
import {
  useGetStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} from "@/store/api/storesApi";

function StoresComponent() {
  // Query with automatic caching and loading states
  const {
    data: storesResponse,
    isLoading,
    error,
    isFetching,
  } = useGetStoresQuery({
    page: 1,
    perPage: 20,
    organizationId: selectedOrg,
  });

  // Mutations for CRUD operations
  const [createStore] = useCreateStoreMutation();
  const [updateStore] = useUpdateStoreMutation();
  const [deleteStore] = useDeleteStoreMutation();

  // Handle operations
  const handleCreate = async (storeData) => {
    try {
      await createStore(storeData).unwrap();
      // RTK Query automatically updates cache
    } catch (error) {
      // Handle error
    }
  };
}
```

#### Key RTK Query Rules:

1. **NEVER** create custom API hooks that use axios or fetch directly
2. **ALWAYS** use RTK Query for any API communication
3. **ALWAYS** use proper cache invalidation with tags
4. **ALWAYS** handle loading states with the built-in RTK Query states
5. **ALWAYS** use `.unwrap()` on mutations to handle errors properly
6. **NEVER** manually manage API cache - let RTK Query handle it

### User Authentication in API Routes
When working with API routes, use the following pattern to get the current user session:

```typescript
// Import the auth object and headers from Next.js
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Get the session in your API route
const session = await auth.api.getSession({
  headers: await headers(),
});

// Check if the user is authenticated
if (!session) {
  return new NextResponse(
    JSON.stringify({ message: "Unauthorized" }),
    { status: 401 }
  );
}
```

### Prisma Client Initialization

When working directly with Prisma in API routes, use this pattern to initialize the PrismaClient:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Now you can use prisma in your API route
// Example: const users = await prisma.user.findMany();
```

However, to prevent multiple instances of PrismaClient in development, prefer using the singleton instance from `src/lib/prisma.ts`:

```typescript
import { prisma } from "@/lib/prisma";

// Now you can use the prisma client singleton
// Example: const users = await prisma.user.findMany();
```

### Component Architecture
- Page components are client-side (`"use client"`) for interactivity
- Business logic encapsulated in RTK Query hooks (MANDATORY for API operations)
- UI components are modular and composable
- Form handling uses React Hook Form with Zod validation
- Data tables use Tanstack Table with server-side pagination via RTK Query

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

- **When debugging issues, focus on fixing the existing implementation, not replacing it**

- **NEVER create mock data or simplified components** unless explicitly told to do so

- **NEVER replace existing complex components with simplified versions** - always fix the actual problem

- **ALWAYS work with the existing codebase** - do not create new simplified alternatives

- **ALWAYS find and fix the root cause** of issues instead of creating workarounds

- **MANDATORY: ALWAYS use RTK Query for API communications** - Never create custom API hooks, direct axios calls, or fetch calls

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

### Next.js API Routes

- Always await the `params` object in dynamic route handlers - Next.js requires this to properly extract route parameters, e.g.:
  ```typescript
  export async function GET(
    request: NextRequest, 
    { params }: { params: { id: string } }
  ) {
    const { id } = await params; // IMPORTANT: Always await params
    // Rest of the handler...
  }
  ```

- When using Prisma's `include` with related models, use `select` for field filtering rather than `omit`:
  ```typescript
  // CORRECT
  include: {
    relatedModel: {
      select: {
        id: true,
        name: true,
        // Only include fields you need
      }
    }
  }
  
  // INCORRECT - Prisma doesn't support this
  include: {
    relatedModel: {
      omit: {
        createdAt: true,
        updatedAt: true
      }
    }
  }
  ```