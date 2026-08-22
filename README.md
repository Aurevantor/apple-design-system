# @ui-dsl/apple-hig — Apple HIG の部品（Liquid Glass の帯を含む）

| Component | 軸 | State |
|---|---|---|
| `GlassBar` | `glass` 3 種（`regular` / `clear` / `identity`） | — |
| `Switch` | `on` 2 種（`off` / `on`） | `normal` / `disabled` |

配るのは **UIX と Token だけ**で、TypeScript は置き場所を指す定数しか持たない
（`packages/components` と同型）。

```jsonc
// 使う側の uix.json
{ "dependencies": ["../../packages/apple-hig"] }
```

## なぜ `liquid-glass` から改名したのか（#196）

#169 が作ったときは `GlassBar` 1 つだったので `@ui-dsl/liquid-glass` で正しかった。
#195 が `Switch` / `Slider` / `TabBar` … を同じ場所に足すので、**ガラスでない部品が
`liquid-glass` に入る**形になる —— 名前と中身のずれは、この repo が最も高い代償を
払って潰している形（AGENTS.md「正本を持つ表を消費者側に書き写さない」の隣）。

**`ios` ではなく `apple-hig`。** Swift Runtime は **macOS でも動く**
（`Package.swift` は `.macOS(.v14)` / `.iOS(.v17)`、`swift-macos` job が macOS で
`RenderHarness` を回す）ので、`ios` と名乗るとそこを狭める。HIG は iOS / iPadOS / macOS に
共通する規範で、**Liquid Glass もその一部**なので、統合しても名前が正しいまま残る。

### 分けずに 1 つにした理由 —— **依存を引くと診断が 17 件降ってくる**（#196 の実測）

「新しいワークスペースを作って `apple-hig` を `dependencies` で引く」案は測って捨てた。
引いた側に `lint.unused-token` が **17 件**出る —— このワークスペースの `demo.*` は
`screens/` の標本だけが使う Token で、**依存の `screens/` は読まない**
（`packages/cli/src/workspace.ts`「画面は書いている本人のもの」）ため、
向こうからは全部「未使用」に見える。

#195 の受け入れ条件「**カタログから全部が一覧できる**」は、1 枚の画面に
`GlassBar` と `Switch` を並べることを要求するので、**分けるとこの依存が必ず要る**。
つまり分けた瞬間に「**使われているのに未使用と宣言する 17 行**」を永久に持つことになり、
その表は**本物の未使用 Token を隠す**。1 つに統合すればゼロ。

## いちばん先に読むもの —— **写せるのは「半透明」と「ぼかし」だけ**

Liquid Glass は屈折・鏡面・縁のグラデーション・周囲の色の反射・スクロールへの追随を
まとめた効果で、**このリポジトリの言語機能で書けるのはそのうち 2 つ**（#167 の調査）。
だから残りは全部**近似か、描かないか**になる。**何を近似したかを先に並べる** ——
書かないと「Liquid Glass を作った」という主張が実態より広くなる（#152 の
`EXPECTED_OMISSIONS` と同じ理由）。**`Switch` も同じ扱い**で、下の表に一緒に並べる。

### 近似したもの

