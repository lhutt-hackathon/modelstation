import importlib
import pkgutil

from fastapi import APIRouter


router = APIRouter(prefix="/api")

__path__ = pkgutil.extend_path(__path__, __name__)
for _, modname, _ in pkgutil.walk_packages(path=__path__, prefix=__name__ + "."):
    module = importlib.import_module(modname)
    if hasattr(module, "router"):
        router.include_router(module.router)
