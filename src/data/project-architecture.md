---
title: "Project Architecture Overview"
tags: ["architecture", "system-design", "backend"]
date: "2024-12-15"
status: "published"
---

# Project Architecture Overview

## System Architecture

The application follows a **microservices architecture** with the following core services:

### Frontend Layer
- React-based SPA with TypeScript
- Tailwind CSS for styling
- Vite as build tool

### Backend Layer
- Node.js API Gateway
- Microservices for domain logic
- PostgreSQL for persistent storage

### Communication
- REST APIs for synchronous calls
- Message queue (RabbitMQ) for async processing
- WebSocket for real-time updates

> **Note:** The message queue implementation is pending review. See the related ADR for details.

## Key Design Decisions

1. **TypeScript over JavaScript** — Type safety reduces production bugs by approximately 40%
2. **Microservices over Monolith** — Better scalability and team autonomy
3. **PostgreSQL over NoSQL** — Data integrity and ACID compliance requirements

## Data Flow

```
Client → API Gateway → Auth Service → Domain Service → Database
                           ↓
                    Message Queue → Event Handlers
```

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Response Time | <200ms | ~150ms |
| Uptime | 99.9% | 99.95% |
| Error Rate | <0.1% | 0.08% |

## Security Considerations

- All traffic encrypted via TLS 1.3
- JWT-based authentication with 15-minute token expiry
- Rate limiting at API Gateway level
- Regular dependency audits with `npm audit`

## Next Steps

1. Complete the message queue integration
2. Set up monitoring dashboard (Grafana + Prometheus)
3. Conduct load testing before Q1 launch