| 要素 | 近似手段 | 何が失われるか |
|---|---|---|
| 縁の光沢 | `borderWidth` 1pt + 半透明の白 `borderColor` | グラデーションにならない（上が明るく下が暗い、が出ない）。`borderWidth` は 4 辺一律で、内側に落ちる光にもならない |
| 面の明度差 | 半透明の白 1 枚（`background`） | 面の中で明るさが変わらない。ZStack に矩形を 2〜3 枚重ねれば段はつくが、段階的にしかならないので採らなかった |
| capsule（`GlassBar`） | **採らない**（`radius` は 22pt 固定） | 角丸が高さに追随しない。capsule にするには `radius` に 999 のような値を置くしかなく、**高さが変わると破綻する**。角ごとの radius も無い |
| capsule（`Switch` の溝とつまみ） | **採る**（`radius` に高さの半分をそのまま置く） | 角丸が高さに追随しないのは同じで、**高さが固定であることに依存している**。`trackHeight` だけ変えると診断も出ないまま角丸の四角になるので、`radius × 2 === height` を解決値で assert して縛ってある（言語に算術が無いので UIX には書けない） |
| ぼかしの質 | `backdrop-filter: blur()` 1 種 | 屈折・鏡面・彩度上げが無い。`blur` は明度をならすだけで、背後の像を曲げない |
| タッチ反応 | **描かない**（`<State name="pressed">` を書かない） | 押した見た目が無い。`<State>` は Swift 側に未接続なので、書くと Web でだけ動く |
| スクロールへの追随 | **描けない** | 静止した Preview には「下を流れる内容」が無い。「下に何もスクロールしていないガラスには屈折させるものが無い」（Apple） |
| 周囲の色の反射 | **描けない** | 実行時の環境依存。`docs/08` が「v0.1 は表示専用」と明示している |
| つまみの影 | 多層 `shadow` 2 枚（近い層で接地・遠い層で浮き） | **`spread` を使えない** —— SwiftUI の `.shadow` に spread が無く、`Modifiers.swift` が「写せないので無視します」と報告して落とすので、書くと Web と Swift で絵が変わる。だから Token に spread を書いていない |
| つまみの移動 | 先頭に詰め物を置き、その `width` を Variant で振る（0 → 20） | 連続した移動にならない。**2 状態しか無い**（v0.1 は表示専用）。`justify` を軸で振る書き方は取れない —— `<Variant>` は共通属性 + `name` / `on` しか受け付けず、`{$variant.padding-leading}` も `-` が算術に読まれる（docs/02 §5.2.1） |
| `Switch` の tint | 1 色に固定（`#34C759`） | iOS はシステムのアクセントカラーに追随する。実行時の環境依存なので描けない |
| 切り替えのアニメーション | **描かない** | 押しても切り替わらない。v0.1 が持たないと決めたもの（`docs/08` / #195） |

この表は `examples/hello-world/src/apple-hig.test.ts` の `EXPECTED_APPROXIMATIONS` が
**1 行ずつ固定している**（増えても減っても落ちる）。README を書き換えるときはそちらも動かす
—— それが「静かに近似を増やす」を止める壁。

### Swift へは写らないもの —— **`glass` 軸**と **`<State>` そのもの**

どちらも近似ではない。**軸ごと / 仕組みごと写らない。**

#### `<State>`（`Switch` の `disabled`）

`swift/UIDSLRuntime` の Renderer には **`states` を読む箇所が 1 つも無い**
（`UIDSLIR/Nodes.swift` は型として持ち、`Walk.swift` は差し替え子を歩くだけで、
描画には届いていない）。`packages/codegen-swift` は `states` を**読む**（`reportUnwritable`）が、
それは「書かないことを報告するため」（`grow` の拒否・#187 と同じ形）で、
生成される Swift 自体には出てこない。
`docs/07` §2 の表も写す先（`ButtonStyle` / `.hoverEffect` / `@FocusState`）を挙げるだけで、
`disabled` は表にも無い。

→ **`on` / `off` の差（Variant）は Swift に写るが、`disabled` の差（State）は写らない。**

#### `glass` 軸

`Modifiers.swift` が `backdropBlur` に対して出すのは **`.ultraThinMaterial` 1 種だけ**なので、
`regular` と `clear` は **SwiftUI では同じ絵**になる（`identity` だけは `backdropBlur` が 0 なので
material が出ない）。`.glassEffect()` を出せば 3 種を分けられるはずだが、**この repo が持つ
唯一の描画検査手段では `.glassEffect()` の効果が 1 画素も観測できない**（実測の表は
`docs/07-swift-integration.md` §2）。観測できない修飾子を出すと、**絵が出ていないのに
「Liquid Glass に対応した」という報告だけが正しく見える**。

