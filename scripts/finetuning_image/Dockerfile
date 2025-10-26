FROM --platform=linux/amd64 ubuntu:24.04 AS base

ENV DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    python3.12 \
    python3.12-venv \
    && rm -rf /var/lib/apt/lists/*

FROM base AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    mv /root/.local/bin/uv /usr/local/bin/uv && \
    uv --version

WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY src ./src

ENV UV_PROJECT_ENVIRONMENT=/app/.venv

RUN uv sync --frozen --python /usr/bin/python3.12

FROM base AS runtime

WORKDIR /app

COPY --from=builder /app/.venv .venv
COPY --from=builder /app/src ./src

ENV PATH="/app/.venv/bin:${PATH}"

CMD ["python", "-m", "train"]
