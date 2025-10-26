FROM debian:12-slim AS build

RUN apt-get update && \
    apt-get install --no-install-suggests --no-install-recommends --yes \
    python3-venv gcc libpython3-dev

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1
ENV UV_NO_CACHE=1
# Use Python 3.11 for compatibility with Prisma Python client
ENV UV_PYTHON=3.11

FROM build AS build-venv

WORKDIR /api
COPY services/api/pyproject.toml pyproject.toml
COPY services/api/uv.lock uv.lock
RUN uv sync --no-dev

FROM build AS final

COPY --from=build-venv /api/.venv /api/.venv
COPY . /app

ENV PATH="/api/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH="/app/services/api"
# Workaround for Pydantic/Prisma forward reference issues in Python 3.12+
ENV PYDANTIC_SKIP_VALIDATING_CORE_SCHEMAS=1

# Generate Python Prisma client from the schema
WORKDIR /app/services/api
RUN python -m prisma generate --schema prisma/schema.prisma

CMD ["sh", "-c", "PYDANTIC_SKIP_VALIDATING_CORE_SCHEMAS=1 uvicorn app.app:app --host 0.0.0.0 --port 8000"]