**だから 3 種の差は Web の Preview でだけ作ってある。** 実 `.app` か実機の iOS 26 で
`.glassEffect()` が効くことを確かめられる人が現れたら、`Modifiers.swift` に 1 行足す。

## `glass` 軸

SwiftUI の `Glass` 構造と同じ 3 つ。実在することは確かめてある
（macOS SDK 26.4 で `let g: Glass = .regular / .clear / .identity` が `swiftc -typecheck` を通り、
`.bogus` は `type 'Glass' has no member 'bogus'` で落ちる）。

| Variant | 面（`background`） | ぼかし（`backdropBlur`） | 縁（`borderColor` / `borderWidth`） |
|---|---|---|---|
| `regular` | 白 72%（`#FFFFFFB8`） | 20 | 白 80% / 1pt |
| `clear` | 白 28%（`#FFFFFF47`） | 8 | 白 40% / 1pt |
| `identity` | 白 0%（`#FFFFFF00`） | 0 | 白 0% / 0pt |

**3 種とも同じ 4 属性を書く。** Variant は base からの差分として読まれるので、
`identity` で `backdropBlur` を省くと「ぼかさない」ではなく「`regular` のぼかしが残る」に
なる（docs/02 §5.4）。

## `on` 軸（`Switch`）—— **値そのものを軸にする**

| Variant | 溝（`background`） | 詰め物の幅（つまみの位置） |
|---|---|---|
| `off` | 灰 16%（`#78788029`） | 0 |
| `on` | 緑（`#34C759`） | 20 |

**2 種とも同じ 2 属性を書く**（`glass` 軸と同じ理由）。`off` で `width` を省くと
「動かない」ではなく「`on` の位置が残る」になる。

寸法は 4 つが 1 つの式で閉じている —— `inset×2 + thumb = trackHeight` /
`inset×2 + thumb + travel = trackWidth` / `trackRadius×2 = trackHeight` /
`thumbRadius×2 = thumbSize`。**言語に算術が無いので式では書けず**、
`examples/hello-world/src/apple-hig.test.ts` が解決値で assert して縛っている
（1 つだけ動かすと落ちる）。

### `disabled` の見せ方 —— **`forcedState` が唯一の入口**

`disabled` は `packages/renderer-web/src/state-css.ts` の `STATE_SELECTORS`
（`normal` / `hover` / `focused` / `pressed`）に**無い**。`:disabled` は `<button>` や
`<input>` にしか付かず、Renderer が出す `<div>` では**一度も真にならない**ので、
**規則を 1 行も出さない**のが設計（docs/03 §4）。

**そして診断も `RenderIssue` も出ない**（#196 の実測）。知らずに書くと
「書いたのに効かない」に見えるので、見方を明記しておく:

| どこで見るか | どうやって |
|---|---|
| Studio | ノードを選び、Inspector の State 切替で `disabled` を強制表示する（#138） |
| テスト | `IRView` に `forcedState: 'disabled'` を渡す |
| **カタログには並べられない** | `<State>` は Component の宣言部にしか書けず、`forcedState` は Renderer に渡す描画オプションなので、**静止した screen からは宣言できない** |

`e2e/apple-hig.spec.ts` が Studio で**実際に操作して**、Preview の絵が変わることを確かめている
（AGENTS.md「生成した CSS は『当たること』まで確かめる」——
規則の文字列を見るテストでは、この壊れ方が丸ごと素通りする）。

## Token の値の出典 —— **Figma UI kit は未実測**

**「Figma の ○○ を実測」とは書いていない。** この作業環境に Apple の UI kit が無く、
#167 の調査どおり **CSS 再現の具体値はどの公開資料にも無い**。測っていない値に「実測」と
書くと、#131 の族（**測っていないのに報告だけ正しく見える**）になる。

