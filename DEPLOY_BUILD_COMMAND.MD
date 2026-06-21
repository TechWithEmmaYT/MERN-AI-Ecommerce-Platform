npm ci --production=false --prefix client && npm run build --prefix client && npm ci --production=false --prefix backend && npm run build --prefix backend


npm install --production=false --prefix client && npm run build --prefix client && npm install --production=false --prefix backend && npm run build --prefix backend

node backend/dist/index.js