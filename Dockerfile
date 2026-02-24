# --- Build aşaması ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build sırasında API adresi nginx proxy üzerinden / olacak
ARG VITE_API_ROOT=""
ENV VITE_API_ROOT=$VITE_API_ROOT

RUN npm run build

# --- Production aşaması (Nginx) ---
FROM nginx:alpine

# Özel nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build çıktısını nginx'e kopyala
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
