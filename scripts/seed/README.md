# Seed Script

Utility for streaming a Hugging Face dataset, embedding rows with OpenAI, and loading them into Weaviate.

## Docker usage

Build the image (replace `seed-ingester` with whatever tag you prefer):

```bash
docker build -t seed-ingester .
```

Run the container, providing the required environment variables for OpenAI and Weaviate:

```bash
docker run --rm \
  -e OPENAI_API_KEY=sk-... \
  -e WEAVIATE_URL=https://your-cluster.weaviate.network \
  -e WEAVIATE_API_KEY=wv-... \
  -e HF_DATASET_NAME=fr3on/company \
  -e HF_DATASET_SPLIT=train \
  seed-ingester
```

### Optional environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `OPENAI_BASE_URL` | Custom OpenAI endpoint | unset |
| `OPENAI_ORGANIZATION` | OpenAI organization ID | unset |
| `HF_TEXT_FIELD` | Dataset text column | `name` |
| `HF_METADATA_FIELDS` | Comma-separated metadata columns | `"website,industry,description"` |
| `HF_MAX_SAMPLES` | Positive cap on processed rows | unset |
| `WEAVIATE_TEXT_PROPERTY` | Primary text property name | `text` |
| `WEAVIATE_VALUES_PROPERTY` | Metadata property storing JSON `"values"` blob | `values` |
| `EMBED_WORKERS` | Embedding worker processes | `2` |

Mount additional configuration (for example `.env` files) with `-v`/`--env-file` if needed.
