"""Weaviate client service for nearest neighbor search."""
from __future__ import annotations

import os
from typing import Any

import httpx


async def search_weaviate(
    collection: str,
    class_name: str,
    embedding: list[float],
    limit: int = 10,
) -> list[dict[str, Any]]:
    """
    Search Weaviate for nearest neighbors using vector similarity.

    Args:
        collection: The collection name (e.g., "music-room")
        class_name: The class name within the collection (e.g., "Collections")
        embedding: The embedding vector to search with
        limit: Maximum number of results to return

    Returns:
        List of search results with their properties

    Raises:
        ValueError: If required environment variables are not set
        httpx.HTTPError: If the API request fails
    """
    weaviate_url = os.getenv("WEAVIATE_URL")
    weaviate_api_key = os.getenv("WEAVIATE_API_KEY")

    if not weaviate_url:
        raise ValueError("WEAVIATE_URL environment variable is not set")
    if not weaviate_api_key:
        raise ValueError("WEAVIATE_API_KEY environment variable is not set")

    # Construct the GraphQL query for vector search
    query = f"""
    {{
      Get {{
        {class_name}(
          nearVector: {{
            vector: {embedding}
            certainty: 0.7
          }}
          limit: {limit}
        ) {{
          _additional {{
            certainty
            distance
            id
          }}
          ... on {class_name} {{
            title
            description
            url
            metadata
          }}
        }}
      }}
    }}
    """

    headers = {
        "Authorization": f"Bearer {weaviate_api_key}",
        "Content-Type": "application/json",
    }

    # Make the request to Weaviate
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{weaviate_url}/v1/graphql",
            headers=headers,
            json={"query": query},
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

        # Extract results from GraphQL response
        if "errors" in data:
            raise ValueError(f"Weaviate query error: {data['errors']}")

        results = data.get("data", {}).get("Get", {}).get(class_name, [])
        return results
