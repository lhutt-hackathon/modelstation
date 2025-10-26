# RunPod API Integration

This module provides integration with RunPod's API for managing GPU-powered pods.

## Setup

1. Add your RunPod API key to the environment:
   ```bash
   export RUNPOD_KEY="your-api-key-here"
   ```

2. Or add it to your `.env` file:
   ```
   RUNPOD_KEY=your-api-key-here
   ```

## API Endpoints

All endpoints are prefixed with `/api/cloud`

### Create a Pod

**POST** `/api/cloud/pods`

Create a new RunPod pod with specified configuration.

**Request Body:**
```json
{
  "name": "my-training-pod",
  "image_name": "runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel",
  "gpu_type_id": "NVIDIA GeForce RTX 3090",
  "cloud_type": "ALL",
  "volume_in_gb": 10,
  "container_disk_in_gb": 10,
  "ports": "8888/http,22/tcp",
  "env": {
    "JUPYTER_TOKEN": "my-secret-token"
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "pod-123",
    "name": "my-training-pod",
    "imageName": "runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel",
    "costPerHr": "0.50",
    "runtime": {
      "uptimeInSeconds": 0,
      "ports": [...]
    }
  },
  "message": "Pod created successfully"
}
```

### Stop a Pod

**POST** `/api/cloud/pods/{pod_id}/stop`

Stop a running pod (preserves data, stops billing).

**Response:**
```json
{
  "data": {
    "id": "pod-123",
    "desiredStatus": "STOPPED"
  },
  "message": "Pod stopped successfully"
}
```

### Resume a Pod

**POST** `/api/cloud/pods/{pod_id}/resume`

Resume a stopped pod.

**Response:**
```json
{
  "data": {
    "id": "pod-123",
    "desiredStatus": "RUNNING"
  },
  "message": "Pod resumed successfully"
}
```

### Get Pod Status

**GET** `/api/cloud/pods/{pod_id}`

Get detailed information about a specific pod.

**Response:**
```json
{
  "data": {
    "id": "pod-123",
    "name": "my-training-pod",
    "desiredStatus": "RUNNING",
    "runtime": {
      "uptimeInSeconds": 3600,
      "ports": [...],
      "gpus": [
        {
          "id": "gpu-1",
          "gpuUtilPercent": 85.5,
          "memoryUtilPercent": 72.3
        }
      ]
    }
  },
  "message": "Pod details retrieved successfully"
}
```

### List All Pods

**GET** `/api/cloud/pods`

List all pods for your account.

**Response:**
```json
{
  "data": {
    "pods": [...],
    "count": 3
  },
  "message": "Retrieved 3 pod(s)"
}
```

### Terminate a Pod

**DELETE** `/api/cloud/pods/{pod_id}`

Permanently delete a pod (cannot be undone).

**Response:**
```json
{
  "data": {
    "success": true,
    "podId": "pod-123"
  },
  "message": "Pod terminated successfully"
}
```

## Library Functions

The underlying library functions are available in `app.lib.runpod`:

```python
from app.lib import runpod

# Create a pod
pod = await runpod.create_pod(
    name="my-pod",
    image_name="runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel",
    gpu_type_id="NVIDIA GeForce RTX 3090",
)

# Get pod status
status = await runpod.get_pod(pod_id="pod-123")

# Stop a pod
await runpod.stop_pod(pod_id="pod-123")

# Resume a pod
await runpod.resume_pod(pod_id="pod-123")

# List all pods
pods = await runpod.list_pods()

# Terminate a pod
await runpod.terminate_pod(pod_id="pod-123")
```

## Error Handling

All functions raise `RunPodError` exceptions on failure:

```python
from app.lib.runpod import RunPodError

try:
    pod = await runpod.create_pod(...)
except RunPodError as e:
    print(f"Failed to create pod: {e}")
```

## GPU Types

Common GPU type IDs:
- `NVIDIA GeForce RTX 3090`
- `NVIDIA A40`
- `NVIDIA A100 80GB PCIe`
- `NVIDIA RTX A6000`

## Cloud Types

- `ALL` - Any available cloud (cheapest option)
- `COMMUNITY` - Community cloud only
- `SECURE` - Secure cloud only (higher trust, higher cost)

## Docker Images

Common RunPod images:
- `runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel` - PyTorch
- `runpod/tensorflow:2.13.0-py3.10-cuda11.8.0-devel` - TensorFlow
- `runpod/base:0.4.0-cuda11.8.0` - Base image with CUDA

## Port Mappings

Format: `<internal_port>/<protocol>,<internal_port>/<protocol>`

Examples:
- `8888/http` - Jupyter notebook
- `22/tcp` - SSH
- `8888/http,22/tcp` - Multiple ports

## Environment Variables

Pass environment variables as a dictionary:

```python
env = {
    "JUPYTER_TOKEN": "my-secret-token",
    "HUGGINGFACE_TOKEN": "hf_...",
    "WANDB_API_KEY": "..."
}
```

## API Documentation

For full API documentation, visit the FastAPI docs at `/docs` when the server is running.
