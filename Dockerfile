FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN apt-get update && apt-get install -y \
    nodejs \
    npm

WORKDIR /app

COPY backend/ ./backend/

WORKDIR /app/backend

RUN pip install --no-cache-dir -r requirements.txt
RUN npm install

RUN mkdir -p uploads
RUN mkdir -p predictions_web

EXPOSE 10000

CMD ["npm", "start"]