# Angular 20 TODO アプリ開発ロードマップ

> **対象** : React 経験 3 年・Angular 初学者\
> **目的** : 最新（v20）機能を盛り込んだ TODO アプリを作りながら Angular の基礎〜先端まで体験\
> **ゴール** : Stand-alone + Signals + (任意) Zoneless 構成で SSR／Incremental Hydration まで動く最小アプリ

---

## 0. 前提知識マッピング

| React の概念                | Angular の対応                                      | 補足                           |
| ------------------------ | ------------------------------------------------ | ---------------------------- |
| Function Component / JSX | `@Component` (stand-alone) + HTML template       | テンプレートは外部 or インライン           |
| `useState`               | **Signals** `signal()`, `computed()`, `effect()` | v20 Stable                   |
| Context / DI via props   | 依存性注入（`inject()` / コンストラクタ）                      | 任意階層から取得                     |
| React Router             | Angular Router                                   | `provideRouter(routes)` で DI |
| React Query 等            | `HttpClient` + `toSignal()` / RxJS               | Observable→Signal 変換         |
| CSR→SSR/ISR              | Angular SSR + **Incremental Hydration**          | `withIncrementalHydration()` |

---

## 1. 開発環境セットアップ (0.5 日)

1. **Node 20.11.1 以上**
   ```bash
   nvm install 20.11.1   # 推奨 LTS
   ```
2. **プロジェクト作成用 CLI**\
   グローバル install は衝突しやすいため一時実行を推奨
   ```bash
   npx @angular/cli@20  new todo-app \
     --routing \
     --style=scss \
     --ssr          # SSR + Incremental Hydration
     # --zoneless   # ★任意：Signals だけで変更検知したい場合
   cd todo-app
   ```

> `--standalone` は v20 では既定値のため不要。

3. VS Code 拡張 : Angular Language Service / ESLint

---

## 2. プロジェクト初期化タスク (0.5 日)

- `app.config.ts` で **NgModule ゼロ構成**
  ```ts
  bootstrapApplication(AppComponent, {
    providers: [
      provideHttpClient(),
      provideRouter(routes),
      provideAnimations(),            // 必要なら
      // Zoneless を後付けする場合:
      // provideZonelessChangeDetection(),
    ],
  });
  ```
- `angularCompilerOptions.typeCheckHostBindings = true` を `tsconfig.json` に追記し テンプレートの型安全を強化。

---

## 3. 基本機能実装 (2 日)

| 日         | タスク                                         | 目的                             |
| --------- | ------------------------------------------- | ------------------------------ |
| **Day 1** | `TodoListComponent`, `TodoItemComponent` 作成 | Input / Output, Stand-alone 流儀 |
|           | Signals `const todos = signal<Todo[]>([])`  | `effect()` でログ／デバッグ            |
| **Day 2** | `TodoService` を DI（メモリ永続）                   | 依存性注入の基本                       |
|           | **テンプレート制御フロー**`@for` / `@if` へ置換           | v20 標準構文                       |

---

## 4. 先端トピック (1.5 日)

1. **Zoneless Change Detection** (Developer Preview)
   - 新規生成時 `--zoneless`。既存なら `provideZonelessChangeDetection()` を追加。
   - `detectChanges()` が必要になるケースを体験。
2. **Signal-based Forms** (Developer Preview)
   - 従来 Reactive Forms と比較しつつ、API 変更リスクを説明。
3. **Incremental Hydration** チューニング
   - `withIncrementalHydration({ idle: true })` などオプションを試し、Lighthouse で **Hydration CPU time** を計測。

---

## 5. テスト & 品質保証 (1 日)

| 種別   | 推奨ツール                              | 学習ポイント                       |
| ---- | ---------------------------------- | ---------------------------- |
| 単体   | **Web Test Runner**（デフォルト）         | `renderApplication()` helper |
|      | (任意) Jest                          | 置換手順をドキュメント化                 |
| E2E  | **Playwright**                     | `npx playwright test`        |
| Lint | `eslint-config-angular` + Prettier | `ng lint`                    |

---

## 6. CI / デプロイ (0.5 日)

1. **GitHub Actions**
   ```yaml
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 20.11.1 }
         - run: npm ci
         - run: npm run build:ssr
         - run: npx playwright install --with-deps
         - run: npm run test:ci
   ```
2. **Vercel** / **Cloudflare Pages** デプロイ
3. Web-Vitals (INP / LCP) を確認し Zoneless 効果を測定

---

## 7. 学習タイムライン（例）

| 週          | マイルストーン                      |
| ---------- | ---------------------------- |
| **Week 1** | Environment + 基本 UI          |
| **Week 2** | Signals State & Service DI   |
| **Week 3** | Zoneless / Hydration & パフォ比較 |
| **Week 4** | テスト・CI/CD → ブログで振り返り         |

---

## 参考リンク

- [Angular v20 Release Notes](https://angular.io/guide/versions)
- [Stand-alone Components](https://angular.dev/guide/standalone-components)
- [Signals Guide](https://angular.dev/guide/signals)
- [Zoneless RFC](https://github.com/angular/angular/blob/main/packages/core/docs/zoneless.md)
- [@for / @if Template Syntax](https://angular.dev/guide/template-control-flow)

