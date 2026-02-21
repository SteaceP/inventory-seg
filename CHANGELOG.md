## [1.3.1](https://github.com/SteaceP/inventory-seg/compare/v1.3.0...v1.3.1) (2026-02-21)


### Bug Fixes

* add cache control headers and implement vite preload error handler for automatic page reload ([69a4ddb](https://github.com/SteaceP/inventory-seg/commit/69a4ddb0c2bf05c55e855b9ab6750b1d10cce0ab))
* **ci:** add R2_BUCKET_NAME env var to workflows ([19a5a01](https://github.com/SteaceP/inventory-seg/commit/19a5a014c4b3d45ff18077021c747277b3442a00))
* **ci:** downgrade actions to v4 and fix env var usage ([2d8ae82](https://github.com/SteaceP/inventory-seg/commit/2d8ae823eedabc98522fb6ce1261b15da59b5700))
* improve test stability by mocking document createRange and turnstile, and awaiting async operations in tests ([ef85042](https://github.com/SteaceP/inventory-seg/commit/ef8504205ffcbdf6bc8ea8f0572fdbdd23caed07))


### Features

* add created_at and id fields to profiles database types ([d20a2c2](https://github.com/SteaceP/inventory-seg/commit/d20a2c207e967a16e61f350c02499092ae5dc84b))
* add loading indicator to save button, validate inventory stock locations, and show success message on save ([1216693](https://github.com/SteaceP/inventory-seg/commit/1216693b822779d7552cda898cdb0fb1ac854a19))
* add react-markdown dependency and update various package versions ([5890c08](https://github.com/SteaceP/inventory-seg/commit/5890c08b7ec08e511939524800c02ac10b2626a9))
* add unique constraint to inventory_stock_locations table for inventory_id and location ([adfc034](https://github.com/SteaceP/inventory-seg/commit/adfc0340e7cafdd781ab4485632858f1b6083641))
* add user bottom navigation and refactor UserContext into UserProvider and UserContextDefinition ([2e8b2e7](https://github.com/SteaceP/inventory-seg/commit/2e8b2e768bfbeaf761977dac426ababaf366e0b2))
* create new user creation trigger and function to populate user settings ([c278e72](https://github.com/SteaceP/inventory-seg/commit/c278e729373e1b1a902ae8e4a3c984b4bcc47f1b))
* introduce app.menuTitle translation key and use it in sidebar and mobile app bar components ([0bfc615](https://github.com/SteaceP/inventory-seg/commit/0bfc615ce987670b9cda083a5df3fbb293116c6a))
* introduce voice assistant with audio input/output and AI processing ([fd9a990](https://github.com/SteaceP/inventory-seg/commit/fd9a990a3cc4a19b6268b82074b116b9ea01c370))
* offload image uploads to cloudflare worker using r2 storage ([8bffd43](https://github.com/SteaceP/inventory-seg/commit/8bffd4362e40cfbc7087e68a5a0e17a376ca3ed6))
* refine inventory card styling, add markdown notes support, and remove SKU display ([fd585a6](https://github.com/SteaceP/inventory-seg/commit/fd585a6c3d509efd5a88799992597a805f1602c7))
* update CSP and Permissions-Policy to allow new data source and microphone access ([836d4e8](https://github.com/SteaceP/inventory-seg/commit/836d4e80ef3592aeb68d3a30efa5894a06b5b73e))

# [1.3.0](https://github.com/SteaceP/inventory-seg/compare/v1.2.0...v1.3.0) (2026-02-17)


### Bug Fixes

* untrack auto-generated package.json and pnpm-lock.yaml and sync updates to template ([de98d56](https://github.com/SteaceP/inventory-seg/commit/de98d5649bb0d6f849b6e8fd303b4c3145b52a26))


### Features

* add inventory seed data and fix inventory stock total trigger type casting ([c3b79ea](https://github.com/SteaceP/inventory-seg/commit/c3b79ea16cdb2d6dbec5c730410ef00d7d908f33))
* add signup error message translation ([5addc85](https://github.com/SteaceP/inventory-seg/commit/5addc85d992f89bdb72d21da49af3e4eebb94207))

# [1.2.0](https://github.com/SteaceP/inventory-seg/compare/v1.1.0...v1.2.0) (2026-02-17)


### Features

* derive low stock filter state directly from URL search parameters instead of internal state ([1839011](https://github.com/SteaceP/inventory-seg/commit/1839011618fd638415772e7431d9b5d5c1c3c941))

# [1.1.0](https://github.com/SteaceP/inventory-seg/compare/v1.0.0...v1.1.0) (2026-02-17)


### Bug Fixes

* adjust mobile layout and headers to respect safe area insets ([2094c37](https://github.com/SteaceP/inventory-seg/commit/2094c373d617c8179d59c75b68619db5523f1de3))
* prevent loading screen from showing on authentication pages ([914515f](https://github.com/SteaceP/inventory-seg/commit/914515f4cb0237e2b70407ef01dcf441963dc4f7))


### Features

* add local postgres and d1 database setup for e2e tests in ci workflow ([81edd91](https://github.com/SteaceP/inventory-seg/commit/81edd91380e395a92e781ba3c943b4ec85ba49cc))
* configure project for playwright and ci testing by adjusting environment variables and disabling https ([4afc276](https://github.com/SteaceP/inventory-seg/commit/4afc2762c25a4c333ff2214f6288fc44f0f3670e))
* dynamically configure AI remote binding and enhance wrangler config generation with schema and boolean handling ([96daa12](https://github.com/SteaceP/inventory-seg/commit/96daa120c59485f3bd4a8e559e8c82d7b1fce25a))
* handle and test cases where MFA is required but no factors are enrolled during login ([c2188de](https://github.com/SteaceP/inventory-seg/commit/c2188de444f77ccc9ebd5800506a1ff8e288fc5b))
* implement comprehensive e2e testing with playwright and refine inventory empty states ([e029426](https://github.com/SteaceP/inventory-seg/commit/e029426156b6a7e63b93502f8a5dd5fd8da26271))
* implement multi-factor authentication flow for login and refactor auth forms to accept an onSubmit prop ([fa5a3e7](https://github.com/SteaceP/inventory-seg/commit/fa5a3e73554d1003f6d2eb55b890ff2037a649ce))
* implement wrangler.toml configuration and add deploy preview workflow ([ebed7e2](https://github.com/SteaceP/inventory-seg/commit/ebed7e2b8c049818b97510996a9556661bf8fe41))
* introduce playwright for end-to-end testing and refactor unit test mocks for supabase ([de7e4d5](https://github.com/SteaceP/inventory-seg/commit/de7e4d51b8d1ddbb150aa10cff7c062a707bc726))
* introduce user context and refactor e2e tests to use semantic locators and updated conventions ([b6b8057](https://github.com/SteaceP/inventory-seg/commit/b6b8057ab0708928e86283729eaf2e21b86ef035))
* **inventory-scanner:** add camera switching functionality to inventory scanner ([4198c92](https://github.com/SteaceP/inventory-seg/commit/4198c9269200820ef8b65c0788d8eb77d4a9e206))

# 1.0.0 (2026-02-09)


### Bug Fixes

* added some missing entry in wrangler.json ([c31f0f9](https://github.com/SteaceP/inventory-seg/commit/c31f0f9fa99b68e221d5ae10b02f2653b79f86e3))
* added sql queries to fix supabase warnings ([966416f](https://github.com/SteaceP/inventory-seg/commit/966416fd874ac560846d52617da7bba8123d7c1d))
* barcode print functionality ([d8e0106](https://github.com/SteaceP/inventory-seg/commit/d8e0106981d45aed0f543442420516fe1eceae70))
* build errors ([8f82648](https://github.com/SteaceP/inventory-seg/commit/8f826482db114b62e3e208658af929727f6f282b))
* **build:** separate worker tsconfig and resolve lint errors ([7f6b176](https://github.com/SteaceP/inventory-seg/commit/7f6b17644e3ec683d4ba89bab67ca9e4c968818a))
* **ci:** handle empty env vars in config script and standardize infrastructure ids in workflows ([b486d94](https://github.com/SteaceP/inventory-seg/commit/b486d94054a5e1de13b33d061737a883d0c370d2))
* cloudflare build ([fbe7dc4](https://github.com/SteaceP/inventory-seg/commit/fbe7dc4651bd18453829c9f6f2adca489ec92c3c))
* cloudflare redirect ([5847b34](https://github.com/SteaceP/inventory-seg/commit/5847b34cba9f4bad9d87920e1ae95794a7bb08a2))
* cloudflare routing ([49d91ce](https://github.com/SteaceP/inventory-seg/commit/49d91ce9c489b50e3424da4acd8c93501b380d50))
* consolidate sql files ([67601d0](https://github.com/SteaceP/inventory-seg/commit/67601d078266f7ca49e43aa5aeca220c3376576c))
* Corrected `justify` CSS property to `justifyContent` in SidebarHeader and adjusted UserProfile layout for collapsed state. ([763a559](https://github.com/SteaceP/inventory-seg/commit/763a559217587dd61e26c2175f674b8b0c0e4e9e))
* dashboard feed names ([2ec3b71](https://github.com/SteaceP/inventory-seg/commit/2ec3b710d92d58063f2ded98851e99f2e5cf8aff))
* Ensure login and signup pages correctly fill the dynamic viewport height and prevent overflow. ([deb9543](https://github.com/SteaceP/inventory-seg/commit/deb9543ca58978b66a564de09ed13a7e08d6dcd3))
* grid syntax ([9a0390c](https://github.com/SteaceP/inventory-seg/commit/9a0390c14ffd2c66b77e5ee209610c636dc72422))
* grid syntax again ([64d97d3](https://github.com/SteaceP/inventory-seg/commit/64d97d3f52ee41c16a95fe17499201fb15b7acc4))
* hallucination ([cf2e8cb](https://github.com/SteaceP/inventory-seg/commit/cf2e8cb521fef17432e665b6114653b5f19fdde7))
* implement location-aware redirects and resolve Cloudflare loop ([9f9036f](https://github.com/SteaceP/inventory-seg/commit/9f9036ff96c1dff35d8ee3c53f87786c87191c02))
* low stock email alert ([4088a8c](https://github.com/SteaceP/inventory-seg/commit/4088a8c84e122e68d176621e4e35317fc3967b46))
* Migrate push subscription unique constraint to use endpoint column and update application logic accordingly. ([3457f0f](https://github.com/SteaceP/inventory-seg/commit/3457f0f0f4769f57c6960a2e36172217707cb1f6))
* minified bundle size, add sanitizing ([0a21253](https://github.com/SteaceP/inventory-seg/commit/0a2125374adfed89c9c86b36307da9bc738af8f3))
* Override `node-domexception` with a local wrapper using `global.DOMException` to suppress deprecation warnings. ([69b33b9](https://github.com/SteaceP/inventory-seg/commit/69b33b9f06495cfffde86e5023f14cf2f67f9f37))
* Prevent React `act` warnings in tests and refactor file input placement in components. ([4eddff9](https://github.com/SteaceP/inventory-seg/commit/4eddff900fe311de8c02656a20112874417987d0))
* prod build was failing ([664f956](https://github.com/SteaceP/inventory-seg/commit/664f9568448a3269b55dbcaf4af5775d98e0384c))
* push notification subscription, synchronize database state with browser, and add localized error messages for various issues. ([cd90898](https://github.com/SteaceP/inventory-seg/commit/cd90898800e195ce9bfe4d95175ace28b6d5468c))
* React hooks deps ([805a7c8](https://github.com/SteaceP/inventory-seg/commit/805a7c81347f9effaa21e689eb42120b02c18733))
* remove invalid labels from dependabot.yml ([480aa28](https://github.com/SteaceP/inventory-seg/commit/480aa280d79acef7161244ca65d90dd7c2c59c9e))
* Remove local override for `node-domexception` that suppressed `DOMException` deprecation warnings. ([27ea990](https://github.com/SteaceP/inventory-seg/commit/27ea99085774e6010318de3b3dffd75c2fb09f24))
* remove redundant script in index.html with invalid import.meta usage ([5282183](https://github.com/SteaceP/inventory-seg/commit/5282183c722cbb57dddacf466cfc59d236e34954))
* removed leftovers ([89397c3](https://github.com/SteaceP/inventory-seg/commit/89397c31281af879d3588b6e8b356afaaca7c04b))
* Resolve build errors, update test setup, and add testing guidelines. ([bda84a6](https://github.com/SteaceP/inventory-seg/commit/bda84a617a9ae444e6e354c4f855a473c52afc50))
* Resolve various TypeScript compilation errors and adjust Supabase template formatting. ([fcc3c68](https://github.com/SteaceP/inventory-seg/commit/fcc3c68707d3349dde2038d1b7176e42ceffdfba))
* responsiveness for phones and tablets ([85177a8](https://github.com/SteaceP/inventory-seg/commit/85177a811ebbcf51c8bb618f30486b667348d56d))
* responsiveness for tablets and phones ([9bd4f2a](https://github.com/SteaceP/inventory-seg/commit/9bd4f2a82babe7256df181f35de39101af2b9cb8))
* security audit remediation and code quality improvements ([4cd613d](https://github.com/SteaceP/inventory-seg/commit/4cd613daa7983d6e21c9bdec9bb0572c09073e7c))
* test notifications should work with web push ([39f3a76](https://github.com/SteaceP/inventory-seg/commit/39f3a7652f1f8dd95022e6a5e87856d3f75e5098))
* typo ([46d230c](https://github.com/SteaceP/inventory-seg/commit/46d230cf700224be324fe356c8e1cef9d6f43770))
* ui fix ([2c69736](https://github.com/SteaceP/inventory-seg/commit/2c69736698f2df423ad8fc4607b533399ee6e51f))


### Features

*  overhauled app design to reflect branding ([720a82b](https://github.com/SteaceP/inventory-seg/commit/720a82ba3d126a37895fd7fc061ac1fa08d78f0a))
* Add "Add Inventory" functionality to the Dashboard with a new dialog and integrate it into Quick Actions. ([561574f](https://github.com/SteaceP/inventory-seg/commit/561574f71e25465b077e0eeae1a91f33ffc7d28c))
* Add "cancel" translation key to appliance-related locales. ([08a67c8](https://github.com/SteaceP/inventory-seg/commit/08a67c84e6afea025c73be4189bc0fec322baa34))
* Add `id` and `name` attributes to various form controls for improved accessibility and form handling. ([3ad7754](https://github.com/SteaceP/inventory-seg/commit/3ad7754c2adb5bf0eba74dcdb5a63da1fbcf0b28))
* Add `password_failed_verification_attempts` table and `hook_password_verification_attempt` function types. ([fc1a6f6](https://github.com/SteaceP/inventory-seg/commit/fc1a6f612b8ffe55fc3ba66fb28452b0588d8839))
* Add `useRef` for stable user ID tracking in UserContext and ensure 200 OK status for `index.html` fallbacks in the worker. ([fabb676](https://github.com/SteaceP/inventory-seg/commit/fabb6760844f0b3edb0c6e3b0b6412e773264fa8))
* add Appliances page and integrate appliance management features ([e1f5d21](https://github.com/SteaceP/inventory-seg/commit/e1f5d210d50724917a6ead1d49563ffcc0cad69c))
* Add basic SSL plugin to Vite configuration. ([524f0d7](https://github.com/SteaceP/inventory-seg/commit/524f0d7d378f62e245725ad485d0cc5c1727baf8))
* add Cloudflare challenges to Content-Security-Policy for script and frame sources. ([5d170d0](https://github.com/SteaceP/inventory-seg/commit/5d170d0cf695fb9e501b94a28bce058dc1be6243))
* Add Cloudflare Worker for low stock email alerts via Brevo and configure its entry point. ([8c0d4cc](https://github.com/SteaceP/inventory-seg/commit/8c0d4cc578721a99036548f39b9e3ebd60e5e860))
* Add custom, multilingual Supabase email templates for signup, email change, invite, magic link, and password reset. ([c6b4d21](https://github.com/SteaceP/inventory-seg/commit/c6b4d216e45c0231a625b2e2d6e8cd9051ffcd63))
* Add D1 schema for `inventory_activity` table and update gitignore to exclude build outputs and Cloudflare-specific files. ([69573d3](https://github.com/SteaceP/inventory-seg/commit/69573d3052e5adc9676a90ba9d2acca4446fcd20))
* Add dashboard StockHealth and QuickActions components, update dashboard layout, and implement deep linking for inventory and appliance forms. ([e31b1aa](https://github.com/SteaceP/inventory-seg/commit/e31b1aa27df46b54349a00abf96b53b62971287b))
* Add email and push notification settings, including low stock threshold and test push functionality. ([21945bc](https://github.com/SteaceP/inventory-seg/commit/21945bc8dbe44f2bd3712eaa4cbe84a5a0d33ac9))
* Add environment variables to `wrangler.jsonc` and streamline Supabase response processing in `worker.ts` by removing verbose logging. ([23b0085](https://github.com/SteaceP/inventory-seg/commit/23b0085d7a03946c3c837b37de1a813a398c75cc))
* Add GitHub Actions workflow for Cloudflare deployment and configure a preview environment in wrangler.jsonc. ([9b439e8](https://github.com/SteaceP/inventory-seg/commit/9b439e8c8ab381b125d5b2b2a5e023744962a213))
* add handlers for notifications, stats, and activity, including low stock email and push alerts with i18n. ([0eedcba](https://github.com/SteaceP/inventory-seg/commit/0eedcba2a1d1b7322a484be9e35383d26cefb9ee))
* add infinite scroll and pagination to inventory activity history. ([995e979](https://github.com/SteaceP/inventory-seg/commit/995e979f0cd7d76a349535f2cc0d9453c07c04ea))
* add initial Cloudflare Workers project configuration ([b45ad1a](https://github.com/SteaceP/inventory-seg/commit/b45ad1ae9c87cf2227286afeabb4fedc12f3b870))
* add inventory reports page with monthly and annual views, location filtering, and print functionality. ([f89ef6b](https://github.com/SteaceP/inventory-seg/commit/f89ef6b26b8d3fff8b358b7ee0d7c80d9c6b23e3))
* add language preference to user settings and implement internationalization ([7437079](https://github.com/SteaceP/inventory-seg/commit/74370798ec92fc2bcd1cc6ad93d4441bb790738e))
* Add language switcher to Login and Signup pages and update locale strings for consistency and a new inventory message. ([463eb34](https://github.com/SteaceP/inventory-seg/commit/463eb34de660b3ddc1fa5cf3e74bf88945e1c315))
* Add login error message translations to English, French, and Arabic locales. ([821877a](https://github.com/SteaceP/inventory-seg/commit/821877adb2faea8db764c935e2c1ebc6a57140a9))
* add missing translations, added .gitattributes ([76723d7](https://github.com/SteaceP/inventory-seg/commit/76723d79cb144d69ff3092b8a0d1ca204ec6c4b9))
* Add multilingual README support by translating the main README to English and creating French and Arabic versions. ([77a923e](https://github.com/SteaceP/inventory-seg/commit/77a923e8529c410515b4d308e81765138535bd96))
* Add PWA maskable icons and migrate worker database access from Supabase REST to Hyperdrive. ([06ccb8d](https://github.com/SteaceP/inventory-seg/commit/06ccb8d5d3f09575c332e21bbb4fb79c8a4774b1))
* Add robots.txt to disallow all site crawling. ([a46d3fa](https://github.com/SteaceP/inventory-seg/commit/a46d3fa3ac03aba448de82fd931580993bd54c94))
* Add routing configuration to include API paths. ([6c60f7a](https://github.com/SteaceP/inventory-seg/commit/6c60f7a8f594deb3d83000fc31eca5d20974be2e))
* Add Sentry D1 instrumentation to worker and configure backend Sentry Vite plugin. ([c3020cc](https://github.com/SteaceP/inventory-seg/commit/c3020cc400c31b90c004acb305e6d6ce2a77a33a))
* Add Supabase client auth configuration for session persistence and auto-refresh. ([3572290](https://github.com/SteaceP/inventory-seg/commit/35722906d6860fc5ef71b20396930326deb6f6dc))
* add unit tests for ActionCard, ImageUploadField, InventoryHeader, useScrollIndicators, and ApplianceRepairDialog. ([342d3e6](https://github.com/SteaceP/inventory-seg/commit/342d3e6801ae8e0350c56d9798d58aca03f6f400))
* Add unit tests for InventoryScanner, ApplianceCard, and InventoryDialog components. ([a6caae5](https://github.com/SteaceP/inventory-seg/commit/a6caae53a0ff58da3ca76da84219a9025d2eeaf9))
* Add unit tests for StockAdjustmentDialog components and adjust inventory categorization test typing. ([c7a93fa](https://github.com/SteaceP/inventory-seg/commit/c7a93fa6ae267b86cc7527901cdd83719b8e6fb6))
* Add VAPID key generation script and refactor web-push notification calls to pass VAPID details via an options object. ([6352afb](https://github.com/SteaceP/inventory-seg/commit/6352afb47a1d77c57968f944c5387740f1b8aee2))
* add worker scripts and wrangler dependency for Cloudflare Workers ([b6b0eb8](https://github.com/SteaceP/inventory-seg/commit/b6b0eb8407d2153ce11e8a66118da84a4af2df18))
* added a new dashboard card and small UI fix ([e876e0b](https://github.com/SteaceP/inventory-seg/commit/e876e0bb5b595adf44d023fd5770968ab7738847))
* added arabic translation and added some error handling ([989b106](https://github.com/SteaceP/inventory-seg/commit/989b106b1349d4cb036cd8e5c08d260cf0b8c39b))
* added avatars, db optimisations ([66c731b](https://github.com/SteaceP/inventory-seg/commit/66c731b5e229fa0c6c8df13d959c9d6630e65b58))
* added chnage password,low stock alert and split  the locales ([6213df8](https://github.com/SteaceP/inventory-seg/commit/6213df86224c40f58a08e4ba0a1a79a6c9411aef))
* added dashboard recent activity ([ca3d195](https://github.com/SteaceP/inventory-seg/commit/ca3d195857c5ef43b6ecaf7de4020268cb1b7f73))
* added light theme ([c145532](https://github.com/SteaceP/inventory-seg/commit/c14553207e49bc08861549f21610191157a06060))
* added parts and their prices to appliances ([6902bda](https://github.com/SteaceP/inventory-seg/commit/6902bdad10dbc382977f47a23e72d37177f0301d))
* added proper formating and linting, small UI fix ([94caa9c](https://github.com/SteaceP/inventory-seg/commit/94caa9c266cc9ece3cad86758bf24d1d0a595858))
* added RBAC ([a196144](https://github.com/SteaceP/inventory-seg/commit/a196144e2568a10263d651c783e1cfbca31bfce7))
* added realtime messages ([ff8ffb0](https://github.com/SteaceP/inventory-seg/commit/ff8ffb05f9569f62361fad710569c12b975a980d))
* added web push notifications ([891aea8](https://github.com/SteaceP/inventory-seg/commit/891aea80b594e77032f1112714e0ef60b17e0262))
* allow Cloudflare Insights scripts and connections in Content-Security-Policy. ([a9d777b](https://github.com/SteaceP/inventory-seg/commit/a9d777b896b6173a7912d87b51d4c7e81591bab5))
* centralize and standardize test mocks for UserContext, i18n, and activity data using new factories. ([38b55ed](https://github.com/SteaceP/inventory-seg/commit/38b55ed16fb66a4023a7138470e16115b11256b4))
* Centralize Cloudflare Turnstile site key definition with a development fallback and add a key prop to the component. ([4d47cef](https://github.com/SteaceP/inventory-seg/commit/4d47ceff4c01f640d79f8345b06551410f417be6))
* Centralize error handling with Sentry breadcrumbs and localized messages for network and Supabase errors. ([fc4974a](https://github.com/SteaceP/inventory-seg/commit/fc4974a72047f6be669ef0bda0b7e12e4dd2a375))
* Complete inventory UI overhaul with crash fixes, layout improvements, collapsible categories with fix for offline service worker ([2dcc3c3](https://github.com/SteaceP/inventory-seg/commit/2dcc3c35160fda6f7d0ee37800043f2528648b52))
* Configure local development environment with API proxy, local Hyperdrive connection, and ignore local dev variables. ([7c95601](https://github.com/SteaceP/inventory-seg/commit/7c95601973c561180533b342c546ac1cd1277963))
* Configure Vite dev server with Cloudflare headers, enable CORS, and set the build target to ES2015. ([a5aff40](https://github.com/SteaceP/inventory-seg/commit/a5aff40be9640c83ad5d11df36af7609559dad94))
* document development tools, including Supabase and MUI MCP servers, and their usage instructions. ([05b37ec](https://github.com/SteaceP/inventory-seg/commit/05b37ec80cc1d56f63321a0051796ade2908c46b))
* Dynamically adjust AssistantFAB drag constraints based on screen size and add corresponding tests. ([0c6797f](https://github.com/SteaceP/inventory-seg/commit/0c6797f4daed641904024aaae6f4aa019daaff93))
* Enable adding appliances via a dialog directly from the dashboard's quick actions. ([797eb08](https://github.com/SteaceP/inventory-seg/commit/797eb083a6b6630b80769d778ceb1993fcf0b8c9))
* Enable AI assistant to add inventory items via tool calls, integrating database operations, user authentication, and adding corresponding tests. ([f981647](https://github.com/SteaceP/inventory-seg/commit/f98164745d15053d93e31fbffc5f1d96a4d402fa))
* Enable location selection for adding stock by introducing a pending action state to unify the adjustment flow. ([504fffa](https://github.com/SteaceP/inventory-seg/commit/504fffa3b9843eeaff9434076070eadc854a7c34))
* Enforce CAPTCHA verification for login and signup forms and simplify CAPTCHA error messages. ([788cc84](https://github.com/SteaceP/inventory-seg/commit/788cc844035e785363e32fe8bd176e00d7edb3da))
* Enhance activity logging with detailed narratives, add recipient and destination fields for stock adjustments, and implement a realtime broadcast fix. ([ad986f3](https://github.com/SteaceP/inventory-seg/commit/ad986f31d8d99d52dfcd58e2465a52172d913584))
* enhance auth observability and modernize test infrastructure ([5b8849b](https://github.com/SteaceP/inventory-seg/commit/5b8849b4ea31a209c51be84ea0f8f90af9c0ed50))
* enhance client-side routing in worker, update tech stack, add error handling, and refine database schema documentation. ([396aeef](https://github.com/SteaceP/inventory-seg/commit/396aeef7f1ecc29fe0e3b6cf13da82fc46c822ea))
* Enhance inventory category collapse UI, refactor header layout, and remove low stock filtering. ([ed444a1](https://github.com/SteaceP/inventory-seg/commit/ed444a1b8b755425ab7e3715314b279783ad4086))
* enhance inventory components with server-side pagination, search, and responsive design adjustments ([f0620ff](https://github.com/SteaceP/inventory-seg/commit/f0620ff5d634105984d42adfa2b9970daed89c40))
* Enhance login and signup error tests to verify console error output includes detailed status and email. ([90e0cf9](https://github.com/SteaceP/inventory-seg/commit/90e0cf92fd4b2666e685b1558ea9e78b2a9bcece))
* Enhance push notification test error handling by introducing specific error types and messages from backend to frontend. ([b7a38e0](https://github.com/SteaceP/inventory-seg/commit/b7a38e069db6cec427a82454f5e310a50c6320c7))
* extended compact mode to appliances ([14cb98c](https://github.com/SteaceP/inventory-seg/commit/14cb98c4d755cd76b6becefb13e444f674511a93))
* french translation ([137b4ab](https://github.com/SteaceP/inventory-seg/commit/137b4ab1362135ed261a3ba2254fcca4f13e31a0))
* harden RLS policies, improve migration idempotency, update types, and refine Supabase schema and configuration ([2a408a3](https://github.com/SteaceP/inventory-seg/commit/2a408a3749815e029a46176fec2a22455de57a6c))
* Implement `framer-motion` animations for the drawer and its elements, and update the service worker cache version. ([724d383](https://github.com/SteaceP/inventory-seg/commit/724d383bf14ca87f90ae6cefe226a7f46a05659b))
* Implement a comprehensive appliance management overhaul with detailed views, statistics, and an updated data model. ([e79dc93](https://github.com/SteaceP/inventory-seg/commit/e79dc931094cedf774d65179ae1a687dbd514de7))
* Implement a new theming system and enhance context mocking in tests. ([c43f73d](https://github.com/SteaceP/inventory-seg/commit/c43f73d63234663fc7e31e2b0ce08762c79b5630))
* Implement AI-driven scheduled reordering system with daily cron, intelligent supplier grouping, and Cloudflare AI integration. ([d8f9f2a](https://github.com/SteaceP/inventory-seg/commit/d8f9f2a4f71202e128c0ee2e9f7a002b15f2523d))
* Implement an AI assistant with a chat interface and dedicated worker handler, including UI components and API integration. ([f5e2dc3](https://github.com/SteaceP/inventory-seg/commit/f5e2dc3e7bdf9b78c5829d7708914a6ea124917e))
* Implement category filtering and make inventory stats cards interactive for stock status filtering. ([30e7cb1](https://github.com/SteaceP/inventory-seg/commit/30e7cb1416ec9fbbefd3b917f6dc945438c7fb31))
* Implement core application layout and PWA support with manifest and icon. ([204c159](https://github.com/SteaceP/inventory-seg/commit/204c15959263604cf1608bdb217eb8d729888fde))
* implement core application layout, navigation, and initial pages with PWA support ([7c76d58](https://github.com/SteaceP/inventory-seg/commit/7c76d5826ce63e861092a0a16ae6275126240a88))
* implement core layout components including mobile app bar, navigation list, user profile, and sidebar header with accompanying tests. ([a73c5bc](https://github.com/SteaceP/inventory-seg/commit/a73c5bc037d1fb31e3c574e43676fe80ef06fe7e))
* Implement dedicated print styles and expand appliance-related translations across multiple languages. ([934a6e9](https://github.com/SteaceP/inventory-seg/commit/934a6e99316994ebde347c71975fb6db8f0ce201))
* Implement draggable assistant FAB with visibility toggle and dedicated close button, along with new tests and framer-motion mocks. ([e916a31](https://github.com/SteaceP/inventory-seg/commit/e916a31a74161712dbd4f00d37190e90c16bb64a))
* Implement inventory activity API in Cloudflare Worker using D1 and update frontend components to consume it. ([0a0798e](https://github.com/SteaceP/inventory-seg/commit/0a0798e860e010b8cb5fa4b30718911dbd2e6fdd))
* Implement inventory management page with CRUD operations, barcode scanning, and Material-UI components. ([b5997ec](https://github.com/SteaceP/inventory-seg/commit/b5997ec529d4e5c528005594e7c88cfb6185b34c))
* implement inventory management page with item listing, CRUD operations, and barcode scanning functionality. ([75c6e8c](https://github.com/SteaceP/inventory-seg/commit/75c6e8c3831b3ed322dbe4130e8b84521021ada3))
* Implement inventory overhaul with new item details drawer, inventory statistics, and filtering tabs. ([816facc](https://github.com/SteaceP/inventory-seg/commit/816facc98c576da1c81dbf5e45fb057217e0bdf1))
* Implement login page and application layout, refine Supabase RLS policies, and update dependencies. ([1c46d31](https://github.com/SteaceP/inventory-seg/commit/1c46d31193db7c194a3d8642f70c473ee50c4f73))
* implement MUI confirmation dialog for item deletions ([2774601](https://github.com/SteaceP/inventory-seg/commit/2774601dc2e56e8515b6d7b52da9fb3fc4fb65a4))
* Implement password verification rate limiting via a Supabase hook, update error handling, and add rate limit translations. ([ca80d1c](https://github.com/SteaceP/inventory-seg/commit/ca80d1ce9a023d6f036a8deb7b3e7917764891b4))
* Implement PWA using Workbox, update build plugins, and centralize types. ([bda4f15](https://github.com/SteaceP/inventory-seg/commit/bda4f1592e3258b9ecc2db8618ed07f18d197492))
* Implement real-time inventory item editing presence and refine service worker caching strategies. ([68afbb2](https://github.com/SteaceP/inventory-seg/commit/68afbb28b0441c8c9721bf75e3f48e2aefcdf49e))
* Implement responsive design across Dashboard, StockHealth, and QuickActions components, optimizing layout and styling for mobile screens. ([d93db5b](https://github.com/SteaceP/inventory-seg/commit/d93db5b6e69dae87374da55186c49fa9c508affb))
* Implement responsive QR box sizing and scanner container dimensions, and adjust padding for the InventoryScanner. ([71eebe9](https://github.com/SteaceP/inventory-seg/commit/71eebe91dc8745ade7992e366d76294c1db6ecb6))
* implement Sentry for centralized error reporting across the application by replacing console.error calls with Sentry.captureException. ([1153852](https://github.com/SteaceP/inventory-seg/commit/1153852476b922372017ec3906faedbbb3616349))
* implement SEO component with dynamic page titles and descriptions, supported by new localization keys. ([22bc9e3](https://github.com/SteaceP/inventory-seg/commit/22bc9e3760d52df761269d0ead9f608c08869ec4))
* Implement SPA routing directly in the worker to serve `index.html` for 404 navigation requests, removing the `_redirects` file. ([223ab85](https://github.com/SteaceP/inventory-seg/commit/223ab85d08172eedd50884c1b99c5f100247e477))
* Implement specific CAPTCHA verification failed error handling and messaging, including adjustments for development environments. ([ebd1b54](https://github.com/SteaceP/inventory-seg/commit/ebd1b549bf572552eb1e2b8417f7e6cd29286588))
* Implement success and item not found dialogs for inventory scanning and item/appliance saving, and refactor MUI palette type declarations. ([b18badf](https://github.com/SteaceP/inventory-seg/commit/b18badf26ad2d1e9bcd0cddeb13e1c9c7ac95574))
* Implement two-factor authentication (MFA) with enrollment, verification, and settings management. ([de0db39](https://github.com/SteaceP/inventory-seg/commit/de0db393ee257239482374c958193a0b10bcc0c8))
* Implement user settings fetch timeout and default creation, improve auth state management, and bump service worker cache versions. ([6165330](https://github.com/SteaceP/inventory-seg/commit/6165330d37fdb4af1b408edafc9d4054397eba38))
* Implement user settings page with profile, notification, and appearance options, and add low stock email alert functionality. ([d3c46fd](https://github.com/SteaceP/inventory-seg/commit/d3c46fdceb1fba7a63648fd6cce1b741b4793484))
* implement user signup page with email domain restriction and update login UI. ([c0ba9d8](https://github.com/SteaceP/inventory-seg/commit/c0ba9d802f3ac59d1c430be356f0e64b6cf15455))
* implemented caching mecanism using service worker ([482c66c](https://github.com/SteaceP/inventory-seg/commit/482c66cee6d235179cf7c390172d108c105c4a5d))
* implemented compact view settings ([34e3eb9](https://github.com/SteaceP/inventory-seg/commit/34e3eb9674676dc08a042e5749122ba646110717))
* implemented phone/browser notifications ([09806a2](https://github.com/SteaceP/inventory-seg/commit/09806a2a093c912549d8a4499eb5ab7b53c6254d))
* Improve client-side routing for unauthenticated users, refine user session management, and enhance worker asset serving with error handling. ([baeee14](https://github.com/SteaceP/inventory-seg/commit/baeee1463282462db0e50bd2c4db2c3b00b4d06f))
* Improve push notification error handling by deleting invalid subscriptions and add a new `deploy` script. ([694cc2a](https://github.com/SteaceP/inventory-seg/commit/694cc2a333034b43b882dabf9a540c42717c5f2b))
* include Git commit message in Cloudflare deployments ([617f9a7](https://github.com/SteaceP/inventory-seg/commit/617f9a712bf069215e61599d6762e4bb7fa17ae5))
* Increment cache version, introduce `cacheFirst` strategy, and enhance security with origin and URL validation in service worker. ([b9b9564](https://github.com/SteaceP/inventory-seg/commit/b9b95642ec7d04899a86f44f01be107e38c88e12))
* Initialize Supabase project with new configuration, database migrations, types, and environment setup. ([f99e1c1](https://github.com/SteaceP/inventory-seg/commit/f99e1c1a99dfde32de970aafc26c0d22453ab741))
* Integrate `InventoryScanner` directly into the Dashboard, passing scan results via URL parameters to the inventory page for processing. ([0a731dc](https://github.com/SteaceP/inventory-seg/commit/0a731dcec12c0884895e01d697409430beb8364e))
* Integrate Cloudflare Vite plugin to streamline asset serving and development setup, removing manual asset fetching from the worker. ([803d770](https://github.com/SteaceP/inventory-seg/commit/803d77017a8a39cb0b5b97989ca1d5faa7bab28b))
* integrate inventory category management and improve dialog UX ([0d7702a](https://github.com/SteaceP/inventory-seg/commit/0d7702a6c367b704408af64c728375ceaa39ac01))
* Integrate notification settings with Supabase for fetching and updating user preferences, adding corresponding localization strings for status messages. ([c1e1cd6](https://github.com/SteaceP/inventory-seg/commit/c1e1cd64dac2d2f0c596c631b57e935ff5c60c4f))
* Integrate Sentry Vite plugin for sourcemap generation and error tracking. ([5085dd8](https://github.com/SteaceP/inventory-seg/commit/5085dd85c4ce2291397a68f230f31eafdd2cf447))
* Internationalize password toggle `aria-label` and refactor notification settings tests for asynchronous operations. ([faebc31](https://github.com/SteaceP/inventory-seg/commit/faebc316a90d231640e65324a6ec8d5f70d4a888))
* Introduce `vite-plugin-checker`, refine Vite development server configuration for CSP/CORS, update dependencies, and configure AI remote binding. ([f08a9ab](https://github.com/SteaceP/inventory-seg/commit/f08a9ab5036dbf82f39362ec5827d899e1c5e95b))
* introduce a centralized test mocking system with factories for Supabase, router, and contexts. ([57c2471](https://github.com/SteaceP/inventory-seg/commit/57c24719ba6ed2bf46b89892e310daf350c14ea6))
* Introduce a dedicated AuthContext for authentication management and refactor UserContext to consume its state. ([c1506e5](https://github.com/SteaceP/inventory-seg/commit/c1506e5c43550a0a7866a2399239ad798ca3d242))
* introduce and utilize `createMockAlertContext` helper for consistent AlertContext mocking in tests. ([0dc9a14](https://github.com/SteaceP/inventory-seg/commit/0dc9a14321dc2cd1c3e1c231826700e5465a2b7e))
* introduce Dashboard and Inventory pages with CRUD operations and barcode scanning ([9b068b0](https://github.com/SteaceP/inventory-seg/commit/9b068b058253e0adfab0d08206246251f9573eac))
* introduce inventory management page with CRUD, barcode scanning, image uploads, and low-stock alerts, along with `image_url` column, refined RLS, and Dependabot config. ([9b7e4bb](https://github.com/SteaceP/inventory-seg/commit/9b7e4bb7170c7c1ba6170c0ec59f7c49a5706299))
* Introduce multilingual support for low stock alerts and test notifications based on user language preferences. ([6df8805](https://github.com/SteaceP/inventory-seg/commit/6df880589be6e54b848b150a49b533bd0392acb3))
* Introduce shared test utilities for consistent component rendering and simplified mocking. ([6751f7f](https://github.com/SteaceP/inventory-seg/commit/6751f7f9261d3572cc0c4612ec84b8236ba9aaca))
* Introduce stock location management, comprehensive inventory activity logging, and a duplicate SKU error check. ([a489e21](https://github.com/SteaceP/inventory-seg/commit/a489e21f026886da546bc9b7bafb60079597a1e7))
* migrate package manager from npm to pnpm across documentation, workflows, and scripts ([83a267c](https://github.com/SteaceP/inventory-seg/commit/83a267cbb8f24692762b1f1e5ec0cd9853538989))
* modularize inventory components into dedicated subdirectories and update related tests ([6eb7200](https://github.com/SteaceP/inventory-seg/commit/6eb7200d5d1913ab36b004340767e75d09c17f37))
* multi-location inventory stock ([9c4ab50](https://github.com/SteaceP/inventory-seg/commit/9c4ab50aafea83ebba20c817166ab6bbf08cf976))
* overhaul of the scan tool, and configure SPA redirects. ([76a9ee4](https://github.com/SteaceP/inventory-seg/commit/76a9ee45dec137214f88694822127a1d11da6030))
* Provide fallback environment variables for D1 and Supabase, and configure Supabase environment variables for CI tests. ([1d51246](https://github.com/SteaceP/inventory-seg/commit/1d51246fd84804febd07a0fde06e79328cd7a739))
* Redesign stock adjustment dialog with animated transitions, improved navigation, and updated styling. ([3a7c80f](https://github.com/SteaceP/inventory-seg/commit/3a7c80f964444d04e988ccdc55b2e1304fd58ede))
* refactor contexts and small update to translations ([a7047df](https://github.com/SteaceP/inventory-seg/commit/a7047df0b66133502f8335fa0afdf6165cec82ec))
* refactor realtime notifications to use Supabase Broadcast ([f1102a0](https://github.com/SteaceP/inventory-seg/commit/f1102a023957ffe882499cbc6ee554372f55516a))
* removed price occurence ([d46f336](https://github.com/SteaceP/inventory-seg/commit/d46f336f3090a69a447d43611f6c6d71e928520f))
* Rename project to SEG Inventaire, add proprietary license, configure custom domain routing, and update documentation with new features and dependency bumps. ([a16fde5](https://github.com/SteaceP/inventory-seg/commit/a16fde51681a56483e30e7edd400ec45666aa1d6))
* Replace proprietary proprietary license with AGPL-3.0 and update package.json. ([32edf9f](https://github.com/SteaceP/inventory-seg/commit/32edf9f4eaadc202e91a4fb1ad472c26ab9f075b))
* Restructured InventoryHeader to move the search bar to a second row, preventing layout overflow ([27ed678](https://github.com/SteaceP/inventory-seg/commit/27ed678fdd33e6a25e8abab147ad08a6700d9b9a))
* revamp inventory page ([a045a15](https://github.com/SteaceP/inventory-seg/commit/a045a1561923325898be622ca5de05dd6f04aa62))
* small UI redesign ([c6e28f3](https://github.com/SteaceP/inventory-seg/commit/c6e28f31a0ab570461c60ca0c0d30c28ae0dadc5))
* update Content Security Policy to allow wildcard Cloudflare Insights and specific Coderage Workers domains. ([c46b007](https://github.com/SteaceP/inventory-seg/commit/c46b0074bbd79d99054e01d789604823fcff0ee3))
* Update database schema, service worker, dependencies, and configuration. ([4492af4](https://github.com/SteaceP/inventory-seg/commit/4492af4d5434d357ee6a3dd3b7dce0ff86ee566a))
* Update service worker cache versions, add maskable SVG icon, and standardize icon usage to SVG. ([6e12c60](https://github.com/SteaceP/inventory-seg/commit/6e12c60cb1cf871a7a5ede6d1df7e705f8a5a9af))
* update Vite manual chunks to split MUI into core and icons, and add new bundles for React, Supabase, and Sentry. ([1458d0b](https://github.com/SteaceP/inventory-seg/commit/1458d0b2b5b74a5969ed13e15985cabe76e169f4))


### Performance Improvements

* Decrease Sentry traces and session replay sampling rates. ([f5b8bc1](https://github.com/SteaceP/inventory-seg/commit/f5b8bc16e5f2f1ecebf2f3fc44939405d54f8ae9))
* Lazy load barcode and scanner libraries, and add bundle analysis tooling. ([1d034fa](https://github.com/SteaceP/inventory-seg/commit/1d034fa64ef52801dea84351e2ad94ca872d3720))
* Preload Cloudflare Turnstile scripts to satisfy browser 'as' requirement. ([0aba798](https://github.com/SteaceP/inventory-seg/commit/0aba79883121d65a138b68de3bfebf0d43e8881e))


### security

* v1 security audit fixes and Supabase API key migration ([32b8b38](https://github.com/SteaceP/inventory-seg/commit/32b8b382c07bfdcb4427b0cc07fe9f7b908909ba)), closes [Hi#Priority](https://github.com/Hi/issues/Priority)


### BREAKING CHANGES

* Environment variable names have changed
- VITE_SUPABASE_ANON_KEY → VITE_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY → SUPABASE_SECRET_KEY
Critical Security Fixes:
- Remove dangerous VITE_SUPABASE_SECRET_KEY from client code
- Move secrets from .env to .env.local (gitignored)
- Create .env.example template for onboarding
- Update supabaseClient to use new publishable key terminology
