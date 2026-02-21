# VPS Deployment Guide

This guide describes how to deploy the Baxtli Men application to a VPS (Ubuntu/Debian) using Docker and Nginx for maximum performance.

## Prerequisites

- A VPS with Ubuntu 20.04+ (e.g., DigitalOcean, Hetzner, AWS)
- Domain pointing to VPS IP
- Docker & Docker Compose installed

## 1. Prepare Environment

SSH into your server and clone the repository or upload your files.

```bash
# Example
git clone https://github.com/your-username/baxtli-men.git /var/www/baxtli-men
cd /var/www/baxtli-men
```

Create a `.env.production` file with your production variables:
```bash
DATABASE_URL="postgres://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://baxtli-men.uz"
```

## 2. Docker Compose Setup

Create a `docker-compose.yml` file in the root:

```yaml
version: '3'

services:
  nextjs:
    build: .
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env.production

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - nextjs
```

## 3. SSL Configuration (Let's Encrypt)

For the first run to get certificates:

1. Modifiy `nginx.conf` temporarily to allow `.well-known` challenge (simplest way is to use certbot directly first, or uncomment the HTTP block).
2. Run Certbot to generate certificates:
   ```bash
   docker run -it --rm --name certbot \
     -v "$PWD/certbot/conf:/etc/letsencrypt" \
     -v "$PWD/certbot/www:/var/www/certbot" \
     certbot/certbot certonly --webroot -w /var/www/certbot \
     -d baxtli-men.uz -d www.baxtli-men.uz
   ```

3. Update `nginx.conf` to enable SSL (uncomment 443 block if added later).

## 4. Deploy

Build and start the containers:

```bash
docker-compose up -d --build
```

Check logs:
```bash
docker-compose logs -f
```

## 5. Maintenance

To update the application:
```bash
git pull
docker-compose up -d --build
```
