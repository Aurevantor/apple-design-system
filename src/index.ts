/**
 * Apple HIG の部品（Liquid Glass の帯を含む）。
 *
 * **このパッケージが配るのは TypeScript ではなく UIX と Token**（`packages/components` と同型）。
 * 中身は `components/*.uix` / `screens/*.uix` / `tokens/*.json` で、それ自体が 1 つの
 * ワークスペースになっているので、`uix lint tests/fixtures/apple-design-system` がそのまま通る。
 *
 * ## なぜ `liquid-glass` から改名したのか（#196）
 *
 * #169 が作ったときは `GlassBar` 1 つだったので `@ui-dsl/liquid-glass` で正しかったが、
 * #195 が `Switch` / `Slider` / `TabBar` … を同じ場所に足す。**ガラスでない部品が
 * `liquid-glass` に入る**のは名前と中身のずれで、この repo が最も高い代償を払って潰している形。
 *
 * **`ios` ではなく `apple-design-system` にした** —— Swift Runtime は macOS でも動く
 * （`Package.swift` は `.macOS(.v14)` / `.iOS(.v17)`、`swift-macos` job が macOS で
 * `RenderHarness` を回す）ので、`ios` と名乗るとそこを狭める。HIG は iOS / iPadOS / macOS に
 * 共通する規範で、**Liquid Glass もその一部**なので、統合しても名前が正しいまま残る。
 *
 * ## 標準 Design System（`packages/components`）と別のパッケージである理由
 *
 * 客も依存も違う —— `tests/fixtures/ui-dsl-studio-design-system` の `chrome.*` を標準と名前が 1 つも交わらないように
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
export const appleDesignSystemRoot = fileURLToPath(new URL('..', import.meta.url))

/**
 * このパッケージが定義する Component の名前（ファイル名と一致する。docs/03 §0）。
 *
 * **並びは registry と同じ**（= `components/` のファイル名順）。
 * `examples/hello-world/src/apple-design-system.test.ts` が `registry.names()` と突き合わせる。
 */
export const APPLE_DESIGN_SYSTEM_COMPONENTS = [
  'Badge',
  'Chip',
  'GlassBar',
  'ListRow',
  'NavBar',
  'ProgressBar',
  'SegmentedControl',
  'Slider',
  'Stepper',
  'Switch',
  'TabBar',
  'TabItem',
] as const

export type AppleDesignSystemComponent = (typeof APPLE_DESIGN_SYSTEM_COMPONENTS)[number]

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

/** `Slider` の `value` 軸（#202）。**塗りの幅とつまみの位置を 1 つの値で振る**。 */
export const SLIDER_VARIANTS = ['min', 'mid', 'max'] as const

export type SliderVariant = (typeof SLIDER_VARIANTS)[number]

/** `ProgressBar` の `value` 軸（#202）。溝の幅に対する 0% / 50% / 100%。 */
export const PROGRESS_BAR_VARIANTS = ['empty', 'half', 'full'] as const

export type ProgressBarVariant = (typeof PROGRESS_BAR_VARIANTS)[number]

/** `SegmentedControl` の `selection` 軸（#202）。白い区画がどちらに居るか。 */
export const SEGMENTED_CONTROL_VARIANTS = ['leading', 'trailing'] as const

export type SegmentedControlVariant = (typeof SEGMENTED_CONTROL_VARIANTS)[number]

/** `Badge` の `tone` 軸（#202）。面の色だけが変わる。 */
export const BADGE_VARIANTS = ['neutral', 'accent', 'danger'] as const

export type BadgeVariant = (typeof BADGE_VARIANTS)[number]

/** `Chip` の `selected` 軸（#202）。面・文字・縁の 3 つが変わる。 */
export const CHIP_VARIANTS = ['off', 'on'] as const

export type ChipVariant = (typeof CHIP_VARIANTS)[number]

/**
 * `TabItem` の `selected` 軸（#227）。**記号とラベルの色だけが変わる。**
 *
 * 1 属性しか振らないのは、`<Variant>` が共通属性しか受け付けず、記号とラベルに
 * **別々の**色を振る手段が無いため（`SegmentedControl` の 2 つのラベルと同じ制約）。
 * iOS は選択で記号を outline から filled へ変えるが、**1 文字では表せない**
 * （README の近似の表）。
 */
export const TAB_ITEM_VARIANTS = ['off', 'on'] as const

export type TabItemVariant = (typeof TAB_ITEM_VARIANTS)[number]

/**
 * `ListRow` の `accessory` 軸（#229）。**記号の色だけが変わる。**
 *
 * **2 種しかないのは `<Variant>` が文字の中身を振れないから** —— iOS には
 * chevron（`›`）と detail（`ⓘ`）が在るが、1 つの軸に 2 種類の記号は置けない
 * （#227 の `TabItem` の記号と同じ制約）。だから軸は「記号が見えるかどうか」。
 *
 * **`none` は「描かない」ではなく「透明を塗る」** —— Variant は base からの差分として
 * 読まれるので、片方だけ `color` を落とすと「記号が消える」ではなく
 * 「chevron の色が残る」になる（`glassInk.opaque00` が面の白について同じことをしている）。
 */
export const LIST_ROW_VARIANTS = ['none', 'chevron'] as const

export type ListRowVariant = (typeof LIST_ROW_VARIANTS)[number]

