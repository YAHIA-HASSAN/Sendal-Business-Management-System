# React + TypeScript + Vite

## Temporary JSON API

The frontend includes a small Node.js JSON API for development while the Java backend is being built. It has no additional package dependencies and stores data in `mock-api/db.json`.

Run these commands in separate terminals from the `Frontend` directory:

```sh
npm run api
npm run dev
```

Vite proxies `/api` requests to `http://localhost:3001`, so frontend requests can use relative paths such as `/api/products`.

Available resources support `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`:

`/api/users`, `/api/customers`, `/api/categories`, `/api/products`, `/api/sellingPriceHistory`, `/api/bills`, `/api/soldItems`, `/api/paymentHistory`, `/api/cashMovements`, and `/api/cashDrawers`.

Examples:

```sh
curl http://localhost:3001/api/products
curl "http://localhost:3001/api/bills?status=paid"
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"demo123\"}"
```

The demo login accepts `admin / demo123` and `noah / demo123`. This mock API is for local development only: it stores data in a JSON file and its login token does not secure the other routes. Reset `mock-api/db.json` from version control to restore the seed data.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
