"""
Patch to fix Prisma/Pydantic forward reference issues.
This must be imported before any Prisma models are loaded.
"""
import os

# Set Pydantic environment variable before imports
os.environ.setdefault("PYDANTIC_SKIP_VALIDATING_CORE_SCHEMAS", "1")