いま書いてある値の出典は **「この repo の Web Preview の画素実測」**で、
「それらしい値」ではなく **3 種の差が絵に出る band に入っていること**を確かめて置いた
（`e2e/apple-hig.spec.ts` の実測表）。同じことが
`tokens/semantic.tokens.json` の `$description` にも書いてある。

**`Switch` も同じ扱い。** `51 × 31` / つまみ `27` は UIKit の `UISwitch` の
intrinsic content size として広く知られている綴りだが、**この環境では実機でも SDK でも
測れない**（`UIKit` は macOS に無い）。だから `$description` にも
「Figma UI kit も実機も未実測」と書いてある。

**kit や実機の数値が手に入ったら差し替える。** 差し替えるのは
`tokens/primitive.tokens.json` の値と `semantic` 側の `$description` だけで、
`GlassBar.uix` も `Switch.uix` も使う側も動かない。

## 何が「動いている」を担保しているか

| 検査 | 何を見るか |
|---|---|
| `examples/hello-world/src/apple-hig.test.ts` | `uix lint` 診断 0 件 / 全 Variant の**解決値**（直書き）/ 展開 / `RenderIssue` 0 件 / CSS の宣言 / **寸法どうしの関係**（capsule の縛り）/ `forcedState` の有無で `disabled` が出入りすること |
| **`e2e/apple-hig.spec.ts`** | **Studio の Preview で描いた画素**。`glass` 3 種が互いに違う絵になること / **Inspector から `disabled` を強制表示すると絵が変わること** |
| `swift/UIDSLRuntime` の `RenderTests` | `backdropBlur: 0` が material を出さないこと（`identity` が Swift でガラスを持たない） |

**画素まで降りる理由。** `backdrop-filter: blur(20px)` は**構文として正しいまま一度も効かない**
ことがあり（祖先が backdrop root を作るとぼかす対象が空になる。docs/02 §5.4.2）、
しかも効いていなくても `getComputedStyle` は同じ値を返す。
規則の文字列を見るテストでは、**この壊れ方が丸ごと素通りする**。
`disabled` を e2e で操作するのも同じ理由 —— **Inspector の切替が Preview に届いているか**は、
IR や markup を見るテストからは分からない。

## 見るとき

Studio が 4 つ目のワークスペースとしてこれを開く（`apps/studio/vite.config.ts` の
`WORKSPACES`）。`make dev` して Files から `apple-hig` の下の screen を選ぶ ——
`screens/Showcase.uix`（`GlassBar` の展開経路の検査。目的は「定義側だけの検査は展開で
落ちるものを見逃す」を塞ぐこと）と `screens/Catalog.uix`（全 Component の全 Variant を
一望する見本帳。#170 / #196）の 2 つがある。**`Switch` は Catalog のほうに居る。****台は増えていない** —— `.uix` と `tokens/` しか持たない
ワークスペースなので、AGENTS.md #98 の「台を新しく作るときは、その台ぶんの検査も作る」は
発動しない（見る道具は既にある = Studio 自身）。

## なぜ `packages/components` に足さないのか

`packages/components` は**標準 Design System**（Button / TextField / Card / Avatar）で、
こちらは **Apple のプラットフォーム固有の外装**。客も依存も違う ——
`apps/studio/design` の `chrome.*` を標準と名前が 1 つも交わらないように切ったのと
同じ判断（#152 / #169）。実測での差は 2 つ:

- **標準に足すと既存テストの期待値が 6 か所動く**（別パッケージなら 0）
- **`examples/design-system/uix.json` に「この Component は使っていない」と書く必要が出る**
  —— あちらの lint は root の `screens/` しか読まないので、`packages/components/screens/Showcase.uix`
  に並べても `lint.unused-component` が消えない。`SignUp.uix` は書き換えない決まり（#131）
