یزیل# SAS-tech platform - TODO

## Phase 1: Repository understanding
- [x] Confirm current server entrypoints and how front-end assets call backend (partial; DB/API skeleton exists in SAS-platform/*).

- [ ] Confirm current server entrypoints and how front-end assets call backend (search usage of /api endpoints).

## Phase 2: Data model
- [ ] Extend/replace SQL schema in `SAS-platform/products.sql` to support tiers, ownership states, keys.
- [ ] Add missing tables (users/subscriptions/ads/ownership/sales) to schema.

## Phase 3: Backend APIs (DB-backed)
- [ ] Add `SAS-platform/db.js` (SQLite-first) + migrations/init.
- [ ] Implement endpoints:
  - [ ] `POST /api/products/generate` (prompt + tier => create product)
  - [ ] `GET /api/products/store` (platform store)
  - [ ] `POST /api/payment/webhook` integrate DB save + activation key
  - [ ] `GET /api/products/:id/activation-key`
- [ ] Replace placeholder logic (`return true`) with DB writes for products/keys.

## Phase 4: Front-end wiring
- [ ] Update `SAS-platform/index.html`:
  - [ ] Replace fake AI responses with real API call
  - [ ] Add store UI (advert rotation section)
  - [ ] Show activation key after purchase via API response

## Phase 5: Advertising rotation
- [ ] Add `ads` table and simple rotation logic (server-side random)
- [ ] Add sponsored carousel/sections in store.

## Phase 6: Manual testing
- [ ] Run server and test generate -> store -> webhook -> key -> copy.
- [ ] Smoke test role/tier restrictions (Gold for 3D/game; Silver for app/finance).

