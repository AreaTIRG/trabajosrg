# Multi-stage Dockerfile for Puestos Application
# This builds both backend and frontend into a single image

# ==========================================
# Stage 1: Build Frontend
# ==========================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci --silent

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Backend
# ==========================================
FROM python:3.12-slim AS backend-build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY backend/requirements.txt /tmp/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /tmp/requirements.txt

# ==========================================
# Stage 3: Production Image
# ==========================================
FROM python:3.12-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set up Python environment
COPY --from=backend-build /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory for backend
WORKDIR /app

# Copy backend code
COPY --chown=appuser:appuser backend/app ./app

# Create uploads directory and nginx directories with proper permissions
RUN mkdir -p /app/uploads && chown -R appuser:appuser /app && \
    mkdir -p /var/lib/nginx/body /var/lib/nginx/proxy /var/lib/nginx/fastcgi /var/lib/nginx/uwsgi /var/lib/nginx/scgi && \
    chown -R www-data:www-data /var/lib/nginx && \
    chmod 755 /var/lib/nginx && \
    chmod 755 /var/lib/nginx/body && \
    mkdir -p /var/log/nginx && chown -R www-data:www-data /var/log/nginx && \
    mkdir -p /var/run && chown -R www-data:www-data /var/run && \
    touch /var/run/nginx.pid && chown www-data:www-data /var/run/nginx.pid

# Copy built frontend to nginx html directory
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Create nginx configuration for single-container setup
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    # Root directory
    root /usr/share/nginx/html;
    index index.html;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Proxy API requests to backend on localhost
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Proxy uploads to backend on localhost
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Handle /admin route for React Router
    location /admin {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Handle client-side routing - must be last
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -e

# Function to cleanup processes on exit
cleanup() {
    echo "Shutting down..."
    kill -TERM "$backend_pid" 2>/dev/null || true
    nginx -s quit 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# Ensure nginx directories have correct permissions
chown -R www-data:www-data /var/lib/nginx /var/log/nginx /var/run/nginx.pid 2>/dev/null || true

# Start nginx in background
nginx

# Start backend with uvicorn as appuser
su -s /bin/bash -c "cd /app && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4" appuser &
backend_pid=$!

# Wait for backend process
wait "$backend_pid"
EOF

RUN chmod +x /app/start.sh

# Note: Running as root is required for nginx to bind to port 80
# The backend runs as appuser via the start script

# Expose ports
EXPOSE 80 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ && curl -f http://localhost:8000/health || exit 1

# Start both services
CMD ["/app/start.sh"]
