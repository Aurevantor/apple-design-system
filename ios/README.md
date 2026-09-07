# iOS UIX components

利用例: [Hello World](../examples/hello-world/README.md)。共通部品を複製せず、
`dependencies` でこのワークスペースを参照する6画面・2フローのサンプル。

Apple Design Resources の Figma UI Kit を参照した、編集可能な iOS カンプ用の共通部品。
`ios/uix.json` を独立した UIX ワークスペースの入口とする。既存のルート側の
`NavBar` / `TabBar` / `ListRow` と異なる API を、名前の衝突なく提供する。

利用側の `uix.json` の `dependencies` に、この `ios` ディレクトリへの相対パスを指定する。
利用側には部品や Token のコピーを置かない。アプリ固有の文言・プロフィール情報・
画面遷移は利用側が所有する。タブの内容も Slot で渡す。

## 参照と制約

2026-09-07 に Figma MCP で参照したファイルは
`HO7W90XGeBFULc7PW5V4vS`。Toolbar `1:54520`（操作面44、内側36、帯54、左右16）、
Back Item `5431:836`、Tab Bar `3:72207`（項目54、外周4、下余白25）を参照した。
UI Kit や抽出アセットは再配布しない。SVG は ui-dsl-studio の近似描画、
Swift の記号は `Image(systemName:)` を用いる。

ガラスは半透明・blur・rim・shadow による近似で、ネイティブ Liquid Glass の屈折、
自動明暗適応、スクロール変形ではない。フォームもカンプであり入力処理を持たない。
実アプリは NavigationStack / TabView / Form 等の標準コンテナを使う。

このワークスペースは単独の `@ui-dsl/*` 配布物を含まない。読み込み・描画・生成の
検査は ui-dsl-studio の CLI と検査用 fixture で行う。
