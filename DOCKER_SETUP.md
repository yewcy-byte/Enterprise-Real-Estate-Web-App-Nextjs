# Docker Setup Guide - Real Estate Web App

This guide will help you run the entire Real Estate Web App (Next.js client + Node.js server + PostgreSQL) using Docker on any device.

## Prerequisites

Before you start, ensure you have:
- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)
- The project repository cloned to your local machine

## Quick Start (5 minutes)

### 1. Prepare Environment Variables

Copy the `.env.docker` file and customize it if needed:

```bash
# Linux/Mac
cp .env.docker .env.local

# Windows (PowerShell)
Copy-Item .env.docker .env.local
```

Edit `.env.local` with your actual values:
```env
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=real_estate_db
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:5000
PORT=5000
```

### 2. Start the Application

```bash
# Start all services (database, server, client)
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

That's it! Your app will be available at:
- **Client (Next.js)**: http://localhost:3000
- **Server (API)**: http://localhost:5000
- **Database**: localhost:5432

### 3. Initialize the Database (First Time Only)

```bash
# Run migrations
docker-compose exec server npx prisma migrate deploy

# Seed the database (if you have a seed script)
docker-compose exec server npm run seed
```

## Detailed Commands

### View Running Containers

```bash
docker-compose ps
```

### View Application Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f postgres
```

### Stop the Application

```bash
# Stop without removing containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (including database!)
docker-compose down -v
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart server
docker-compose restart client
```

### Rebuild Containers

```bash
# Rebuild all containers
docker-compose up -d --build

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands in Containers

```bash
# Install packages in server
docker-compose exec server npm install <package_name>

# Run Prisma commands
docker-compose exec server npx prisma generate
docker-compose exec server npx prisma migrate dev --name <migration_name>

# Access database shell
docker-compose exec postgres psql -U postgres -d real_estate_db
```

## Development Workflow

### Hot Reload Configuration

The docker-compose.yml includes volume mounts for development:

```yaml
volumes:
  - ./server/src:/app/server/src          # Server source code
  - ./server/prisma:/app/server/prisma    # Prisma schema
  - ./client/src:/app/client/src          # Client source code
  - ./client/public:/app/client/public    # Client assets
```

This means:
- Changes to client code auto-reload in the browser
- Changes to server code require a service restart (for now)
- Prisma schema changes require rebuilding

### Rebuild After Making Code Changes

If code changes don't reflect:

```bash
docker-compose up -d --build
```

## Environment Variables

### For Development (`.env.docker`)

The `.env.docker` file contains default values for Docker. Customize before running:

```env
DB_USER=postgres                          # Database user
DB_PASSWORD=postgres                      # Database password (change this!)
DB_NAME=real_estate_db                    # Database name
NODE_ENV=production                       # Set to 'development' for debug logging
NEXT_PUBLIC_API_URL=http://localhost:5000 # API endpoint for client
PORT=5000                                 # Server port
```

### Additional Environment Variables

Add any other required variables to `.env.local`:

```env
# Mapbox
MAPBOX_TOKEN=your_token_here

# AWS
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Supabase
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors, change the ports in `docker-compose.yml`:

```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Changed from 5432 to 5433
  
  server:
    ports:
      - "5001:5000"  # Changed from 5000 to 5001
  
  client:
    ports:
      - "3001:3000"  # Changed from 3000 to 3001
```

### Database Connection Failed

```bash
# Check postgres is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Server Can't Connect to Database

```bash
# Check the DATABASE_URL environment variable
docker-compose exec server env | grep DATABASE_URL

# Test database connection
docker-compose exec server pg_isready -h postgres -p 5432
```

### Changes Not Reflected

```bash
# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

## Backing Up and Restoring Data

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres real_estate_db > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U postgres real_estate_db < backup.sql
```

## Performance Tips

### Limit Container Memory (if needed)

Edit `docker-compose.yml`:

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          memory: 512M
    
  client:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Use Production Mode

In `.env.local`:

```env
NODE_ENV=production  # Faster, smaller footprint
```

## Next Steps on Another Device

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <project-directory>
   ```

2. **Copy Docker files** (they should be in the repo already)
   - `Dockerfile.client`
   - `Dockerfile.server`
   - `docker-compose.yml`
   - `.dockerignore.client` → rename to `.dockerignore` in client folder
   - `.dockerignore.server` → rename to `.dockerignore` in server folder

3. **Set up environment**
   ```bash
   cp .env.docker .env.local
   # Edit .env.local with appropriate values
   ```

4. **Start the stack**
   ```bash
   docker-compose up -d
   ```

5. **Initialize database**
   ```bash
   docker-compose exec server npx prisma migrate deploy
   docker-compose exec server npm run seed
   ```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment/docker)
- [Prisma with Docker](https://www.prisma.io/docs/orm/overview/databases/postgresql#using-docker)

## Support

If you encounter issues:
1. Check `docker-compose logs -f` for error messages
2. Verify all ports are available
3. Ensure Docker Desktop is running
4. Try rebuilding: `docker-compose up -d --build`
