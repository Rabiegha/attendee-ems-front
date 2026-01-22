#!/bin/bash
set -e

echo "=========================================="
echo "   🚀 Frontend Deployment Script"
echo "=========================================="

# Configuration
FRONTEND_DIR="/opt/ems-attendee/frontend"
REPO_URL="https://github.com/Rabiegha/attendee-ems-front.git"
BRANCH="main"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}[1/5] Checking if repository exists...${NC}"
if [ -d "$FRONTEND_DIR/.git" ]; then
    echo "✓ Repository exists, pulling latest changes..."
    cd "$FRONTEND_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
    git pull origin $BRANCH
else
    echo "✓ Cloning repository..."
    sudo mkdir -p "$FRONTEND_DIR"
    sudo chown -R $USER:$USER /opt/ems-attendee
    git clone -b $BRANCH "$REPO_URL" "$FRONTEND_DIR"
    cd "$FRONTEND_DIR"
fi

echo -e "${YELLOW}[2/5] Installing dependencies...${NC}"
npm ci

echo -e "${YELLOW}[3/5] Building production bundle...${NC}"
npm run build

echo -e "${YELLOW}[4/5] Copying build to Docker volume...${NC}"
# Le docker-compose monte ../frontend/dist vers /usr/share/nginx/html
# Les fichiers sont déjà au bon endroit !
echo "✓ Build files are at $FRONTEND_DIR/dist"

echo -e "${YELLOW}[5/5] Restarting Nginx...${NC}"
cd /opt/ems-attendee/backend
docker compose -f docker-compose.prod.yml restart nginx

echo ""
echo "=========================================="
echo -e "   ${GREEN}✅ Frontend deployed successfully!${NC}"
echo "=========================================="
echo ""
echo "🌐 Access your application at:"
echo "   https://attendee.fr"
echo ""
echo "📝 Build info:"
echo "   Location: $FRONTEND_DIR/dist"
echo "   Branch: $BRANCH"
echo "   API URL: https://api.attendee.fr"
