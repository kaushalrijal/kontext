# Kontext

A modern web application for creating, editing, and discovering posts with AI-powered similarity search. Kontext uses Google Vertex AI Multimodal Embeddings to find similar posts based on both images and captions.

## Features

- **Post Management**: Create, edit, and delete posts with images and captions
- **AI-Powered Similarity**: Discover similar posts using Google Vertex AI Multimodal Embeddings
- **Multimodal Search**: Similarity matching considers both image and text content
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16 (TypeScript), React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Vector Database**: Pinecone for storing and querying embeddings
- **AI/ML**: Google Vertex AI Multimodal Embeddings (`multimodalembedding@001`)

## Architecture

### Post CRUD Operations

Each post contains:
- `id`: Unique identifier
- `caption`: Text description
- `image`: Image file path or URL
- `createdAt`, `updatedAt`: Timestamps
- `pineconeImageVectorId`: Pinecone vector ID for image embedding
- `pineconeTextVectorId`: Pinecone vector ID for text embedding
- `pineconeCombinedVectorId`: Pinecone vector ID for combined embedding (optional)
- `embeddingDim`: Embedding dimension (default: 1408)
- `embeddingModel`: Model version used
- `embeddingUpdatedAt`: Last embedding update timestamp

### Embeddings

When a post is created or updated:
1. The image and caption are sent to Vertex AI Multimodal Embeddings API
2. Separate embeddings are generated for the image and text
3. A combined embedding is computed from both modalities
4. All embeddings are stored in Pinecone
5. Metadata is saved in PostgreSQL

### Similarity Search

The similarity search uses both image and text embeddings:

**Option A (Current Implementation)**:
- Compute a combined embedding from image + text embeddings
- Store a single vector per post in Pinecone
- Query Pinecone using the combined vector

**Option B (Alternative)**:
- Store image and text embeddings separately (two vectors per post)
- Query Pinecone for both modalities
- Merge results with weighted scoring: `score = 0.5 * sim(image) + 0.5 * sim(text)`

## Setup

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Google Cloud Project with Vertex AI API enabled
- Pinecone account and index
- Google Cloud service account credentials

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kontext"

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT="your-project-id"
GOOGLE_CLOUD_LOCATION="us-central1"
GOOGLE_APPLICATION_CREDENTIALS="./path/to/service-account.json"

# Pinecone
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="kontext-embeddings"
PINECONE_HOST="your-pinecone-host"  # if applicable
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Kontext
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Embedding Generation

Embeddings are generated server-side using the Vertex AI Multimodal Embeddings API. The model supports:

- **Image Input**: Base64 encoded image bytes (`bytesBase64Encoded`) or GCS URI (`gcsUri`)
- **Text Input**: Caption text
- **Output**: Separate embeddings for image and text, plus a combined embedding

### Model Details

- **Model**: `multimodalembedding@001`
- **Default Embedding Dimension**: 1408
- **Configurable Dimensions**: Can request smaller dimensions (e.g., 512) for tradeoffs between quality and storage

### API Reference

- [Vertex AI Multimodal Embeddings Guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-multimodal-embeddings)
- [Multimodal Embeddings API Reference](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/multimodal-embeddings-api)

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

## Project Structure

```
Kontext/
├── app/                    # Next.js app router pages
│   ├── login/            # Authentication page
│   ├── posts/            # Post management pages
│   │   ├── create/       # Create post page
│   │   └── [id]/         # Post detail and edit pages
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── posts/            # Post-specific components
│   └── shared/           # Shared components
├── lib/                   # Utility functions and handlers
│   ├── handlers/         # Business logic handlers
│   │   ├── auth.ts       # Authentication handlers
│   │   └── posts.ts      # Post CRUD handlers
│   ├── storage.ts        # LocalStorage utilities
│   ├── similarity.ts     # Similarity calculation utilities
│   └── types.ts          # TypeScript type definitions
└── prisma/               # Prisma schema and migrations
```

## Development

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration-name

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Building for Production

```bash
npm run build
npm start
```

## Error Handling

The application includes error handling for:
- Vertex AI API call failures
- Missing images or captions
- Pinecone connection issues
- Database errors
- Invalid post operations

## License

MIT
