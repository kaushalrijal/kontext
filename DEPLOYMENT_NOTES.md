# Deployment Notes

## Database Migration Required

After deploying to Vercel, you need to sync the production database with the schema changes.

### Steps:

1. Go to your Vercel project settings
2. Add the production `DATABASE_URL` to your local `.env` file temporarily
3. Run: `npx prisma db push`
4. Remove the production DATABASE_URL from your local `.env`

**OR** use Vercel CLI:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Pull environment variables
vercel env pull

# Run the database push
npx prisma db push

# Clean up
rm .env.local
```

## Changes Made

### Fixed Prisma Deployment Issues (Commit: 9e1e94f)
- Updated Prisma to generate library engines (.node files) for serverless compatibility
- Fixed Next.js 16 Turbopack configuration
- Added proper file tracing for Prisma binaries
- Created .vercelignore to ensure binaries are included

### Added Embedding Fields to Post Model
- `pineconeCombinedVectorId`: Stores reference to vector in Pinecone
- `embeddingDim`: Stores embedding dimensions
- `embeddingModel`: Tracks which AI model generated the embedding
- `embeddingUpdatedAt`: Timestamp for when embeddings were last updated

These fields are essential for the AI-powered similar content discovery feature.
