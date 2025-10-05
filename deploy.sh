#!/bin/bash

# FROST-CHAIN Docker Deployment Script
# This script automates the Docker deployment process

set -e

echo "🚀 FROST-CHAIN Docker Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Check if docker-compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed."
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Check if required ports are available
check_ports() {
    print_status "Checking port availability..."
    
    # Check port 3000
    if netstat -an | grep -q ":3000"; then
        print_warning "Port 3000 is in use. The frontend might conflict."
    fi
    
    # Check port 8545
    if netstat -an | grep -q ":8545"; then
        print_warning "Port 8545 is in use. The blockchain node might conflict."
    fi
    
    print_success "Port check completed"
}

# Build and start services
deploy_services() {
    print_status "Building and starting FROST-CHAIN services..."
    
    # Copy environment file
    if [ -f ".env.docker" ]; then
        cp .env.docker .env
        print_success "Environment configuration loaded"
    else
        print_warning "No .env.docker file found, using defaults"
    fi
    
    # Build and start services
    print_status "Building Docker images..."
    docker-compose build
    
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Services started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for blockchain
    print_status "Waiting for blockchain node..."
    timeout=120
    counter=0
    
    while [ $counter -lt $timeout ]; do
        if curl -s http://localhost:8545 > /dev/null 2>&1; then
            print_success "Blockchain node is ready"
            break
        fi
        
        sleep 2
        counter=$((counter + 2))
        
        if [ $counter -ge $timeout ]; then
            print_error "Timeout waiting for blockchain node"
            exit 1
        fi
    done
    
    # Wait for frontend
    print_status "Waiting for frontend..."
    counter=0
    
    while [ $counter -lt $timeout ]; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend is ready"
            break
        fi
        
        sleep 2
        counter=$((counter + 2))
        
        if [ $counter -ge $timeout ]; then
            print_error "Timeout waiting for frontend"
            exit 1
        fi
    done
}

# Display deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    docker-compose ps
    echo ""
    
    print_success "🎉 FROST-CHAIN is now running!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "⛓️  Blockchain RPC: http://localhost:8545"
    echo ""
    echo "📖 Setup MetaMask:"
    echo "   - Network: Custom RPC"
    echo "   - RPC URL: http://localhost:8545"
    echo "   - Chain ID: 31337"
    echo "   - Currency: ETH"
    echo ""
    echo "🔧 Useful commands:"
    echo "   - View logs: docker-compose logs"
    echo "   - Stop services: docker-compose down"
    echo "   - Restart: docker-compose restart"
    echo ""
}

# Cleanup function for graceful exit
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Deployment failed. Cleaning up..."
        docker-compose down
    fi
}

trap cleanup EXIT

# Main execution
main() {
    echo ""
    check_docker
    check_docker_compose
    check_ports
    echo ""
    
    deploy_services
    echo ""
    
    wait_for_services
    echo ""
    
    show_status
}

# Help function
show_help() {
    echo "FROST-CHAIN Docker Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  help, -h, --help    Show this help message"
    echo "  logs               Show service logs"
    echo "  stop               Stop all services"
    echo "  restart            Restart all services"
    echo "  status             Show service status"
    echo "  clean              Stop and remove all containers"
    echo ""
    echo "Examples:"
    echo "  $0                 Deploy FROST-CHAIN"
    echo "  $0 logs            View logs"
    echo "  $0 stop            Stop services"
    echo ""
}

# Handle command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        show_help
        exit 0
        ;;
    "logs")
        docker-compose logs -f
        exit 0
        ;;
    "stop")
        print_status "Stopping FROST-CHAIN services..."
        docker-compose down
        print_success "Services stopped"
        exit 0
        ;;
    "restart")
        print_status "Restarting FROST-CHAIN services..."
        docker-compose restart
        print_success "Services restarted"
        exit 0
        ;;
    "status")
        docker-compose ps
        exit 0
        ;;
    "clean")
        print_status "Cleaning up FROST-CHAIN deployment..."
        docker-compose down -v --remove-orphans
        print_success "Cleanup completed"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
