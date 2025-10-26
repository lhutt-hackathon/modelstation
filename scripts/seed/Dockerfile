FROM debian:12-slim AS build

RUN apt-get update && \
    apt-get install --no-install-suggests --no-install-recommends --yes \
    python3-venv gcc libpython3-dev

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1
ENV UV_NO_CACHE=1

FROM build AS build-venv

COPY pyproject.toml uv.lock /
RUN uv sync --no-dev

FROM build-venv

COPY --from=build-venv /.venv /.venv
COPY . /app

WORKDIR /app

ENV PATH="/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["python", "main.py"]
