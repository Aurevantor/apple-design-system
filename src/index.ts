/**
 * Apple HIG の部品（Liquid Glass の帯を含む）。
 *
 * **このパッケージが配るのは TypeScript ではなく UIX と Token**（`packages/components` と同型）。
 * 中身は `components/*.uix` / `screens/*.uix` / `tokens/*.json` で、それ自体が 1 つの
 * ワークスペースになっているので、`uix lint packages/apple-hig` がそのまま通る。
 *
 * ## なぜ `liquid-glass` から改名したのか（#196）
 *
 * #169 が作ったときは `GlassBar` 1 つだったので `@ui-dsl/liquid-glass` で正しかったが、
 * #195 が `Switch` / `Slider` / `TabBar` … を同じ場所に足す。**ガラスでない部品が
 * `liquid-glass` に入る**のは名前と中身のずれで、この repo が最も高い代償を払って潰している形。
 *
 * **`ios` ではなく `apple-hig` にした** —— Swift Runtime は macOS でも動く
 * （`Package.swift` は `.macOS(.v14)` / `.iOS(.v17)`、`swift-macos` job が macOS で
 * `RenderHarness` を回す）ので、`ios` と名乗るとそこを狭める。HIG は iOS / iPadOS / macOS に
 * 共通する規範で、**Liquid Glass もその一部**なので、統合しても名前が正しいまま残る。
 *
 * ## 標準 Design System（`packages/components`）と別のパッケージである理由
 *
 * 客も依存も違う —— `apps/studio/design` の `chrome.*` を標準と名前が 1 つも交わらないように
 * 切ったのと同じ判断（#152 / #169）。分けたことで:
 *
 * - `packages/components` 側の**期待値を 1 つも動かさない**（Component を足すと 10 箇所動く）
 * - `examples/design-system` の `uix.json` に**「この Component は使っていない」と書かずに済む**
 *   （あちらの lint は root の `screens/` しか読まないので、`Showcase` に並べても
 *   `lint.unused-component` が消えない。#131 で `SignUp.uix` は書き換えないと決まっている）
 *
 * **逆に、このパッケージを別ワークスペースから `dependencies` で引くと診断が降ってくる**
 * （#196 の実測 —— 引いた側に `lint.unused-token` が 17 件。`screens/` 専用の `demo.*` が
 * 「依存の `screens/` は読まない」ために未使用に見える）。**1 つに統合したのはこれが理由。**
 *
 * ここに置くのは**その置き場所を指す定数だけ**（fs は読まないしコンパイルもしない）。
 * TypeScript の入口を 1 つ持つ理由は `packages/components/src/index.ts` と同じ。
 */

import { fileURLToPath } from 'node:url'

/** このパッケージのルート（= UIX ワークスペースのルート）。 */
export const appleHigRoot = fileURLToPath(new URL('..', import.meta.url))

/** このパッケージが定義する Component の名前（ファイル名と一致する。docs/03 §0）。 */
export const APPLE_HIG_COMPONENTS = ['GlassBar', 'Switch'] as const

export type AppleHIGComponent = (typeof APPLE_HIG_COMPONENTS)[number]

/** `GlassBar` の `glass` 軸（SwiftUI の `Glass` 構造と同じ 3 種。README の「glass 軸」）。 */
export const GLASS_VARIANTS = ['regular', 'clear', 'identity'] as const

export type GlassVariant = (typeof GLASS_VARIANTS)[number]

/**
 * `Switch` の `on` 軸（#196）。**値そのものを軸にする**（#79 の 1 Component 1 軸）。
 *
 * `enabled` / `disabled` は軸ではなく `<State>` —— 掛け合わせると 4 Variant になって
 * 軸が 2 本になる。State なら「値 × 操作できるかどうか」を 1 軸のまま表せる。
 * ただし **`disabled` は Web では `forcedState` でしか見えない**（README の「`disabled` の見せ方」）。
 */
export const SWITCH_VARIANTS = ['off', 'on'] as const

export type SwitchVariant = (typeof SWITCH_VARIANTS)[number]

/** `Switch` が宣言する `<State>`（`normal` は base への差分ゼロ、`disabled` が本体）。 */
export const SWITCH_STATES = ['normal', 'disabled'] as const
