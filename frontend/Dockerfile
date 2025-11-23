FROM node:20-alpine

WORKDIR /app

# Install Playwright dependencies for Alpine Linux
# Note: PlaywrightのダウンロードしたChromiumを使うため、システムChromiumは不要
RUN apk add --no-cache \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    glib \
    libgcc \
    libstdc++ \
    libx11 \
    libxcomposite \
    libxdamage \
    libxext \
    libxfixes \
    libxrandr \
    mesa \
    alsa-lib \
    libxcb \
    libxkbcommon \
    libdrm \
    libxshmfence

# PlaywrightのダウンロードしたChromiumを使用
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

CMD ["npm", "run", "dev"]

