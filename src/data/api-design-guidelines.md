---
title: "API Design Guidelines"
tags: ["api", "backend", "standards", "documentation"]
date: "2025-01-05"
status: "draft"
---

# API Design Guidelines

## Naming Conventions

All REST endpoints should follow these conventions:

- **Plural nouns** for resources: `/users`, `/documents`, `/annotations`
- **Snake case** for query parameters: `?page_number=1&page_size=20`
- **Kebab case** for URL paths with multiple words: `/user-preferences`
- **Version prefix** for major API versions: `/v1/documents`

## Response Format

```json
{
  "data": {},
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 142
  },
  "errors": []
}
```

## Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE |
| 400 | Bad request (validation error) |
| 401 | Unauthenticated |
| 403 | Unauthorized (permission denied) |
| 404 | Resource not found |
| 422 | Unprocessable entity |
| 429 | Rate limited |
| 500 | Internal server error |

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": [
      {
        "field": "title",
        "reason": "must not be empty"
      }
    ]
  }
}
```

## Authentication

All API requests (except public endpoints) must include:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- Anonymous: 60 requests/minute
- Authenticated: 300 requests/minute
- Premium tier: 1000 requests/minute

Rate limit headers are returned in every response:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## TODO

- [ ] Add pagination examples
- [ ] Define sorting conventions (`sort=created_at:desc`)
- [ ] Document webhook format
- [ ] Add OpenAPI/Swagger examples