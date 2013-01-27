

Kappa3D.js
====================

概要
------

Kappa3D.js は DeNA 社の2012年のインターン TechStuDIG において開発された、スマートフォン向けの3Dゲーム作成フレームワークです。


機能
------

Kappa3D.js は、以下のような機能を持ちます。

* 3Dエンジンとして
  * ポリゴンの描画（隠面消去、背面消去）
  * テクスチャの貼り付け
  * 照明（拡散光と環境光。テクスチャにも対応）
  * 基本的なオブジェクトの生成（四角形、直方体、針）
  * オブジェクトの回転、平行移動、拡大縮小
  * シンプルなベクトル、行列計算機能の提供
* ゲーム用フレームワークとして
  * 3Dで用いられる代表的なカメラワークの実装（4種）
  * 当たり判定（箱と点、線分とポリゴン）
  * オブジェクトの移動パターンの設定
  * メインループの提供

ゲーム用フレームワークとして、ゲームに特化した機能を重点的に実装しました。

一般の3Dライブラリと大きく異なるのは、オブジェクトを動かす関数が moveForward() や rotateYaw() などのオブジェクト座標を基準とした形で提供されるところでしょう。

デモ
------

以下の4つのデモを用意しました。

* [デモ1]
  * 3D糸通し
  * インターン開始当初に開発目標として定めたもの
  * 衝突判定など
  * スマートフォンでは画面上の青い四角形をタッチすることにより操作できます
  * キーボードでは H, J, K, L キーで操作できます
* [デモ2]
  * フレームワークに組み込まれている4つの代表的なカメラワークの確認
  * 照明の効果の確認（テクスチャにも反映されます）
* [デモ3]
  * Hello World 的な最も簡単な例
* [デモ4]
  * 2種のビルボード（固定軸がない：球、固定軸がある：木）
  * 物体の動作パタンの設定
  * ポリゴンと線との衝突判定
  * スマートフォンでは画面上の青い四角形をタッチすることにより操作できます
  * キーボードでは F, H, J, K, L キーで操作できます

[デモサイト] でも見られます。

見どころ
------

まずはデモを動かしてみてください。PC でもスマホでもある程度動くはずです。

ソースコードはシンプルで分かりやすくなるよう心がけたつもりです。

一応 JSDoc による [ドキュメント] もあります。 

苦労したところ
------

* 計算を軽くするための工夫
* ゲーム制作を意識した設計
* 汎用性と計算量の兼ね合い

ファイル構成
------

```
/  
|- kappa3d.js  
|- readme.md - このドキュメント  
|- doc/ - ドキュメントフォルダ  
|- demo/ - デモフォルダ  
       |- demo1.html - デモ1  
       |- demo1.js - デモ1のスクリプト  
       |- demo2.html - デモ2  
       |- demo2.js - デモ2のスクリプト  
       |- demo3.html - デモ3  
       |- demo3.js - デモ3のスクリプト  
       |- demo4.html - デモ4  
       |- demo4.js - デモ4のスクリプト  
       |- demo1.jpg - デモ1のタイトル画像  
       |- demo2.jpg - デモ2のかっぱ画像  
       |- demo3.jpg - デモ3のかっぱ画像  
       |- tree.jpg - デモ4の木の画像  
       |- sphere.jpg - デモ4の球の画像  
```

HOW TO USE
===================

以下に示すものをひと通り実装したものが [デモ3] です。


全体の作成
------

in HTML
```html
<script src="kappa3d.js"></script>
<canvas id="canvas"></canvas>
```

in JavaScript
```javascript
var canvas = document.getElementById("canvas");
scene = new Kappa3D.Scene(canvas);
scene.startMainloop();
```

何もオブジェクトのない空間が作成され、Canvas に fps だけが表示されます。


立方体の追加
------

```javascript
// 立方体の作成
var obj = Kappa3D.makeCube(scene);

// シーンに追加
scene.objects.push(obj);
```

原点に立方体が作られます。


テクスチャ付のポリゴンの追加
------

```javascript
// ポリゴンの設定
var param = {};
param.v = [$V([-2,1,0]),$V([-2,-1,0]),$V([2,-1,0]),$V([2,1,0])];
param.texture = {};
param.texture.url = "https://www.google.co.jp/images/srpr/logo3w.png";
param.texture.v = [$V([0,0]),$V([0,94]),$V([274,94]),$V([274,0])];
param.show_back = true;

// 四角形ポリゴンの作成
var obj = Kappa3D.makeRectangle(scene, param);

// シーンに追加
scene.objects.push(obj);
```


カメラの移動
------

```javascript
scene.camera.track(obj, {
    tracktype: "gom",
    a: 0.05,
    distance: 1,
    v: 0.9
});
```

obj をカメラが追跡するようになります。


フレームごとの処理
------

```javascript
scene.onFrame = function(){
    obj.rotateYaw(1.0/scene.fps);
    obj.rotateRoll(0.7/scene.fps);
    obj.rotatePitch(0.3/scene.fps);
}
```

回転します。


3次元オブジェクト以外の描画
------

```javascript
scene.extraDraw = function(){
    this.ctx.fillStyle = 'blue';
    this.ctx.font = "15pt Calibri";
    this.ctx.fillText("Simple Kappa3D Demo", 10, 60);
}
```

自分で文字を書いたりできます。


[デモ1]: ./demo/demo1.html
[デモ2]: ./demo/demo2.html
[デモ3]: ./demo/demo3.html
[デモ4]: ./demo/demo4.html
[ドキュメント]: ./doc
[デモサイト]: http://parosky.net/kappa3d/
