# Dashboard Split: Models & Pods

## Overview
The dashboard has been split into two tabs:
1. **Models Tab**: Create and manage AI models from text prompts
2. **Pods Tab**: Manage RunPod H100 GPU instances

## Architecture

### Backend API

#### New Models Endpoints (`/api/models`)

**POST /api/models** - Create a new model
```json
{
  "name": "My Custom Model",
  "prompt": "A description of what the model should learn",
  "base_model": "flux-dev"
}
```
- Creates a `Model` entry in the database
- Creates a `Training` entry with status "queued"
- Returns the created model details

**GET /api/models** - List all models for authenticated user
- Returns list of models with their status
- Ordered by creation date (newest first)

**DELETE /api/models/{model_id}** - Delete a model
- Verifies model ownership
- Cascades to delete associated trainings and datasets

### Frontend Components

#### Dashboard (`/web/app/dashboard/page.tsx`)
- Uses `Tabs` component to switch between Models and Pods
- Shared state management for dialogs and mutations
- Unified delete confirmation dialog

#### Create Model Dialog (`/web/components/dashboard/create-model-dialog.tsx`)
- Form with fields:
  - **Name**: Model name
  - **Base Model**: Select from flux-dev, flux-schnell, sdxl, sd-1.5
  - **Prompt**: Text description for training
- Creates model and queues training automatically

#### Create Pod Dialog (existing)
- Creates H100 GPU pods on RunPod

## Database Schema

### Model Table
```prisma
model Model {
  id          String   @id @default(cuid())
  name        String
  status      String   # "pending", "training", "completed", "failed"
  baseModel   String   # Base model identifier
  dataset     Dataset[]
  training    Training[]
  userId      String
  user        User     @relation(...)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Training Table
```prisma
model Training {
  id          String   @id @default(cuid())
  status      String   # "queued", "running", "completed", "failed"
  model       Model    @relation(...)
  modelId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Features

### Models Tab
- ✅ List all user's models
- ✅ Create new model from prompt
- ✅ View model status and metadata
- ✅ Delete models
- ✅ Empty state with call-to-action
- ✅ Loading skeletons

### Pods Tab (existing functionality)
- ✅ List all pods
- ✅ Create H100 pods
- ✅ Start/stop/resume pods
- ✅ Delete pods
- ✅ View pod statistics
- ✅ Real-time updates every 10 seconds

## User Flow

### Creating a Model
1. User clicks "Create Model" button
2. Dialog opens with form
3. User fills in:
   - Model name
   - Select base model
   - Enter training prompt
4. On submit:
   - Model entry created with status "pending"
   - Training entry created with status "queued"
   - Success toast shown
   - Models list refreshes

### Managing Pods
1. User switches to "Pods" tab
2. Can create new pods or manage existing ones
3. Future: Link pods to models for training

## Future Enhancements

### Training Implementation (TODO)
- [ ] Implement actual training logic
- [ ] Connect pods to models for training
- [ ] Update training status based on progress
- [ ] Add training logs and metrics
- [ ] Support dataset uploads

### Pod-Model Integration
- [ ] Link pods to specific models
- [ ] Auto-start pods for training
- [ ] Display which pod is training which model
- [ ] Training cost tracking

### Model Management
- [ ] Model versioning
- [ ] Download trained weights
- [ ] Test model inference
- [ ] Share models with team

## API Response Examples

### Create Model Response
```json
{
  "id": "clxyz123",
  "name": "My Custom Model",
  "status": "pending",
  "base_model": "flux-dev",
  "created_at": "2025-10-26T10:00:00Z",
  "updated_at": "2025-10-26T10:00:00Z"
}
```

### List Models Response
```json
{
  "data": {
    "models": [
      {
        "id": "clxyz123",
        "name": "My Custom Model",
        "status": "pending",
        "base_model": "flux-dev",
        "created_at": "2025-10-26T10:00:00Z",
        "updated_at": "2025-10-26T10:00:00Z"
      }
    ],
    "count": 1
  }
}
```

## Tech Stack
- **Frontend**: Next.js 15, React Query, shadcn/ui, Tailwind CSS
- **Backend**: FastAPI, Prisma ORM, SQLite
- **State Management**: React Query for server state, React hooks for UI state
- **UI Components**: Tabs, Dialog, Select, Textarea, AlertDialog
