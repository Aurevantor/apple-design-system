# @ui-dsl/liquid-glass — Liquid Glass（iOS 26+）の chrome 部品

`GlassBar` 1 つと、その `glass` 軸（`regular` / `clear` / `identity`）の Token。
配るのは **UIX と Token だけ**で、TypeScript は置き場所を指す定数しか持たない
（`packages/components` と同型）。

```jsonc
// 使う側の uix.json
{ "dependencies": ["../../packages/liquid-glass"] }
```

## いちばん先に読むもの —— **写せるのは「半透明」と「ぼかし」だけ**

Liquid Glass は屈折・鏡面・縁のグラデーション・周囲の色の反射・スクロールへの追随を
まとめた効果で、**このリポジトリの言語機能で書けるのはそのうち 2 つ**（#167 の調査）。
だから残りは全部**近似か、描かないか**になる。**何を近似したかを先に並べる** ——
書かないと「Liquid Glass を作った」という主張が実態より広くなる（#152 の
`EXPECTED_OMISSIONS` と同じ理由）。

### 近似したもの

| 要素 | 近似手段 | 何が失われるか |
|---|---|---|
| 縁の光沢 | `borderWidth` 1pt + 半透明の白 `borderColor` | グラデーションにならない（上が明るく下が暗い、が出ない）。`borderWidth` は 4 辺一律で、内側に落ちる光にもならない |
| 面の明度差 | 半透明の白 1 枚（`background`） | 面の中で明るさが変わらない。ZStack に矩形を 2〜3 枚重ねれば段はつくが、段階的にしかならないので採らなかった |
| capsule | **採らない**（`radius` は 22pt 固定） | 角丸が高さに追随しない。capsule にするには `radius` に 999 のような値を置くしかなく、**高さが変わると破綻する**。角ごとの radius も無い |
| ぼかしの質 | `backdrop-filter: blur()` 1 種 | 屈折・鏡面・彩度上げが無い。`blur` は明度をならすだけで、背後の像を曲げない |
| タッチ反応 | **描かない**（`<State name="pressed">` を書かない） | 押した見た目が無い。`<State>` は Swift 側に未接続なので、書くと Web でだけ動く |
| スクロールへの追随 | **描けない** | 静止した Preview には「下を流れる内容」が無い。「下に何もスクロールしていないガラスには屈折させるものが無い」（Apple） |
| 周囲の色の反射 | **描けない** | 実行時の環境依存。`docs/08` が「v0.1 は表示専用」と明示している |

この表は `examples/hello-world/src/liquid-glass.test.ts` の `EXPECTED_APPROXIMATIONS` が
**1 行ずつ固定している**（増えても減っても落ちる）。README を書き換えるときはそちらも動かす
—— それが「静かに近似を増やす」を止める壁。

### Swift へは写らないもの —— **`glass` 軸そのもの**

これは近似ではない。**軸ごと写らない。**

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

## Token の値の出典 —— **Figma UI kit は未実測**

**「Figma の ○○ を実測」とは書いていない。** この作業環境に Apple の UI kit が無く、
#167 の調査どおり **CSS 再現の具体値はどの公開資料にも無い**。測っていない値に「実測」と
書くと、#131 の族（**測っていないのに報告だけ正しく見える**）になる。

いま書いてある値の出典は **「この repo の Web Preview の画素実測」**で、
「それらしい値」ではなく **3 種の差が絵に出る band に入っていること**を確かめて置いた
（`e2e/liquid-glass.spec.ts` の実測表）。同じことが
`tokens/semantic.tokens.json` の `$description` にも書いてある。

**kit の数値が手に入ったら差し替える。** 差し替えるのは
`tokens/primitive.tokens.json` の値と `semantic` 側の `$description` だけで、
`GlassBar.uix` も使う側も動かない。

## 何が「動いている」を担保しているか

| 検査 | 何を見るか |
|---|---|
| `examples/hello-world/src/liquid-glass.test.ts` | `uix lint` 診断 0 件 / 3 Variant の**解決値**（直書き）/ 展開 / `RenderIssue` 0 件 / CSS の宣言 |
| **`e2e/liquid-glass.spec.ts`** | **Studio の Preview で描いた画素**。3 種が互いに違う絵になること |
| `swift/UIDSLRuntime` の `RenderTests` | `backdropBlur: 0` が material を出さないこと（`identity` が Swift でガラスを持たない） |

**画素まで降りる理由。** `backdrop-filter: blur(20px)` は**構文として正しいまま一度も効かない**
ことがあり（祖先が backdrop root を作るとぼかす対象が空になる。docs/02 §5.4.2）、
しかも効いていなくても `getComputedStyle` は同じ値を返す。
規則の文字列を見るテストでは、**この壊れ方が丸ごと素通りする**。

## 見るとき

Studio が 4 つ目のワークスペースとしてこれを開く（`apps/studio/vite.config.ts` の
`WORKSPACES`）。`make dev` して Files から `liquid-glass` の下の
`screens/Showcase.uix` を選ぶ。**台は増えていない** —— `.uix` と `tokens/` しか持たない
ワークスペースなので、AGENTS.md #98 の「台を新しく作るときは、その台ぶんの検査も作る」は
発動しない（見る道具は既にある = Studio 自身）。

## なぜ `packages/components` に足さないのか

`packages/components` は**標準 Design System**（Button / TextField / Card / Avatar）で、
Liquid Glass は **iOS 26 専用の外装**。客も依存も違う ——
`apps/studio/design` の `chrome.*` を標準と名前が 1 つも交わらないように切ったのと
同じ判断（#152 / #169）。実測での差は 2 つ:

- **標準に足すと既存テストの期待値が 6 か所動く**（別パッケージなら 0）
- **`examples/design-system/uix.json` に「この Component は使っていない」と書く必要が出る**
  —— あちらの lint は root の `screens/` しか読まないので、`packages/components/screens/Showcase.uix`
  に並べても `lint.unused-component` が消えない。`SignUp.uix` は書き換えない決まり（#131）
