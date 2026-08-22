/**
 * Liquid Glass（iOS 26+）の chrome 部品。
 *
 * **このパッケージが配るのは TypeScript ではなく UIX と Token**（`packages/components` と同型）。
 * 中身は `components/*.uix` / `screens/*.uix` / `tokens/*.json` で、それ自体が 1 つの
 * ワークスペースになっているので、`uix lint packages/liquid-glass` がそのまま通る。
 *
 * **標準 Design System（`packages/components`）と別のパッケージにしてある。**
 * Liquid Glass は iOS 26 専用の外装で、客も依存も違う —— `apps/studio/design` の `chrome.*` を
 * 標準と名前が 1 つも交わらないように切ったのと同じ判断（#152 / #169）。分けたことで:
 *
 * - `packages/components` 側の**期待値を 1 つも動かさない**（Component を足すと 10 箇所動く）
 * - `examples/design-system` の `uix.json` に**「この Component は使っていない」と書かずに済む**
 *   （あちらの lint は root の `screens/` しか読まないので、`Showcase` に並べても
 *   `lint.unused-component` が消えない。#131 で `SignUp.uix` は書き換えないと決まっている）
 *
 * ここに置くのは**その置き場所を指す定数だけ**（fs は読まないしコンパイルもしない）。
 * TypeScript の入口を 1 つ持つ理由は `packages/components/src/index.ts` と同じ。
 */

import { fileURLToPath } from 'node:url'

/** このパッケージのルート（= UIX ワークスペースのルート）。 */
export const liquidGlassRoot = fileURLToPath(new URL('..', import.meta.url))

/** このパッケージが定義する Component の名前（ファイル名と一致する。docs/03 §0）。 */
export const LIQUID_GLASS_COMPONENTS = ['GlassBar'] as const

export type LiquidGlassComponent = (typeof LIQUID_GLASS_COMPONENTS)[number]

/** `GlassBar` の `glass` 軸（SwiftUI の `Glass` 構造と同じ 3 種。README の「glass 軸」）。 */
export const GLASS_VARIANTS = ['regular', 'clear', 'identity'] as const

export type GlassVariant = (typeof GLASS_VARIANTS)[number]
