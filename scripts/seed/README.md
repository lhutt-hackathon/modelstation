# Seed Script

A Python utility for streaming datasets from Hugging Face, generating embeddings with OpenAI, and loading them into Weaviate for vector search.

## Requirements

- Python 3.13+
- OpenAI API key
- Weaviate Cloud instance (or self-hosted Weaviate)

## Installation

### Using uv (recommended)

```bash
uv sync
```

### Using Docker

```bash
docker build -t seed-script .
```

## Configuration

The script is configured via environment variables and constants in [`src/config.py`](src/config.py):

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `OPENAI_BASE_URL` | No | Custom OpenAI API base URL (for proxies or compatible APIs) |
| `WEAVIATE_URL` | Yes | Weaviate cluster URL |
| `WEAVIATE_API_KEY` | Yes | Weaviate API key |

### Dataset Configuration

Edit [`src/config.py`](src/config.py) to configure your dataset:

```python
# Dataset source
DATASET_NAME = "FreedomIntelligence/medical-o1-reasoning-SFT"
DATASET_CONFIG = "en"  # Optional config name
DATASET_SPLIT = "train"

# Field mappings
DATASET_INPUT_REFERENCE = "Question"  # Text field to embed
DATASET_OUTPUT_REFERENCE = ["Response"]  # Expected output fields
DATASET_TASK_REFERENCE = None  # Optional task/system prompt field

# Processing limits
DEFAULT_MAX_SAMPLES = None  # Limit samples (None = all)
DEFAULT_BATCH_SIZE = 32  # Embedding batch size
DEFAULT_MODEL_NAME = "text-embedding-3-large"  # OpenAI model
DEFAULT_CLASS_NAME = "LLMTrainingSample"  # Weaviate collection name
```

## Usage

### Local Execution

1. Set up environment variables:

```bash
export OPENAI_API_KEY="your-api-key"
export WEAVIATE_URL="https://your-instance.weaviate.network"
export WEAVIATE_API_KEY="your-weaviate-key"
```

2. Run the script:

```bash
uv run main.py
```
