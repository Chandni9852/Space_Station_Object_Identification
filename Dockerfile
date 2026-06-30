# ---------- Base Image ----------
FROM python:3.11

# Install Node.js
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r backend/requirements.txt

WORKDIR /app/backend

RUN npm install

EXPOSE 10000

ENV PORT=10000

CMD ["npm","start"]