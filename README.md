# ModelStation — SLM Fine-tuning Platform (Simple Overview)

Short summary
- ModelStation turns user requirements into a compact, high-quality SLM (small tail model) by:
  1. Capturing a user query / intent,
  2. Distilling that intent against a large dataset to produce a focused custom dataset,
  3. Fine-tuning a base SLM on that distilled dataset,
  4. Producing a small, deployable model tailored to the customer's needs.

Architecture & components
- Web frontend: user interactions, login, model creation flows. See [web/hooks/use-user.tsx](web/hooks/use-user.tsx).
- API: authentication and model management endpoints:
  - Auth: [`/auth/login`, `/auth/logout`, `/auth/me`] implemented in [api/app/controllers/auth/routes.py](api/app/controllers/auth/routes.py).
  - Models: Create/list/delete model entries in [api/app/controllers/models/routes.py](api/app/controllers/models/routes.py).
- Semantic split / dataset generator: queries vector store (Weaviate) and builds dataset slices for a given user intent. See [`DatasetGenerator`](scripts/semantic_split/app/dataset_generator.py) and [scripts/semantic_split/main.py](scripts/semantic_split/main.py).
- Seed & embedding: dataset ingestion and embedding creation are in [scripts/seed/main.py](scripts/seed/main.py) and config in [scripts/seed/src/config.py](scripts/seed/src/config.py).
- Fine-tuning trainer: actual fine-tune pipeline that turns distilled data into a small SLM is in [scripts/finetuning_image/src/train_app/trainer.py](scripts/finetuning_image/src/train_app/trainer.py).

High-level flow (user-friendly)
1. User submits a request to create a custom model via the web UI.
   - Frontend code uses the user context and calls the API. See [web/hooks/use-user.tsx](web/hooks/use-user.tsx).
2. API creates a model record (status: "pending") and enqueues a training job.
   - Model creation entrypoint: [api/app/controllers/models/routes.py](api/app/controllers/models/routes.py).
3. Semantic distillation
   - The semantic-split service queries Weaviate for examples matching the user's intent (`DatasetGenerator`), filters/structures rows, then optionally pushes a curated dataset to Hugging Face. See [`DatasetGenerator`](scripts/semantic_split/app/dataset_generator.py) and [scripts/semantic_split/main.py](scripts/semantic_split/main.py).
4. Embedding & seeding (if needed)
   - If you need to augment or seed data, the seed scripts embed and insert samples into the vector store. See [scripts/seed/main.py](scripts/seed/main.py) and [scripts/seed/src/config.py](scripts/seed/src/config.py).
5. Fine-tuning
   - The trainer consumes the distilled dataset, converts to the required format, and runs fine-tuning to produce a small, highly-tailored SLM. See [scripts/finetuning_image/src/train_app/trainer.py](scripts/finetuning_image/src/train_app/trainer.py).
6. Deployment & use
   - The resulting model (small tail model) is saved and can be used for inference in any project/team. The platform maintains model metadata in the API database and exposes endpoints to list/delete models. See [api/app/controllers/models/routes.py](api/app/controllers/models/routes.py).

Why this approach?
- Distillation: selecting a focused subset of the big dataset aligns training examples with the customer's policy, objective, and distribution — producing a compact dataset that yields an efficient "tail" model.
- Small tail model: fine-tuning a small SLM on the distilled dataset produces a lightweight model that preserves desired behavior while being cheaper and faster to serve.

Developer quickstart (local)
- The repo includes Docker Compose files to run services:
  - development: [compose.dev.yaml](compose.dev.yaml)
  - production/single-file examples: [compose.yaml](compose.yaml), [compose.prod.yaml](compose.prod.yaml)
- Typical steps:
  1. Configure environment variables (do not commit secrets).
  2. Start services with Docker Compose (use the dev compose for local testing).
  3. Use the frontend to create a model or call API endpoints directly.
  4. Monitor logs for the semantic split, embedding, and trainer services.

Key endpoints & symbols
- Auth routes: [api/app/controllers/auth/routes.py](api/app/controllers/auth/routes.py) (login, logout, /me).
- Model management: [api/app/controllers/models/routes.py](api/app/controllers/models/routes.py) (create/list/delete).
- Semantic dataset generation: [`DatasetGenerator`](scripts/semantic_split/app/dataset_generator.py) and [scripts/semantic_split/main.py](scripts/semantic_split/main.py).
- Trainer: [scripts/finetuning_image/src/train_app/trainer.py](scripts/finetuning_image/src/train_app/trainer.py).
- Seed & embedding: [scripts/seed/main.py](scripts/seed/main.py) and [scripts/seed/src/config.py](scripts/seed/src/config.py).

Notes & next steps
- Secrets: keep API keys and tokens out of version control (use environment variables).
- Training orchestration: currently the API enqueues training entries; integrate a job-worker or pod orchestration to run the trainer and report progress back to the API.
- Metrics & QA: add evaluation suites and logging during training to validate model behavior against the customer's success criteria.

License & contribution
- See [LICENSE.md](LICENSE.md) for license details and [README.md](README.md) for contribution pointers.
