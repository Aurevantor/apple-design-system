# apple-design-system — UIX で書かれた Apple HIG の Design System

**配るのは TypeScript ではなく UIX と Token。** 中身は `components/*.uix` /
`screens/*.uix` / `tokens/*.json` で、それ自体が 1 つの UIX ワークスペース
（`uix.json` が目印）。`src/index.ts` が持っているのは**軸と State の宣言**で、
「`Switch` は `off` / `on` を持ち、`normal` / `disabled` で描く」という
**この Design System の性質**を機械が読める形にしたもの。

## この repo は単独ではビルドも検査もできない

`uix lint` も描画も Swift 生成も
[`ui-dsl-studio`](https://github.com/Aurevantor/ui-dsl-studio) の
`@ui-dsl/*` が要るが、それらは publish されていない
（`tsconfig.json` が `../../tsconfig.base.json` を extends しているのはそのため ——
**親の中でだけ解決する**）。**受け入れ条件は ui-dsl-studio 側にある**:

| 検査 | 場所 |
|---|---|
| Component の構造・Token の解決・Swift 生成 | `examples/hello-world/src/apple-hig.test.ts` |
| Studio の Preview で描いて画素を測る | `e2e/apple-hig.spec.ts` |
| SwiftUI へ写る／写らないの突き合わせ | `tools/swift-runtime-states.test.ts` |

## 2 通りの食べられ方

| 器 | 役 |
|---|---|
| **submodule** —— ui-dsl-studio の `packages/apple-hig` | **検査の足場。** パスが変わらないので、上の 3 つがそのまま動く |
| **`uix scan`** —— 任意の場所に clone する | **実運用。** `uix.json` が目印なので、どこに置いても Studio が見つけて開ける |

同じ中身が両方の役をこなす。

---

## Component 一覧

| Component | 軸 | State |
|---|---|---|
| `GlassBar` | `glass` 3 種（`regular` / `clear` / `identity`） | — |
| `Switch` | `on` 2 種（`off` / `on`） | `normal` / `disabled` |
| `Slider` | `value` 3 種（`min` / `mid` / `max`） | `normal` / `disabled` |
| `ProgressBar` | `value` 3 種（`empty` / `half` / `full`） | — |
| `Stepper` | **持たない** | `normal` / **`pressed`** / `disabled` |
| `SegmentedControl` | `selection` 2 種（`leading` / `trailing`） | `normal` / `disabled` |
| `Badge` | `tone` 3 種（`neutral` / `accent` / `danger`） | — |
| `Chip` | `selected` 2 種（`off` / `on`） | `normal` / `disabled` |
| `TabBar` | **持たない** | — |
| `TabItem` | `selected` 2 種（`off` / `on`） | `normal` / `disabled` |
| `NavBar` | **持たない** | — |
| `ListRow` | `accessory` 2 種（`none` / `chevron`） | `normal` / `disabled` |

### `<State>` を持つのはどれか —— 分かれ目は「**操作できるか**」

- **操作できる**（`Switch` / `Slider` / `Stepper` / `SegmentedControl` / `Chip` / `TabItem` / `ListRow`）
  → 「操作できるかどうか」を `disabled` で表す。**軸は値のほうに使い切っている**（#79 の 1 軸）
- **操作できない**（`GlassBar` / `ProgressBar` / `Badge` / `TabBar` / `NavBar`）
  → `<State>` を **1 つも持たない**。押せないものに「押せません」と描かない。
  **`TabBar` / `NavBar` は押す対象が中身の側**なので、帯そのものは `GlassBar` と同じ扱い

**軸を持たないのは `Stepper` / `TabBar` / `NavBar`。** `Stepper` は値を見せる部品ではなく
「値を変える口」なので、絵に出る差が **押しているかどうか**しかない。
`TabBar` は**振るものを `TabItem` に渡してある** —— 帯の見た目は `GlassBar` が正本で、
選択は項目の側の軸（#227）。`NavBar` は**振りたいものが軸で作れなかった**（下の「帯と行」）。
**「1 Component 1 軸」は「必ず 1 本持つ」ではない**（#79 は上限の話。`TextField` に先例）。

**`<State>` は軸が触る属性と重ねない。** 重ねると、その属性を軸が上書きしている Variant では
**State の規則が 1 本も出なくなる**（`state-css.ts` の `changedOnly` が base からの差分だけを
残すため）。しかも**絵は正しく見える**ので目で見ても気づけない —— この 5 つはどれも
`<State>` を `opacity` に置いて軸の属性と分けてあり、
`examples/hello-world/src/apple-hig.test.ts` が**交わりが 0 件であること**を見ている（#227）。

**`pressed` だけは Web で実際に効く。** `STATE_SELECTORS` に在って `:active` に写るため
（`disabled` は無いので `forcedState` が唯一の入口）。**どちらも Swift には写らない**（#201）。

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
| capsule（`Slider` の溝とつまみ・`Badge`・`Chip`） | **採る**（`radius` に高さの半分をそのまま置く） | `Switch` と同じで**高さが固定であることに依存している**。4 つとも `radius × 2 === height` を解決値で assert して縛ってある。`Badge` だけは**幅**が中身に追随する（`minWidth` = 高さ）ので、1 桁なら真円・2 桁以上なら横に伸びた capsule になる |
| ぼかしの質 | `backdrop-filter: blur()` 1 種 | 屈折・鏡面・彩度上げが無い。`blur` は明度をならすだけで、背後の像を曲げない |
| タッチ反応（`GlassBar`） | **描かない**（`<State>` を 1 つも宣言しない） | 押した見た目が無い。帯は chrome なので押す対象は中身の側、という判断（#169） |
| 押下（`Stepper`） | **採る**（`<State name="pressed">` + `:active`） | **どちらのボタンを押したかは描けない** —— `<State>` は Component の宣言部にしか書けないので、押下は部品全体に掛かる。**Swift へは写らない**（`<State>` そのものが未接続・#201）ので、Web と Swift で絵が変わる |
| スクロールへの追随 | **描けない** | 静止した Preview には「下を流れる内容」が無い。「下に何もスクロールしていないガラスには屈折させるものが無い」（Apple） |
| 周囲の色の反射 | **描けない** | 実行時の環境依存。`docs/08` が「v0.1 は表示専用」と明示している |
| つまみの影 | 多層 `shadow` 2 枚（近い層で接地・遠い層で浮き） | **`spread` を使えない** —— SwiftUI の `.shadow` に spread が無く、`Modifiers.swift` が「写せないので無視します」と報告して落とすので、書くと Web と Swift で絵が変わる。だから Token に spread を書いていない |
| つまみの移動 | 先頭に詰め物を置き、その `width` を Variant で振る（0 → 20） | 連続した移動にならない。**2 状態しか無い**（v0.1 は表示専用）。`justify` を軸で振る書き方は取れない —— `<Variant>` は共通属性 + `name` / `on` しか受け付けず、`{$variant.padding-leading}` も `-` が算術に読まれる（docs/02 §5.2.1） |
| `Switch` の tint | 1 色に固定（`#34C759`） | iOS はシステムのアクセントカラーに追随する。実行時の環境依存なので描けない |
| 切り替えのアニメーション | **描かない** | 押しても切り替わらない。v0.1 が持たないと決めたもの（`docs/08` / #195） |
| 値の位置（`Slider` / `ProgressBar`） | 塗りの `width` を Variant で振る（3 段） | **動かない**。連続した値にならず、`min` / `mid` / `max` の 3 状態しか無い（v0.1 は表示専用）。`Slider` はつまみの左端＝塗りの右端になるよう組んであるので、振る値は 1 つで足りる |
| 幅の固定（`Slider` / `ProgressBar` / `SegmentedControl`） | 溝や地の幅を Token で固定する | **幅を変えると比率が壊れる**。塗りやインジケータの位置を **pt で** Variant に置くので、「`fillHalf` は `trackWidth` の半分」という関係が Token の外にある。capsule と同じ族の近似で、`fillHalf × 2 === trackWidth` などを解決値で assert して縛ってある |
| 選択の位置（`SegmentedControl`） | 先頭の詰め物の `width` を Variant で振る（0 → 98） | **切り替わらない**。`<State name="pressed">` にすると「押している間だけ別の絵」になり、選択そのものとは別物になる（#155 が `selected` で踏んだ形） |
| 選択中のラベル（`SegmentedControl`） | **描かない**（2 つとも同じ色） | iOS は選択中のラベルを濃くするが、`<Variant>` は共通属性しか受け付けないので**2 つのラベルに別々の色を振る手段が無い**。選択は「白い区画がどちらに居るか」だけで表す |
| large title（`NavBar`） | **作らない**（inline title の形だけ） | iOS の large title は**タイトルが leading / trailing の下の段・左寄せ**に来るが、**`<Variant>` は `align` / `justify` を受け付けない**（#229 の実測。`visible` も載らない）。`Switch` / `SegmentedControl` の「詰め物の幅を振る」手も使えない —— **タイトルの幅は文字数で決まる**ので中央に寄せる詰め物の幅を pt で置けない（あちらは区画の幅が固定だった）。**字の大きさは振れる**（fontSize 34 / 17 が IR に届くことを実測）が、それだけを振ると「大きい字の inline title」になり、**「作った」の主張が実態より広くなる** |
| accessory の種類（`ListRow`） | **`none` / `chevron` の 2 種だけ**（`none` は透明な記号） | iOS には detail（`ⓘ`）も在るが、**`<Variant>` は文字の中身を振れない**ので 1 つの軸に 2 種類の記号を置けない（`TabItem` の記号と同じ制約）。**箱の幅は軸で振らない** —— 幅を 0 にすると 2 行の本文の左端がずれる |
| アイコン（`TabItem`） | `<Text>` に**記号 1 文字**（`icon` Prop で差し替える） | **SF Symbols ではない。** 字形は書体に依存し、Web と Swift で同じ字が同じ形になる保証が無い。`<Image source>` を採らなかったのは資産ファイルが要るため（このワークスペースは `.uix` と `tokens/` しか持たず、足すと台が増える。#98）。**絵文字は採らない** —— 同じ綴りが環境ごとに別の絵になる。**`Stepper` が既に `−` / `＋` で同じことをしている**ので、新しい近似ではない |
| 選択の表し方（`TabItem`） | **色だけ**（灰 → 青） | iOS は選択で記号を outline から filled に変えるが、**1 文字では表せない**（`<Variant>` は共通属性しか受け付けず、記号の中身は Prop なので軸で振れない）。`SegmentedControl` の「選択中のラベル」と同じ族の制約 |
| `Chip` という名前 | **HIG の部品名ではない**（Material 由来） | iOS でこの形に当たるのは `UIButton.Configuration` の `.tinted()` / `.filled()` を capsule で使う書き方。#195 が挙げた 6 つに入っているのでその名前のまま作ったが、**Apple の部品を写したものではない** |

この表は `examples/hello-world/src/apple-hig.test.ts` の `EXPECTED_APPROXIMATIONS` が
**1 行ずつ固定している**（増えても減っても落ちる）。README を書き換えるときはそちらも動かす
—— それが「静かに近似を増やす」を止める壁。

### Swift へは写らないもの —— **`glass` 軸**と **`<State>` そのもの**

どちらも近似ではない。**軸ごと / 仕組みごと写らない。**

#### `<State>`（`disabled` も `pressed` も）

`swift/UIDSLRuntime` の Renderer には **`states` を読む箇所が 1 つも無い**
（`UIDSLIR/Nodes.swift` は型として持ち、`Walk.swift` は差し替え子を歩くだけで、
描画には届いていない）。`packages/codegen-swift` は `states` を**読む**（`reportUnwritable`）が、
それは「書かないことを報告するため」（`grow` の拒否・#187 と同じ形）で、
生成される Swift 自体には出てこない。
`docs/07` §2 の表も写す先（`ButtonStyle` / `.hoverEffect` / `@FocusState`）を
Phase 4 に置くだけで、`disabled` は表にも無い。

**その報告が、この 8 つに対して実際に出ることを #202 が固定した** ——
`screens/Controls.uix` を生成すると、State を持つ Component 1 つにつき 1 件:

```
State（disabled / normal）は静的コードに写しません。
Runtime Renderer も base のスタイルだけを描きます（docs/07 §2 の ButtonStyle / @FocusState は Phase 4）
```

`Stepper` だけは `State（disabled / normal / pressed）` と出る。
**この診断そのものを `examples/hello-world/src/apple-hig.test.ts` が assert している**
—— 散文で「写らない」と書くだけだと、写るようになったとき嘘のまま残る。

→ **軸の差（Variant）は Swift に写るが、State の差は 1 つも写らない。**

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

## コントロールの軸（#202）—— **振るのは「値」か「選択」か「色」**

`Switch` の `on` 軸で固まった形が、6 つともそのまま乗る。

| Component | 軸 | 何を振るか | 振る属性 |
|---|---|---|---|
| `Slider` | `value` | 塗りの幅（0 / 106 / 212pt） | `width` **1 つだけ** |
| `ProgressBar` | `value` | 塗りの幅（0 / 120 / 240pt） | `width` **1 つだけ** |
| `SegmentedControl` | `selection` | 詰め物の幅（0 / 98pt） | `width` **1 つだけ** |
| `Badge` | `tone` | 面の色 | `background` **1 つだけ** |
| `Chip` | `selected` | 面・文字・縁 | `background` / `color` / `borderColor` |
| `Stepper` | **無し** | —— | —— |
| `TabItem` | `selected` | 記号とラベルの色 | `color` **1 つだけ** |
| `TabBar` | **無し** | —— | —— |
| `ListRow` | `accessory` | accessory の記号の色 | `color` **1 つだけ** |
| `NavBar` | **無し** | —— | —— |

**どれも「各 Variant が同じ属性の組を書く」。** Variant は base からの差分として読まれるので、
片方だけ属性を落とすと「動かない」ではなく「**相手の値が残る**」になる（docs/02 §5.4）。
`examples/hello-world/src/apple-hig.test.ts` が Component ごとにキーの集合を突き合わせている
（**数ではなく集合** —— 数だけだと別々の属性を同じ個数書いても通る）。

### `Slider` が 1 つの値で足りる理由

つまみの左端＝塗りの右端になるように組んである。**そう組んだのは、2 つ目の長さを
Variant で振る手段が無いから** —— `<Variant>` は共通属性 + `name` / `on` しか受け付けないので、
2 つ目を振るには `minWidth` のような別の属性を「幅として」借りることになり、読めなくなる。

### `Chip` だけが文字色を振れる理由

ラベルが **1 つしか無い**から。`SegmentedControl` はラベルが 2 つあり、
Variant に書けるのは 1 つの `color` だけなので、**両方に同じ色が当たってしまう**
（だから選択中のラベルを濃くする HIG の見た目は描かない・近似の表）。

**書く名前と読む名前が違う**ことに注意（#72）—— `<Variant color="…">` と書いて
`{$variant.foreground}` で読む。同じ形が `style` → `typography` /
`radius` → `cornerRadius` にもある（`packages/compiler/src/compile.ts` の
`IR_KEY_TO_UIX_ATTRIBUTE`）。間違えると診断が案内するので静かには壊れない。

### 寸法は式で閉じている（縛りは解決値の assert）

言語に算術が無いので UIX には書けない。**1 つだけ動かすと検査が落ちる**形にしてある:

| Component | 閉じている式 |
|---|---|
| `Switch` | `inset×2 + thumb = trackHeight` / `inset×2 + thumb + travel = trackWidth` / `trackRadius×2 = trackHeight` / `thumbRadius×2 = thumbSize` |
| `Slider` | `trackRadius×2 = trackHeight` / `thumbRadius×2 = thumbSize` / `trackWidth − thumbSize = fillMax` / `fillMid×2 = fillMax` |
| `ProgressBar` | `trackRadius×2 = trackHeight` / `fillHalf×2 = trackWidth` / `fillFull = trackWidth` |
| `Stepper` | `segmentWidth×2 + dividerWidth = width` |
| `SegmentedControl` | `inset×2 + segmentWidth×2 = width` / `inset×2 + indicatorHeight = height` / `restTrailing = segmentWidth` |
| `Badge` | `radius×2 = height` / `minWidth = height` |
| `Chip` | `radius×2 = height` |
| `TabItem` | `paddingVertical×2 + iconBox + spacing + labelBox = height` / `iconBox = tabGlyph の行の高さ` / `labelBox = tab の行の高さ` |
| `NavBar` | `sideWidth×2 + titleWidth = width` |
| `ListRow` | `paddingHorizontal×2 + leadingBox + contentWidth + trailingBox + accessoryBox + spacing×3 = width` / `paddingHorizontal + leadingBox + spacing = separatorInset` / `separatorInset + separatorWidth = width` |

## 帯と行（#227 / #229）—— **借りるのは chrome だけ**

**`TabBar` は軸を 2 つ欲しがる** —— 帯の見た目（`glass`）と、項目ごとの選択（`selected`）。
1 つの Component に入れると軸が 2 本になる（#79）ので、**容れ物と項目に割った**:

| | 何を持つか |
|---|---|
| `TabBar` | 帯。**軸は無く、Slot（`items`）だけ**。`GlassBar` を中に置いて帯の見た目を借りる |
| `TabItem` | 1 項目。軸 `selected` 2 種（記号とラベルの色）+ `<State>` の `disabled` |

`NavBar` も同じ形（#229）—— 帯なので `GlassBar` を中に置き、Slot は
`leading` / `trailing`、タイトルは Prop。**軸は持たない**（下記）。

| | 何を持つか |
|---|---|
| `NavBar` | 帯。Slot は `leading` / `trailing`、タイトルは Prop。**軸は無い** |
| `ListRow` | 行。軸 `accessory` 2 種 + `<State>` の `disabled`。**`GlassBar` を包まない** |

**`background` / `backdropBlur` / `borderColor` / `borderWidth` は借りる側に 1 つも書いていない**
——`glass` 軸の値の正本は `GlassBar` で、写すと規則が分裂する（AGENTS.md の禁止事項）。
`examples/hello-world/src/apple-hig.test.ts` が**綴り**（4 属性を書いていない）と**値**
（展開後の帯が `$glass.*` の `regular` と一致する）の両方を見ている ——
片方だけだと「書き写していないが別の値」「値は同じだが書き写している」を取り逃す。

### **`ListRow` は借りない** —— ガラスは chrome のもの

`GlassBar.uix` が書いているとおり、**Liquid Glass は chrome に置くもので content area ではない**
（「下に何もスクロールしていないガラスには屈折させるものが無い」）。
**リストの行は content そのもの**なので、包むと**ガラスの使い方そのものが間違いになる** ——
行がスクロールする内容の側で、その下に「透かす背後」が無い。

**「帯は借りるのに、なぜこれは借りないのか」の答えは「これは帯ではないから」。**
借りる側の顔ぶれは `GLASS_BORROWING_COMPONENTS` が表にしていて、
`apple-hig.test.ts` が **`ListRow` がそこに入っていないこと**と
**`ListRow.uix` が `<GlassBar` を書いていないこと**を別に見ている ——
借りる側の数だけを見ても、**借りてはいけない側が借り始めたことは分からない**。

### **`NavBar` が軸を持たない理由** —— 振れたものは求めていたものではなかった

iOS には large title と inline title があり、**絵に大きく出る差**なので軸の候補だった。
実測（2026-08-26）は「**振れるが、振れたものは求めていたものではない**」:

| 書きたいもの | 結果 |
|---|---|
| `<Variant style="…">` → `{$variant.typography}` | **振れる**（`fontSize` 34 / 17 が IR に届く） |
| `<Variant height="…">` / `padding="…"` | **振れる** |
| `<Variant padding-vertical="…">` | **❌** `{}` の中で `-` が引き算に読まれる（`Switch.uix` が既に書いている） |
| `<Variant align="…">` / `justify="…"` | **❌** `semantic.unknown-attribute` + `invalid-attribute-value` |
| `<Variant visible="…">` | **❌** `semantic.unknown-variant-key`（共通属性だが `compileVariantProps` が集めない） |

**差の本質は位置**で、それは軸で作れない。詰め物の手も使えない
（**タイトルの幅は文字数で決まる**ので中央に寄せる幅を pt で置けない）。
**字の大きさだけを振ると「大きい字の inline title」になる**ので、
`large` という名前の Variant にすると**主張が実態より広くなる** —— だから作らない。

## **`Toolbar` は作らない** —— `GlassBar` がそれ（#229）

**「まだ作っていない」ではなく「作らない」。** 測った結果、
**`GlassBar` に対して増える属性が 0 件**だった:

`GlassBar` は **`HStack`（`padding` / `spacing` / `radius` / `align="center"` / `clip`）+ Slot 1 つ**で、
`Toolbar` が要求する「ガラスの帯に項目を並べる」はこの上に**何も足さない** ——
項目の並べ方は Slot に `HStack` を差せば済み、それは **`TabBar` が既にやっている形**（#227）。
**別 Component である理由を「絵に出る差」として書けない**ので、作らない。

**将来これを覆すなら、覆す理由は「絵に出る差」でなければならない**
（「iOS に Toolbar という名前がある」は理由にならない —— 名前は `GlassBar` が持っている
「ツールバー / タブバーの chrome」という説明で既に覆えている）。


### 入れ子は「仕組みは在って、通ったことがない枝」だった（2026-08-26 の実測）

`packages/compiler/src/expand.ts` は入れ子を**意図的に扱っている**（深さ上限・定義 identity での
循環検出・`SlotOutlet` が中身を受け取る経路）が、**#227 の前は、この repo のどの Component も
別の Component を置いていなかった**。着手前に最小の 2 段標本で 5 つを実測した:

| 前提 | 結果 |
|---|---|
| 定義の本体に置いた Component が展開される | ✅ diagnostics 0 件・2 段とも `expanded` を持つ |
| 内側の `<SlotOutlet>` に外側から差した中身が届く | ✅ screen → `TabBar.items` → `GlassBar.content` の **2 段中継**が通る |
| 入れ子でも `<State>` / `forcedState` が効く | ✅ document 全体でも `{ state, irId }` の範囲つきでも届く |
| Slot に複数のノードを差せる | ✅ 項目 N 個 |
| `codegen-swift` を通る | ✅ `refused` 0 件（**ただし「生成できた」は「コンパイルできる」ではない**。#187。`make swift-check` で別に確かめる） |

**定義側に書いた `id` は IR に残らない**（`expand.ts`「`id` はファイル内で一意」）。
`TabBar.uix` / `TabItem.uix` の中に `id` を書いても**検査から引けない**ので、
検査は `irId` か**利用側に書いた `id`** から辿る。

### **並べられる項目は 10 個まで**

`packages/codegen-swift` の `VIEW_BUILDER_LIMIT`（SwiftUI の `ViewBuilder` が 1 ブロックに
置ける上限）に当たる。**11 個目は生成時に拒否される**ので静かには壊れないが、
**拒否のメッセージからは理由が分からない** —— `ComponentInstance` は展開で消えるので、
書いた人は「Component を 11 個置いた」つもりでも、数えられているのは**展開後の子**。
`justify` が挿す `Spacer` も数に入るので、**10 個でも踏みうる**。
iOS のタブは 5 個までなので、実用上は当たらない。

**`Catalog` の標本が 3 個なのは別の理由**（preset の幅）——
iPhone preset 375pt − screen の外周 40 − 帯の padding 24 = 311pt に、
1 項目 76pt + 間隔 4pt が 3 個で 236pt。4 個目は溢れる。

## Swift に生成できることの確かめ方（#202）—— **生成器に聞く**

#202 の受け入れ条件に「`grow` を使っていない（**Swift に生成できる**ことを確かめる）」が
あるが、**#196 の時点ではそれを確かめる手段が無かった** ——
`packages/apple-hig` は `tools/generate-swift.mjs` の `SOURCES` に入っていなかった
（`Showcase` / `Catalog` の縞が `grow` を使い、#26 の決裁で生成を拒否していたため）。

**#187 が入って `SOURCES` に戻った。** `Stack` を自作 `Layout`（`UIXFlexStack`）に移して
比配分できるようになったので、縞の `grow` は拒否されなくなった。
いまは `tools/generate-swift.test.ts` が repo 全体で「拒否は 0 件」を見ており、
`examples/hello-world/src/apple-hig.test.ts` が**この 8 つが実際に Swift の中身になっている**
ことを別に見ている（`Tokens.Switch.trackOn` などが生成物に出ること）。

**「IR に `grow` が無い」を数える検査にはしていない。** それは必要条件でしかなく、
`packages/codegen-swift` の拒否には**もう 1 つの理由**がある ——
`VIEW_BUILDER_LIMIT`（SwiftUI の `ViewBuilder` が 1 ブロックに置ける 10 個の上限）。
しかもその判定は **`justify` が挿入する `Spacer` も数える**（`view.ts` の `emitStack`。
`center` / `start` / `spaceEvenly` で +1、`spaceAround` で +2）ので、
**子が 9 個でも踏みうる**。数え方をテスト側に写すと規則が 2 か所に分裂する
（AGENTS.md「正本を持つ表を消費者側に書き写さない」）。**生成器に聞けば、
拒否の理由が何であっても落ちる。**

### `Catalog` の節を割ってあるのはこのため（実測で裏づいた）

`Catalog` は「ガラス」と「コントロール」の 2 節に `<VStack>` で割ってある。
割る前は **11 子**（cover 1 + glass 3 + controls 7）で、**上限 10 を超えていた**。

| | 1 ブロックの最大子数 | `refused` |
|---|---|---|
| いまの形（割ってある） | **7** | **0 件** |
| 11 子にした標本 | **11** | **`子が 11 個あり、…上限（10）を超えます`** |

**`grow` を 1 つも使っていない**ことに注意 —— 「`grow` が 0 件」を数える案では、
この枝は**素通りする**。`apple-hig.test.ts` の「陽性対照」がこの 2 行をそのまま検査にしている
（10 子なら通る、という境界の反対側も一緒に）。

### 足場（`screens/Controls.uix`）は畳んだ

#187 の前は「**`grow` を 1 つも使わない screen が 1 枚あれば生成器を呼べる**」という形で
`screens/Controls.uix` を置いていた。**#187 でその制約ごと無くなったので消した** ——
`Catalog` に 12 Component すべてが並ぶので、「Component を足したとき生成検査から漏れない」
という顔ぶれの縛りも `Catalog` に移せる（`Controls` は縞を必要とする `GlassBar` を
欠いた 7 つだった）。

**足場は、それを必要にしていた制約が消えたら畳む。** 残すと「なぜあるのか」を
説明できなくなり、次に読む人が**存在しない制約を推測する**。

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
`.uix` も使う側も動かない。

**`NavBar` / `ListRow` / `TabItem` / `TabBar` の寸法も同じ扱い**（#227 / #229）——
nav bar と list row の 44pt、tab item の 76 × 50pt は**広く知られている綴り**だが、
**この環境では実機でも SDK でも測れない**。値は「式が閉じていて、preset の幅に収まる」
band 内の 1 点で、Apple の実装値ではない。**式のほうは検査が縛っている**ので、
値を差し替えるときは**式を保ったまま全部を動かす**（1 つだけ動かすと落ちる）。

### 共有するのは primitive だけ —— **component 層は Component 名で切ったまま**（#202）

6 つ増えたとき、同じ灰・同じ白・同じ影を **8 つの Component が別々に持つ**形が出た。
そのまま持つと「片方だけ変えた」が起きるので、**primitive に共有名を作って寄せた**:

| primitive | 値 | 使う先 |
|---|---|---|
| `controlInk.trackFill` | `#78788029` | `Switch` の off / `Slider` の未塗り / `ProgressBar` の溝 / `Stepper` の地 / `SegmentedControl` の地 / `Chip` の off |
| `controlInk.raised` | `#FFFFFF` | `Switch` のつまみ / `Slider` のつまみ / `SegmentedControl` のインジケータ |
| `controlInk.accent` | `#007AFF` | `Slider` の塗り / `ProgressBar` の塗り / `Stepper` の記号 / `Chip` の on / `Badge` の accent |
| `control.raisedShadow` | 2 層 | 上の 3 つが載る面の影 |

**`Switch` の on だけは緑**（`switchInk.onTint`）—— iOS の Switch は system green で、
他のコントロールの accent（青）とは別。**「同じに見えるから共有する」ではなく、
iOS 側に実在する共有だけを寄せる**（`demo.sample.radius` が `glassMetric.corner` を
借りない理由の裏返し —— あちらは**無い依存を作らない**、こちらは**在る依存を 1 か所にする**）。

**component 層は動かしていない。** `$switch.trackOff` と `$slider.trackColor` は
別々の Token のままなので、「どれを変えると何が動くか」は component 層だけ読めば分かる。

**改名で値は 1 件も動いていない**（`$switch.*` / `$glass*` / `$demo.*` の解決値 37 件を
改名の前後でダンプして突き合わせた・2026-08-22）。`#196` からの名前の変化は 3 つ:
`switchInk.offTrack` → `controlInk.trackFill` / `switchInk.thumb` → `controlInk.raised` /
`control.switchThumbShadow` → `control.raisedShadow`（`switchRatio` → `controlRatio` も同様）。

## 何が「動いている」を担保しているか

| 検査 | 何を見るか |
|---|---|
| `examples/hello-world/src/apple-hig.test.ts` | `uix lint` 診断 0 件 / 全 Variant の**解決値**（直書き）/ 展開 / `RenderIssue` 0 件 / CSS の宣言 / **寸法どうしの関係**（capsule と比率の縛り）/ `forcedState` の有無で `disabled` が出入りすること / **`generateWorkspace` が 1 件も拒否しないこと**と、**その器が拒否を出しうること**（陽性対照 2 本・#202） |
| `tools/generate-swift.test.ts` | repo 全体で「拒否は 0 件」（#187 で `apple-hig` も対象に入った） |
| `swift/UIDSLRuntime` の `GeneratedConformanceTests` | **生成した Swift が実際にコンパイルでき、同じ絵になること**（`make swift-check`） |
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
`WORKSPACES`）。`make dev` して Files から `apple-hig` の下の screen を選ぶ。**3 枚あり、
目的が違う**:

| screen | 目的 |
|---|---|
| `screens/Showcase.uix` | `GlassBar` の**展開経路**の検査（「定義側だけの検査は展開で落ちるものを見逃す」を塞ぐ） |
| `screens/Catalog.uix` | **全 Component の全 Variant を一望する見本帳**（#170 / #196 / #202）。コントロールはここに居る |**台は増えていない** —— `.uix` と `tokens/` しか持たない
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
