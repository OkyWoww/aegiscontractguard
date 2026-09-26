#!/usr/bin/env python3
"""
AegisContractGuard - OpenAPI v2 Generator Script
Extracts the OpenAPI 3.1.0 specification schema from backend.app.main_v2:app
and exports it to bob-specs/openapi_v2.json as the grounded target contract.
"""

import json
import os
import sys
from pathlib import Path

# Ensure root repository directory is on sys.path
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from backend.app.main_v2 import app
except ImportError as e:
    print(f"Error importing main_v2 application: {e}")
    sys.exit(1)


def generate_openapi_spec(output_path: Path) -> None:
    """
    Generates and enriches the OpenAPI v2 schema from FastAPI main_v2 app,
    ensuring mandatory x-api-version headers are marked required in parameters.
    """
    openapi_schema = app.openapi()

    # Post-process parameters to ensure x-api-version is marked required: true
    for path, path_item in openapi_schema.get("paths", {}).items():
        for method, operation in path_item.items():
            if not isinstance(operation, dict):
                continue
            params = operation.get("parameters", [])
            for param in params:
                if param.get("name", "").lower() == "x-api-version":
                    param["required"] = True
                    param["description"] = "Mandatory API version header (must be exactly '2.0')"
                    param["schema"] = {
                        "type": "string",
                        "enum": ["2.0"],
                        "default": "2.0"
                    }

    # Ensure target directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated OpenAPI v2 contract schema at:")
    print(f"  -> {output_path.resolve()}")


if __name__ == "__main__":
    target_file = PROJECT_ROOT / "bob-specs" / "openapi_v2.json"
    generate_openapi_spec(target_file)
