# Kontext

A modern web application for creating, editing, and discovering posts with AI-powered similarity search. Kontext uses multimodal embeddings to find similar posts based on both images and captions.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Embedding Providers](#embedding-providers)
  - [Option 1: Self-Hosted Local Inference Server](#option-1-self-hosted-local-inference-server-recommended)
  - [Option 2: Google Vertex AI](#option-2-google-vertex-ai)
- [Architecture](#architecture)
- [Rate Limiting](#rate-limiting)
- [Project Structure](#project-structure)
- [Development](#development)
- [Error Handling](#error-handling)
- [License](#license)

## Features

- **Post Management**: Create, edit, and delete posts with images and captions
- **AI-Powered Similarity**: Discover similar posts using multimodal embeddings
- **Multimodal Search**: Similarity matching considers both image and text content
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Authentication**: Google OAuth integration via NextAuth.js
- **Rate Limiting**: Built-in protection against API abuse

## Tech Stack

- **Frontend**: Next.js 16 (TypeScript), React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Vector Database**: Pinecone for storing and querying embeddings
- **Authentication**: NextAuth.js with Google OAuth
- **AI/ML**: Supports both self-hosted inference server and Google Vertex AI

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Pinecone account and index
- (Optional) Google Cloud Project with Vertex AI API enabled (if using Vertex AI)
- (Optional) Self-hosted inference server (if using local provider)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Kontext
```

2. **Install dependencies:**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables:**
Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables) section below).

4. **Set up the database:**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Run the development server:**
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

That's it! The setup is frictionless - just configure your database and environment variables, then run the app.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kontext"

# Pinecone
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="kontext-embeddings"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"  # Generate with: openssl rand -base64 32

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Embedding Provider Configuration

Choose one of the following options:

#### For Local Inference Server (Recommended)

```env
# Embedding provider selection
EMBEDDING_PROVIDER="local"  # or omit for default

# Local inference server URL (optional, defaults to http://127.0.0.1:8050/embed)
LOCAL_INFERENCE_URL="http://127.0.0.1:8050/embed"
```

#### For Google Vertex AI

```env
# Embedding provider selection
EMBEDDING_PROVIDER="vertex"

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT="your-project-id"
GOOGLE_CLOUD_LOCATION="us-central1"
# Base64-encoded service account JSON
GOOGLE_SERVICE_KEY="base64-encoded-service-account-json"
```

### Optional Variables

```env
# Embedding model identifier (for metadata tracking)
EMBEDDING_MODEL="multimodalembedding@001"
```

## Embedding Providers

Kontext supports two embedding provider options. You can choose based on your needs:

### Option 1: Self-Hosted Local Inference Server (Recommended)

This option uses a local FastAPI inference server that you host yourself. It provides:
- **Full control** over the embedding process
- **No external API costs**
- **Privacy** - data stays on your infrastructure
- **328-dimensional embeddings** optimized for similarity search

#### Setup

1. **Start your local inference server** (must be running before creating posts):
   - The server should expose an endpoint at `http://127.0.0.1:8050/embed` (or your custom URL)
   - Accepts POST requests with:
     - `image`: Image file (multipart/form-data)
     - `text`: Optional caption text
   - Returns JSON with `embedding` array (328 dimensions)

2. **Configure environment variables:**
```env
EMBEDDING_PROVIDER="local"
LOCAL_INFERENCE_URL="http://127.0.0.1:8050/embed"  # Optional, defaults to this
```

3. **Verify the server is running:**
   - The app will show helpful error messages if the server is unavailable
   - Check that embeddings are generated when creating posts

#### Embedding Details

- **Dimensions**: 328
- **Input**: Image (optional) + Text (optional)
- **Output**: Single multimodal embedding vector
- **Format**: Array of 328 floating-point numbers

### Option 2: Google Vertex AI

This option uses Google's Vertex AI Multimodal Embeddings API. It provides:
- **Managed service** - no infrastructure to maintain
- **High-quality embeddings** from Google's models
- **Scalability** - handles high traffic automatically

#### Setup

1. **Create a Google Cloud Project** and enable Vertex AI API

2. **Create a service account** with Vertex AI permissions:
   - Download the service account JSON key
   - Base64 encode it: `cat service-account.json | base64`

3. **Configure environment variables:**
```env
EMBEDDING_PROVIDER="vertex"
GOOGLE_CLOUD_PROJECT="your-project-id"
GOOGLE_CLOUD_LOCATION="us-central1"
GOOGLE_SERVICE_KEY="base64-encoded-service-account-json"
```

#### Embedding Details

- **Model**: `multimodalembedding@001`
- **Dimensions**: 1408 (default) or configurable
- **Input**: Image (base64) + Text
- **Output**: Multimodal embedding vector

## Architecture

### Post CRUD Operations

Each post contains:
- `id`: Unique identifier (CUID)
- `caption`: Text description
- `imageUrl`: Image file path (stored in `/public/uploads/`)
- `userId`: Owner of the post (via NextAuth)
- `createdAt`, `updatedAt`: Timestamps
- `pineconeCombinedVectorId` (optional): Pinecone vector ID
- `embeddingDim` (optional): Embedding dimension (e.g., 328 for local, 1408 for Vertex)
- `embeddingModel` (optional): Model identifier
- `embeddingUpdatedAt` (optional): Last embedding update timestamp

### Embedding Generation Flow

When a post is created or updated:

1. **Image Upload**: Image is saved to `/public/uploads/` directory
2. **Embedding Generation**: 
   - Image and caption are sent to the configured embedding provider
   - For local provider: Sent to your self-hosted inference server
   - For Vertex AI: Sent to Google's API
3. **Vector Storage**: The embedding (328 dimensions for local, 1408 for Vertex) is stored in Pinecone
   - Vector ID = Post ID
   - Metadata includes `postId` and `dimension`
4. **Metadata Persistence**: Embedding metadata is stored in PostgreSQL for observability

### Similarity Search

The similarity search uses the stored embeddings:

1. **Query Generation**: When viewing a post, its embedding is retrieved (or computed if missing)
2. **Vector Search**: Pinecone is queried for similar vectors using cosine similarity
3. **Result Ranking**: Top 6 similar posts are returned with similarity scores
4. **Lazy Backfill**: If a post doesn't have an embedding yet, it's computed on-demand

### Data Flow

```
User creates post
  ↓
Image uploaded → /public/uploads/
  ↓
Post saved to PostgreSQL
  ↓
Embedding generated (local server or Vertex AI)
  ↓
Vector stored in Pinecone (328 or 1408 dimensions)
  ↓
Metadata saved to PostgreSQL
```

## Rate Limiting

The application includes built-in rate limiting to protect against abuse:

- **Image Upload**: 10 requests per minute per user/IP
- **Embedding API**: 20 requests per minute per IP
- **Similar Posts**: 30 requests per minute per IP

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when the limit resets
- `Retry-After`: Seconds to wait before retrying (on 429 responses)

When rate limited, the API returns a `429 Too Many Requests` status with a helpful error message.

## Project Structure

```
Kontext/
├── app/                          # Next.js app router
│   ├── api/                     # API routes
│   │   ├── auth/                # NextAuth configuration
│   │   ├── embed/               # Embedding generation endpoint
│   │   ├── posts/               # Post-related endpoints
│   │   └── upload-image/        # Image upload endpoint
│   ├── login/                   # Authentication page
│   ├── posts/                   # Post management pages
│   │   ├── create/              # Create post page
│   │   ├── [id]/                # Post detail and edit pages
│   │   └── page.tsx             # Posts gallery
│   ├── layout.tsx               # Root layout
│   ├── providers.tsx            # React providers (Session, Toast)
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   ├── posts/                    # Post-specific components
│   └── shared/                  # Shared components (Header, Skeleton, etc.)
├── lib/                          # Utility functions and business logic
│   ├── actions/                 # Server actions
│   │   └── post.actions.ts      # Post CRUD operations
│   ├── embeddings/              # Embedding providers
│   │   ├── index.ts             # Provider factory
│   │   ├── local.ts              # Local inference server provider
│   │   ├── vertex.ts            # Vertex AI provider
│   │   └── provider.ts          # Provider interface
│   ├── pinecone/                # Pinecone integration
│   │   ├── client.ts            # Pinecone client setup
│   │   └── posts.ts             # Post vector operations
│   ├── rate-limit.ts            # Rate limiting utility
│   ├── db.ts                    # Prisma client
│   └── types.ts                 # TypeScript types
├── prisma/                       # Prisma schema and migrations
│   └── schema.prisma            # Database schema
└── public/                       # Static assets
    └── uploads/                  # User-uploaded images
```

## Development

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration-name

# Apply migrations to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Setup for Development

1. Ensure PostgreSQL is running
2. Create a database: `createdb kontext`
3. Set `DATABASE_URL` in `.env.local`
4. Run migrations: `npx prisma migrate dev`
5. Start your local inference server (if using local provider)
6. Run the dev server: `npm run dev`

## Error Handling

The application includes comprehensive error handling:

### Server-Side Errors

- **Embedding Service Unavailable**: Clear error messages when the local inference server is down
- **Database Errors**: Proper error handling for connection issues
- **Authentication Errors**: Unauthorized access is handled gracefully
- **Rate Limiting**: 429 responses with retry information

### Client-Side Errors

- **User-Friendly Messages**: Specific error messages for different failure scenarios:
  - Embedding service unavailable
  - Image upload failures
  - Permission errors
  - Post not found
- **Toast Notifications**: Errors are displayed as toast notifications in the bottom-right corner
- **Graceful Degradation**: App continues to function even if some features fail

### Error Messages

The application provides helpful error messages without exposing sensitive details:

- ✅ "Unable to create post. The embedding service is not available."
- ✅ "You don't have permission to update this post."
- ❌ Not: "Connection refused: 127.0.0.1:8050" (too technical)

## Similarity Examples

The application demonstrates three key similarity scenarios:

### Example A: Image Similarity Dominates

**Posts**:
1. Image: Golden retriever photo, Caption: "Weekend vibes."
2. Image: Different dog photo, Caption: "Random thoughts."
3. Image: Cat photo, Caption: "Weekend vibes."

**Expected Result**: Post (1) should rank post (2) above post (3) based on image similarity, despite post (3) having identical text.

### Example B: Text Similarity Dominates

**Posts**:
1. Caption: "50% off facials this weekend"
2. Caption: "Weekend facial sale — 50% off"
3. Caption: "New products are in stock"

**Expected Result**: Posts (1) and (2) are nearest neighbors even if images differ significantly.

### Example C: Image + Text Together

**Posts**:
1. Image: Matcha latte, Caption: "New matcha latte is here"
2. Image: Matcha drink, Caption: "Try our new matcha latte"
3. Image: Latte art, Caption: "Cold brew is back"

**Expected Result**: Posts (1) ↔ (2) is the closest match; post (3) is less similar despite being a beverage.

## License

MIT