/**
 * **`<State>` を宣言する Component と、その State**（#202）。
 *
 * 分かれ目は「**操作できるか**」——
 *
 * - **操作できる**（`Switch` / `Slider` / `Stepper` / `SegmentedControl` / `Chip`）
 *   → 「操作できるかどうか」を `disabled` で表す。軸は値のほうに使い切っている
 * - **操作できない**（`GlassBar` / `ProgressBar` / `Badge`）
 *   → `<State>` を 1 つも持たない。押せないものに「押せません」と描かない
 *
 * `normal` は base への差分ゼロだが**書いておく** —— Inspector の強制表示に
 * 「素の見た目へ戻す」選択肢が並ぶのは宣言があるときだけ（TextField と同じ形）。
 *
 * **`disabled` は Web では `forcedState` が唯一の入口**（`STATE_SELECTORS` に無い）。
 * **`pressed` は違う** —— `:active` に写るので、押すと実際に効く（`Stepper` だけが持つ）。
 * どちらも **Swift には写らない**（`<State>` そのものが未接続・#201）。
 */
export const SWITCH_STATES = ['normal', 'disabled'] as const

/** `Slider` の `<State>`（`Switch` と同じ）。 */
export const SLIDER_STATES = ['normal', 'disabled'] as const

/** `SegmentedControl` の `<State>`（`Switch` と同じ）。 */
export const SEGMENTED_CONTROL_STATES = ['normal', 'disabled'] as const

/** `Chip` の `<State>`（`Switch` と同じ）。 */
export const CHIP_STATES = ['normal', 'disabled'] as const

/**
 * `TabItem` の `<State>`（#227。`Switch` と同じ顔ぶれ）。
 *
 * **軸が触る属性（`color`）とは別の属性（`opacity`）に置いてある。** 重ねると、
 * その属性を軸が上書きしている Variant では**State の規則が 1 本も出ない** ——
 * `packages/renderer-web/src/state-css.ts` の `changedOnly` が base からの差分だけを
 * 残すため。しかも**絵は正しく見える**ので目で見ても気づけない（#227 の実測）。
 * `examples/hello-world/src/apple-design-system.test.ts` が**軸と `<State>` の触る属性の交わりが
 * 0 件であること**で縛っている（`Switch` / `Slider` / `SegmentedControl` / `Chip` も同じ）。
 * **原因の側を見る形にしてある** —— 症状（「2 種とも同じ本数の規則が出る」）を測ると、
 * `disabled` のように疑似クラスへ写らない State では**規則が元から 0 本**なので、
 * 何も検査しないまま緑になる。
 */
export const TAB_ITEM_STATES = ['normal', 'disabled'] as const

/** `ListRow` の `<State>`（#229。軸が触る `color` とは別の `opacity` に置いてある）。 */
export const LIST_ROW_STATES = ['normal', 'disabled'] as const

/**
 * `Stepper` の `<State>`。**`pressed` を持つのはここだけ** ——
 * 軸を持たない Component なので、絵に出る差が State しか無い。
 */
export const STEPPER_STATES = ['normal', 'pressed', 'disabled'] as const

/**
 * **`<State>` を 1 つも宣言しない Component**（操作できないもの）。
 *
 * 表にしてあるのは、`examples/hello-world/src/apple-design-system.test.ts` が
 * 「本当に 0 件か」を IR から確かめるため —— 散文で書くと、あとから
 * `<State>` を足したときに**嘘のまま残る**（#170 で `GlassBar` について同じ形を置いた）。
 */
export const STATELESS_COMPONENTS = [
  'GlassBar',
  'ProgressBar',
  'Badge',
  'TabBar',
  'NavBar',
] as const

/**
 * **軸を 1 つも持たない Component**（#227）。
 *
 * `Stepper` は「値を見せる部品ではなく値を変える口」なので絵に出る差が `<State>` しか無い。
 * `TabBar` は**振るものを `TabItem` に渡してある** —— 帯の見た目は `GlassBar` が正本で、
 * 選択は項目の側の軸。**#79 の「1 Component 1 軸」は上限の話**で、1 本必ず持つという
 * 意味ではない（`TextField` に先例）。
 *
 * 表にしてあるのは `STATELESS_COMPONENTS` と同じ理由 ——
 * 散文で書くと、あとから軸を足したときに嘘のまま残る。
 */
export const AXISLESS_COMPONENTS = ['Stepper', 'TabBar', 'NavBar'] as const

/**
 * **`GlassBar` を中に置く Component**（#227 / #229）。
 *
 * 帯の見た目（面・ぼかし・縁）の正本は `GlassBar` なので、chrome の帯は borrow する。
 * **`ListRow` は入らない** —— ガラスは chrome に置くもので content area ではなく
 * （`GlassBar.uix`「下に何もスクロールしていないガラスには屈折させるものが無い」）、
 * リストの行は content そのもの。**包むとガラスの使い方が間違いになる。**
 *
 * 表にしてあるのは、`examples/hello-world/src/apple-design-system.test.ts` が
 * 「**この顔ぶれ以外は `GlassBar` を中に置いていない**」を IR から確かめるため ——
 * 散文で書くと、あとから包んだときに嘘のまま残る。
 */
export const GLASS_BORROWING_COMPONENTS = ['NavBar', 'TabBar'] as const
