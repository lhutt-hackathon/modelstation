"""Embedding service using OpenAI."""
from __future__ import annotations

import os
from typing import Any

import httpx


async def get_embedding(text: str) -> list[float]:
    """
    Generate an embedding vector for the given text using OpenAI's API.

    Args:
        text: The text to embed

    Returns:
        List of floats representing the embedding vector

    Raises:
        ValueError: If OPENAI_API_KEY is not set
        httpx.HTTPError: If the API request fails
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/embeddings",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "input": text,
                "model": "text-embedding-3-small",  # Using the latest embedding model
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["data"][0]["embedding"]
