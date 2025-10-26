# Dashboard

The ModelStation Dashboard provides a clean, modern interface for managing RunPod H100 80GB HBM3 GPU instances.

## Features

- **H100 Pod Management**: Create, start, stop, and terminate NVIDIA H100 GPU pods
- **Real-time Status**: Auto-refreshes every 10 seconds to show current pod status
- **Resource Monitoring**: View GPU types, uptime, and cost per hour
- **Statistics**: See total pods, running instances, and estimated hourly costs
- **Simplified Creation**: Quick pod creation with just name and Docker image selection

## Components

### Dashboard Page (`/dashboard`)
Main dashboard view with:
- Summary cards showing total pods, running instances, and costs
- Table view of all pods with status, GPU info, and actions
- Create pod dialog for launching new H100 instances

### Create Pod Dialog
Simplified form for configuring new H100 GPU pods:
- Pod name (required)
- Docker image selection (PyTorch, TensorFlow, Base)
- Fixed H100 80GB HBM3 GPU configuration
- Automatic configuration: Secure Cloud, 50GB volume, 50GB container disk

## API Integration

The dashboard communicates with the backend RunPod REST API v1 through these endpoints:

- `GET /api/cloud/pods` - List all pods
- `POST /api/cloud/pods` - Create a new H100 pod (requires: name, image_name, env)
- `POST /api/cloud/pods/{pod_id}/stop` - Stop a running pod
- `POST /api/cloud/pods/{pod_id}/resume` - Resume a stopped pod
- `DELETE /api/cloud/pods/{pod_id}` - Terminate a pod

### API Changes
- **Migration**: Changed from GraphQL to REST API v1
- **Simplified**: Reduced create_pod parameters from 9 to 3 (name, image_name, env)
- **Fixed GPU**: Always creates H100 80GB HBM3 GPUs
- **Auto-config**: Automatically sets cloudType=SECURE, volumes=50GB

## Technology Stack

- **Frontend**: Next.js 15, React 18, TanStack React Query
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: lucide-react
- **Backend**: FastAPI with requests library
- **API**: RunPod REST API v1 (https://rest.runpod.io/v1)

## Usage

1. Navigate to `/dashboard` in the application
2. View your existing H100 pods in the table
3. Click "Create H100 Pod" to launch a new GPU instance
4. Enter pod name and select Docker image
5. Use the action buttons to control pod lifecycle (play/pause/delete)
6. Monitor costs and resource usage in real-time

## Authentication

All API requests include the Bearer token from localStorage for authentication.
