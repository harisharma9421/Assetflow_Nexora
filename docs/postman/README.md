# Postman Collections

This folder contains the backend API contract Postman files for AssetFlow.

## Files

- `AssetFlow_Backend.postman_collection.json`: full backend API contract collection organized by feature module.
- `AssetFlow_Local.postman_environment.json`: local environment variables for development.

## Usage

1. Open Postman.
2. Import both JSON files.
3. Select the `AssetFlow Local` environment.
4. Start with `01 - Authentication and RBAC`, then use the module folders needed by the frontend screen being built.

The collection is intended as the shared frontend/backend API contract. As backend controllers are implemented, keep endpoint paths and request/response payloads aligned with this collection.
