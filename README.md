# KnowHowEditor

## Deploy client

Local production build:
```bash
npm run build
```

Copy contents of the `dist` folder to `html/knowhow-editor`.

# Deploy server

Local production build:
```bash
npm run build
```

Copy the `dist` folder and the files `package.json` and `package-lock.json` to `/opt/knowhow-api`.

Run npm on the server:
```bash
npm ci --omit=dev
```

Run the server:
```bash
node dist/index.js
```
