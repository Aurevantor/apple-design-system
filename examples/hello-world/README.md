# Hello World — iOS 共通部品の利用サンプル

このフォルダを UI DSL Studio で開き、Flow の `01-Welcome` または `02-Tabs` を再生する。
Welcome / Home / Profile / Account / EditProfile / About の6画面を持つ。

共通部品と Token は `uix.json` の `dependencies: ["../../ios"]` で参照する。
この repo をどこに clone しても、相対位置を保てば動く。ui-dsl-studio 内の fixture や
hello-world への参照はない。共通デザインは `../../ios/components` / `../../ios/tokens` を直す。

サンプル側が所有するのは画面、Flow、ProfileContent、`sample.*` Token だけ。
TabBar の項目・ラベル・選択状態は各画面から items Slot へ渡す。
入力・保存は実装しない UIX カンプで、操作は Studio の Flow 再生を使用する。
ガラスの近似と Figma 参照については [iOS 共通部品](../../ios/README.md) を参照。
