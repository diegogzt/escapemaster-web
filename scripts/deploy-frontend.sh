#!/bin/bash
# Deploy Frontend to GHCR and update Dokploy service
# Usage:
#   GHCR_PAT=your_ghcr_pat ./deploy-frontend.sh [api_url]
#   GHCR_PAT=your_ghcr_pat ./deploy-frontend.sh https://my.escapemaster.es/api/v1  # production
#   GHCR_PAT=your_ghcr_pat ./deploy-frontend.sh https://my.escapemaster.es/api/v2  # development
set -e

API_URL="${1:-https://my.escapemaster.es/api/v1}"
TAG=$(git rev-parse --short HEAD)
IMAGE="ghcr.io/dgtovar/escapemaster-frontend:$TAG"
GHCR_PAT="${GHCR_PAT:-}"

if [ -z "$GHCR_PAT" ]; then
  echo "Error: GHCR_PAT environment variable is required"
  echo "  GHCR_PAT=your_pat ./deploy-frontend.sh [api_url]"
  exit 1
fi

echo "$GHCR_PAT" | docker login ghcr.io -u dgtovar --password-stdin

echo "=============================================="
echo "  Deploying Frontend to GHCR"
echo "=============================================="
echo "  API URL:  $API_URL"
echo "  Image:    $IMAGE"
echo "  Time:     $(date)"
echo "=============================================="

# Build with build args baked in
echo ""
echo "[1/3] Building Docker image..."
docker build -f Dockerfile.production \
  -t "$IMAGE" \
  --build-arg NEXT_PUBLIC_API_URL="$API_URL" \
  --build-arg NEXT_PUBLIC_APP_URL="https://my.escapemaster.es" \
  .

echo ""
echo "[2/3] Pushing to GHCR..."
docker push "$IMAGE"

echo ""
echo "[3/3] Updating Swarm service..."
docker service update \
  --image "$IMAGE" \
  manager-frontend-erhb6r

echo ""
echo "=============================================="
echo "  Deployed successfully!"
echo "  Image: $IMAGE"
echo "  Service: manager-frontend-erhb6r"
echo "=============================================="
echo ""
echo "To verify:"
echo "  curl -s -o /dev/null -w '%{http_code}' https://my.escapemaster.es/"
echo ""