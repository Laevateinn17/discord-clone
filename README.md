
# Viscord - Discord clone using microservices

A Discord clone with real time chat, voice, and core features implemented using NextJS, NestJS, WebRTC and microservices architecture.

## Screenshots
![Chat screenshot](https://github.com/Laevateinn17/viscord/blob/main/images/chat.png)
![Friend list screenshot](https://github.com/Laevateinn17/viscord/blob/main/images/friend-list.png)
![Server settings screenshot](https://github.com/Laevateinn17/viscord/blob/main/images/server-settings.png)
![Voice chat screenshot](https://github.com/Laevateinn17/viscord/blob/main/images/voice-chat.png)

## Features

- JWT Authentication
- Realtime chat & updates
- Realtime user presence
- Friends system
- Server & channels management with RBAC (Role-Based Access Control)
- Voice call, video call, and screen sharing using Mediasoup SFU Server
- Microservices architecture

## Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) — React-based web framework for the client app

**Backend & Services**
- [NestJS](https://nestjs.com/) — backend framework for scalable microservices
- [Traefik](https://traefik.io/) — API Gateway & reverse proxy
- [Socket.IO](https://socket.io/) — real-time WebSocket communication
- [Mediasoup](https://mediasoup.org/) — SFU for voice/video/screen sharing
- [RabbitMQ](https://www.rabbitmq.com/) — message broker for inter-service communication
- [Redis](https://redis.io/) — in-memory data store for sessions & caching
- [AWS S3](https://aws.amazon.com/s3/) — object storage for media

**Architecture**
- Microservices Architecture
- gRPC & Message Queue communication
- Containerized with Docker

# System Architecture

![Architecture Diagram](http://url/to/img.png)

All client requests pass through **Traefik API Gateway**, which routes them to the appropriate microservice.
Real-time updates are handled separately via the **WebSocket Gateway**.

### Services Overview
| Services          | Responsibility                                                      |
|-------------------|---------------------------------------------------------------------|
| Auth              | JWT generation, validation, and user authentication                 |
| User              | User profiles, friends, and friend requests                         |
| Guild             | Server, channels(and DM channels), RBAC (Role-Based Access Control) |
| Message           | Chat message related requests                                       |
| Websocket Gateway | Real-time update and user presence tracking                         |
| SFU (Media)       | WebRTC audio, video, and screen sharing                             |


## Quickstart


### Clone the repository
```bash
  git clone https://github.com/Laevateinn17/viscord.git
```


### Start backend services
Run all backend microservices, gateways, and infrastructure (Redis, RabbitMQ, etc.) with Docker:
```bash
  git clone https://github.com/Laevateinn17/viscord.git
  cd viscord
  docker compose up --build
```

### Run frontend separately
The web client must be run separately from the backend stack:
```bash
  cd web-client
  npm run dev
```
