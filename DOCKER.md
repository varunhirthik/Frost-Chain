# FROST-CHAIN Docker Deployment Guide

This guide provides instructions for running the FROST-CHAIN application using Docker containers.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v3.8 or higher
- At least 4GB of available RAM
- Ports 3000 and 8545 available on your host machine

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd C:\New-projs\Frost-chain
   ```

2. **Start the application stack:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Blockchain RPC: http://localhost:8545

## Services Overview

### 1. Blockchain Service
- **Container:** `frost-chain-blockchain`
- **Port:** 8545
- **Purpose:** Runs Hardhat local blockchain node
- **Health Check:** HTTP ping to RPC endpoint

### 2. Contract Deployer Service
- **Container:** `frost-chain-deployer`
- **Purpose:** Deploys smart contracts to the blockchain
- **Lifecycle:** Runs once then exits
- **Dependencies:** Waits for blockchain to be healthy

### 3. Frontend Service
- **Container:** `frost-chain-frontend`
- **Port:** 3000
- **Purpose:** Serves the React application
- **Dependencies:** Waits for contract deployment

## Detailed Commands

### Start Services
```bash
# Start all services in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up blockchain
```

### Monitor Services
```bash
# View all service logs
docker-compose logs

# Follow logs for specific service
docker-compose logs -f frontend

# Check service status
docker-compose ps
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop frontend
```

### Rebuild Services
```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build frontend

# Rebuild and restart
docker-compose up --build
```

## Environment Configuration

The application uses `.env.docker` for environment variables:

```env
# Blockchain Configuration
BLOCKCHAIN_PORT=8545
BLOCKCHAIN_NETWORK_ID=31337

# Frontend Configuration
FRONTEND_PORT=3000
REACT_APP_BLOCKCHAIN_URL=http://localhost:8545
REACT_APP_NETWORK_ID=31337

# Development Configuration
NODE_ENV=development
```

## MetaMask Configuration

To connect MetaMask to the dockerized blockchain:

1. **Add Custom Network:**
   - Network Name: FROST-CHAIN Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. **Import Test Accounts:**
   - Use the private keys from Hardhat's default accounts
   - Each account has 10,000 ETH for testing

## Volumes and Data Persistence

- **blockchain_data:** Stores deployment artifacts and blockchain state
- **Contract deployments:** Shared between blockchain and frontend services

## Troubleshooting

### Service Won't Start
```bash
# Check service logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Rebuild if needed
docker-compose up --build [service-name]
```

### Port Conflicts
If ports 3000 or 8545 are in use:

1. **Modify docker-compose.yml:**
   ```yaml
   ports:
     - "3001:80"  # Change frontend port
     - "8546:8545"  # Change blockchain port
   ```

2. **Update .env.docker:**
   ```env
   FRONTEND_PORT=3001
   BLOCKCHAIN_PORT=8546
   ```

### Container Health Issues
```bash
# Check container health
docker-compose ps

# Inspect specific container
docker inspect frost-chain-blockchain

# Access container shell
docker-compose exec blockchain sh
```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

## Development Workflow

### Making Code Changes

1. **Smart Contracts:**
   ```bash
   # Rebuild blockchain service
   docker-compose build blockchain deployer
   docker-compose up -d blockchain deployer
   ```

2. **Frontend:**
   ```bash
   # Rebuild frontend service
   docker-compose build frontend
   docker-compose up -d frontend
   ```

### Viewing Contract Deployment
```bash
# Check deployer logs
docker-compose logs deployer

# View deployment artifacts
docker-compose exec blockchain ls -la deployments/localhost/
```

## Production Considerations

For production deployment:

1. **Update environment variables**
2. **Use external blockchain network**
3. **Configure proper security headers**
4. **Set up SSL/TLS certificates**
5. **Configure monitoring and logging**

## Network Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │   Blockchain    │    │    Deployer     │
│   (Port 3000)   │◄──►│   (Port 8545)   │◄──►│   (One-time)    │
│                 │    │                 │    │                 │
│  React App      │    │  Hardhat Node   │    │ Contract Deploy │
│  Nginx Server   │    │  Smart Contract │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ frost-chain-net │
                    │   (Bridge)      │
                    └─────────────────┘
```

## Support

For issues or questions:
1. Check service logs: `docker-compose logs`
2. Verify all services are healthy: `docker-compose ps`
3. Review this documentation
4. Check the main README.md for application-specific guidance
