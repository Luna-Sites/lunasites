#!/bin/sh
set -e

echo "🚀 Starting LunaSites frontend with RAZZLE_API_PATH=$RAZZLE_API_PATH"

# Verifică dacă există build-ul
if [ ! -f build/index.html ]; then
    echo "📦 No build found. Building Volto with current RAZZLE_API_PATH..."
    
    # Setează variabila pentru build
    export RAZZLE_API_PATH=${RAZZLE_API_PATH:-"http://localhost:8080/Plone"}
    
    echo "🔧 Building with RAZZLE_API_PATH=$RAZZLE_API_PATH"
    VOLTOCONFIG=$(pwd)/volto.config.js pnpm --filter @plone/volto build
    
    echo "✅ Build completed successfully"
else
    echo "📋 Using existing build"
fi

echo "🎯 Starting production server..."
exec pnpm --filter @plone/volto start:prod