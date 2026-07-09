# 1. Base image Node.js yang ringan
FROM node:20-alpine

# Install dependencies required by Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy source code
COPY . .

# 6. Generate Prisma Client
RUN npx prisma generate

# 7. Compile TypeScript to JavaScript
RUN npm run build

# 8. Expose port 4000
EXPOSE 4000

# 9. Start production server with db push and seed first
# We run ts-node directly on the seed file so it uses the container's environment DATABASE_URL (which points to postgres:5432)
# instead of package.json's npm run seed which loads the local .env file (localhost:5432).
CMD npx prisma db push && npx ts-node prisma/seed.ts && npm start
