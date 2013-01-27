(function (global) {
    "use strict";

    ///////// Utility

    /**
     * @name clone
     * @description オブジェクトのコピーを作成する
     * @param {Object} obj コピー元のオブジェクト
     * @return {Object} コピーされたオブジェクト
     */
    function clone(obj) {
        var F = function () {};
        F.prototype = obj;
        return new F();
    }

    /**
     * @name makeRotationMatrix
     * @description 任意の軸まわりの3x3回転行列を作成する
     * @param {nector} axis 回転軸を表す単位ベクトル
     * @param {Vector} radian 回転角
     * @returns {Matrix} 作成された変換行列
     */
    function makeRotationMatrix(axis, radian) {
        var R = new Matrix(3, 3, false);
        var R1 = new Matrix(3, 3, false);
        var R2 = new Matrix(3, 3, true);
        var R3 = new Matrix(3, 3, false);

        R1.e[0][0] = axis.e[0] * axis.e[0];
        R1.e[0][1] = axis.e[0] * axis.e[1];
        R1.e[0][2] = axis.e[0] * axis.e[2];
        R1.e[1][0] = axis.e[1] * axis.e[0];
        R1.e[1][1] = axis.e[1] * axis.e[1];
        R1.e[1][2] = axis.e[1] * axis.e[2];
        R1.e[2][0] = axis.e[2] * axis.e[0];
        R1.e[2][1] = axis.e[2] * axis.e[1];
        R1.e[2][2] = axis.e[2] * axis.e[2];

        R3.e[0][1] = -axis.e[2];
        R3.e[0][2] = axis.e[1];
        R3.e[1][0] = axis.e[2];
        R3.e[1][2] = -axis.e[0];
        R3.e[2][0] = -axis.e[1];
        R3.e[2][1] = axis.e[0];

        // R = R1 + (R2 - R1) * cos(radian) - R3 * sin(radian)
        R = R1;
        R = R.add(R2.sub(R1).x(Math.cos(radian)));
        R = R.sub(R3.x(Math.sin(radian)));

        return R;
    }

    /**
     * @name makeAffineMatrix
     * @description ふたつの三角形を対応させるアフィン変換行列を求める
     * @param {Vector} [V1, V2, V3] 変換元の三角形の各頂点
     * @param {Vector} [V4, V5, V6] 変換先の三角形の各頂点
     * @return {Matrix} 計算された変換行列
     */
    function makeAffineMatrix(V1, V2, V3, V4, V5, V6) {
        var m = new Matrix(3, 3, false);

        // translation
        m.e[0][2] = V4.sub(V1).e[0];
        m.e[1][2] = V4.sub(V1).e[1];
        m.e[2][2] = 1;

        // rotation
        var x1 = V2.sub(V1).e[0];
        var x2 = V3.sub(V1).e[0];
        var y1 = V2.sub(V1).e[1];
        var y2 = V3.sub(V1).e[1];
        var x1d = V5.sub(V4).e[0];
        var x2d = V6.sub(V4).e[0];
        var y1d = V5.sub(V4).e[1];
        var y2d = V6.sub(V4).e[1];
        m.e[0][0] = (x1d * y2 - x2d * y1) / (x1 * y2 - x2 * y1);
        m.e[0][1] = (x1 * x2d - x1d * x2) / (x1 * y2 - x2 * y1);
        m.e[1][0] = (y1d * y2 - y1 * y2d) / (x1 * y2 - x2 * y1);
        m.e[1][1] = (x1 * y2d - x2 * y1d) / (x1 * y2 - x2 * y1);

        return m;
    }

    /**
     * @name removeFromArray
     * @description 配列中から指定したオブジェクトを削除する
     * @param {Object} obj 削除するオブジェクト
     * @param {Array} array 対象となる配列
     * @return {Array} array から obj が削除された配列
     */
    function removeFromArray(obj, array) {
        var i;
        var ii = array.length;
        for (i = 0; i < ii; i++) {
            if (array[i] === obj) {
                return array.splice(i, 1);
            }
        }
    }


    ///////// Vector: Vector object for Kappa3D

    /**
     * @name Vector
     * @class Kappa3D のためのベクトルクラス
     * @property {Array} e ベクトルの要素の配列
     * @description 新たなベクトルを作成する
     * @param {Array} elements 各次元の数値を格納した配列
     */
    function Vector(elements) {
        this.e = elements;
    }

    /**
     * @description 全ての次元の値の平均値を得る
     * @returns {Number} 全ての次元の値の平均値
     */
    Vector.prototype.mean = function () {
        var sum = 0;
        var e = this.e;
        var i;
        var ii = this.e.length;
        for (i = 0; i < ii; i++) {
            sum += e[i];
        }
        return sum / ii;
    };

    /**
     * @description 全ての次元の値を整数へ変換したものを返す
     * @returns {Vector} 全ての次元の値を整数へ変換したもの 
     */
    Vector.prototype.toInt = function () {
        var e = [];
        var te = this.e;
        var i = this.e.length;
        while (i--) {
            e[i] = te[i] | 0;
        }
        return $V(e);
    };

    /**
     * @description ベクトルを加算する
     * @param {Vector} vector 加算するベクトル
     * @returns {Vector} 加算後のベクトル
     */
    Vector.prototype.add = function (vector) {
        var ret = [];
        var e = this.e;
        var ve = vector.e;
        var i = this.e.length;
        while (i--) {
            ret[i] = e[i] + ve[i];
        }
        return $V(ret);
    };

    /**
     * @description ベクトルを減算する
     * @param {Vector} vector 減算するベクトル
     * @returns {Vector} 減算後のベクトル
     */
    Vector.prototype.sub = function (vector) {
        var ret = [];
        var e = this.e;
        var ve = vector.e;
        var i = this.e.length;
        while (i--) {
            ret[i] = e[i] - ve[i];
        }
        return $V(ret);
    };

    /**
     * @description ベクトルの外積を求める
     * @param {Vector} vector 右側にくるベクトル
     * @return {Vector} 求められた外積
     */
    Vector.prototype.cross = function (vector) {
        var e = this.e;
        var ve = vector.e;
        var ret = [];
        ret.push(e[1] * ve[2] - e[2] * ve[1]);
        ret.push(e[2] * ve[0] - e[0] * ve[2]);
        ret.push(e[0] * ve[1] - e[1] * ve[0]);
        return $V(ret);
    };

    /**
     * @description ベクトルの大きさ（L2ノルム）を求める
     * @return {Number} ベクトルの大きさ
     */
    Vector.prototype.norm = function () {
        var sum = 0;
        var i, ii;
        var e = this.e;
        ii = e.length;
        for (i = 0; i < ii; i++) {
            sum += e[i] * e[i];
        }
        return Math.sqrt(sum);
    };

    /**
     * @description ベクトルの正規化を行う
     * @return {Vector} 正規化後のベクトル
     */
    Vector.prototype.normalize = function () {
        var n = this.norm();
        var p = [];
        var e = this.e;
        var i, ii;
        ii = e.length;
        for (i = 0; i < ii; i++) {
            p.push(e[i] / n);
        }
        return $V(p);
    };

    /**
     * @description ベクトルのスカラ倍を求める
     * @param {Object} x 掛け合わせる Number 
     * @return {Object} スカラ倍されたベクトル
     */
    Vector.prototype.x = function (x) {
        var ret;
        var i, ii;
        var e = this.e;

        ret = [];
        ii = e.length;
        for (i = 0; i < ii; i++) {
            ret.push(e[i] * x);
        }
        return $V(ret);
    };

    /**
     * @description ベクトルの内積を求める
     * @param {Object} x 掛け合わせる Vector 
     * @return {Object} 内積
     */
    Vector.prototype.dot = function (x) {
        var ret;
        var i, ii;
        var e = this.e;

        ret = 0;
        ii = e.length;
        for (i = 0; i < ii; i++) {
            ret += e[i] * x.e[i];
        }
        return ret;
    };

    /**
     * @description ベクトルを次元ごとに掛け合わせる
     * @param {Vector} v 掛け合わせるベクトル
     * @return {Vector} 掛け合わされたベクトル
     */
    Vector.prototype.x_each = function (x) {
        var ret = [];
        var e = this.e;
        var i, ii;
        ii = e.length;
        for (i = 0; i < ii; i++) {
            ret.push(e[i] * x.e[i]);
        }
        return $V(ret);
    };

    /**
     * @description ふたつのベクトルのなす角を求める
     * @param {Vector} vector 対象となるベクトル
     * @return {Number} ふたつのベクトルのなす角
     */
    Vector.prototype.angleFrom = function (vector) {
        var cos_radian = this.dot(vector) / (this.norm() * vector.norm());

        // for calculation error
        cos_radian = Math.min(1, cos_radian);
        cos_radian = Math.max(-1, cos_radian);

        var radian = Math.acos(cos_radian);
        return radian;
    };

    /**
     * @description 3次元ベクトルを4次元目に1を持つ4次元ベクトルに変換する
     * @return {Vector} 変換後のベクトル
     */
    Vector.prototype.to4D = function () {
        var e = this.e;
        return $V([e[0], e[1], e[2], 1]);
    };

    /**
     * @description 4次元ベクトルの4次元を削除し3次元にする
     * @return {Vector} 変換後のベクトル
     */
    Vector.prototype.to3D = function () {
        return $V(this.e.slice(0, 3));
    };

    /**
     * @description ベクトルの全ての次元の符号を正とする
     * @return {Vector} 絶対値を要素として持つベクトル
     */
    Vector.prototype.abs = function () {
        var e = this.e;
        var i, ii;
        ii = e.length;
        for (i = 0; i < ii; i++) {
            e[i] = Math.abs(e[i]);
        }
        return $V(e);
    };

    /**
     * @name $V
     * @description Vector を作成する
     * @param {Array} elements 各次元の数値を格納した配列
     * @return {Array} 作成されたベクトル
     */
    function $V(elements) {
        return new Vector(elements);
    }


    ///////// Matrix: Matrix object for Kappa3D

    /**
     * @name Matrix
     * @class Kappa3D のための行列クラス
     * @property {Object} e 行列の各要素を格納する2次元配列
     * @description 新しい行列を作成する
     * @param {Number} row 行数
     * @param {Number} col 列数
     * @param {Boolean} identity true ならば単位行列、false ならばゼロ行列
     * @return {Matrix} 作成された行列
     */
    function Matrix(row, col, identity) {
        this.e = [];
        for (var i = 0; i < row; i++) {
            // new column
            this.e[i] = [];
            for (var j = 0; j < col; j++) {
                if (identity && i === j) {
                    // identity vector
                    this.e[i][j] = 1;
                } else {
                    // zero vector
                    this.e[i][j] = 0;
                }
            }
        }
    }

    /**
     * @description 行列を加算する
     * @param {Matrix} matrix 加算対象となる行列
     * @return {Matrix} 加算後の行列
     */
    Matrix.prototype.add = function (t) {
        var ret = clone(this);
        var rows, cols;
        rows = this.e.length;
        cols = this.e[0].length;
        for (var row = 0; row < rows; row++) {
            ret[row] = 0;
            for (var col = 0; col < cols; col++) {
                ret.e[row][col] += t.e[row][col];
            }
        }
        return ret;
    };

    /**
     * @description 行列を減算する
     * @param {Matrix} matrix 減算対象となる行列
     * @return {Matrix} 減算後の行列
     */
    Matrix.prototype.sub = function (t) {
        var ret = clone(this);
        var rows, cols;
        rows = this.e.length;
        cols = this.e[0].length;
        for (var row = 0; row < rows; row++) {
            ret[row] = 0;
            for (var col = 0; col < cols; col++) {
                ret.e[row][col] -= t.e[row][col];
            }
        }
        return ret;
    };

    /**
     * @description 行列のスカラ倍を求める
     * @param {Object} t スカラ値
     * @return {Object} 計算後の Matrix
     */
    Matrix.prototype.x = function (t) {
        var ret, i, ii, j, jj;

        ret = clone(this);
        ii = this.e.length;
        jj = this.e[0].length;
        for (i = 0; i < ii; i++) {
            for (j = 0; j < jj; j++) {
                ret.e[i][j] *= t;
            }
        }
        return ret;
    };

    /**
     * @description 行列とベクトルの掛け算を行う
     * @param {Object} t 掛け合わせる Vector
     * @return {Object} 計算後の Vector
     */
    Matrix.prototype.dot_v = function (t) {
        var ret, rows, cols, sum;

        // vector
        ret = [];
        rows = this.e.length;
        var _cols = this.e[0].length;
        var e = this.e;
        var te = t.e;
        while (rows--) {
            sum = 0;
            cols = _cols;
            while (cols--) {
                sum += e[rows][cols] * te[cols];
            }
            ret[rows] = sum;
        }
        return $V(ret);
    };

    /**
     * @description 行列と行列の掛け算を行う
     * @param {Object} t 掛け合わせる Matrix
     * @return {Object} 計算後の Matrix
     */
    Matrix.prototype.dot_m = function (t) {
        var ret, rows, cols, sum;

        ret = new Matrix(this.e.length, t.e[0].length, false);
        var k;
        var kk = this.e[0].length;
        rows = this.e.length;
        cols = this.e[0].length;

        var row, col;
        var e = this.e;
        var te = t.e;
        row = rows;
        while (row--) {
            col = cols;
            while (col--) {
                k = kk;
                sum = 0;
                while (k--) {
                    sum += e[row][k] * te[k][col];
                }
                ret.e[row][col] = sum;
            }
        }
        return ret;
    };


    ////////// Scene: camera, lighting, etc

    /**
     * @name Scene
     * @class シーン全体を統括するクラス
     * @property {Camera} camera シーンを撮影するカメラ
     * @property {Object} light シーンを照らす照明
     * @property {Number} fps 現在のフレームレート
     * @property {Array} objects シーンに属する K3DObject
     * @property {function} onFrame フレーム毎に実行される関数
     * @property {function} extraDraw デフォルト以外の描画を指示する関数
     * @description 新しくシーンを作成する
     * @param {Canvas} canvas 描画先となる Canvas オブジェクト
     * @return 作成されたシーンオブジェクト
     */
    function Scene(canvas) {
        // set canvas
        this.setCanvas(canvas);

        // default perspective matrix
        this.setPerspectiveMatrix(1, 100, 60 * Math.PI / 180);

        // default camera
        this.camera = new Camera(this, {
            center: $V([0, 0, 100]),
            upper: $V([0, 1, 0]),
            direction: $V([0, 0, 1])
        });
        this.setViewMatrix();

        // objects to draw
        this.objects = [];

        // default light
        this.setLight({
            color: $V([255, 255, 255]),
            direction: $V([0, 0, 1]),
            ambient: 0.2,
            diffuse: 0.8
        });

        // extra function
        this.onFrame = function () {};
        this.extraDraw = function () {};
    }

    /**
     * @description 新しく描画先の Canvas オブジェクトを設定する
     * @param {Canvas} canvas 描画対象となる Canvas オブジェクト
     */
    Scene.prototype.setCanvas = function (canvas) {
        // canvas to draw
        this.canvas = canvas;

        // aspect ratio
        this.aspect = canvas.height / canvas.width;

        // context of canvas
        this.ctx = canvas.getContext("2d");

        // make screen translation matrix
        this.setScreenMatrix();
    };

    /**
     * @description カメラ情報をもとにビュー変換行列を作成する
     */
    Scene.prototype.setViewMatrix = function () {
        var u = this.camera.upper;
        var z = this.camera.direction.x(-1);
        var x = u.cross(z);
        var y = z.cross(x);
        var e = this.camera.center;

        var viewM = new Matrix(4, 4, false);

        for (var i = 0; i < 3; i++) {
            viewM.e[0][i] = x.e[i];
            viewM.e[1][i] = y.e[i];
            viewM.e[2][i] = z.e[i];
        }
        viewM.e[0][3] = -e.dot(x);
        viewM.e[1][3] = -e.dot(y);
        viewM.e[2][3] = -e.dot(z);
        viewM.e[3][3] = 1;

        this.viewM = viewM;

        // compute persM * viwM for speed up
        this.persviewM = this.persM.dot_m(this.viewM);
    };

    /**
     * @description 透視投影変換行列を作成する
     * @param {Number} n ニアクリップ面への距離
     * @param {Number} f ファークリップ面への距離
     * @param {Number} fov 視野角の大きさ
     */
    Scene.prototype.setPerspectiveMatrix = function (n, f, fov) {
        var w = 2 * Math.tan(fov / 2);
        var h = w * this.aspect;
        var l = -w / 2;
        var r = w / 2;
        var t = h / 2;
        var b = -h / 2;

        var persM = new Matrix(4, 4, false);
        persM.e[0][0] = (2 * n) / (r - l);
        persM.e[0][2] = (r + l) / (r - l);
        persM.e[1][1] = (2 * n) / (t - b);
        persM.e[1][2] = (t + b) / (t - b);
        persM.e[2][2] = -(f + n) / (f - n);
        persM.e[2][3] = -2 * n * f / (f - n);
        persM.e[3][2] = -1;

        this.persM = persM;
    };

    /**
     * @description canvas の情報をもとにスクリーン変換行列を作成する
     */
    Scene.prototype.setScreenMatrix = function () {
        var offsetX = this.canvas.width;
        var offsetY = this.canvas.height;

        var M1 = new Matrix(4, 4, true);
        M1.e[0][0] = offsetX / 2;
        M1.e[1][1] = -offsetY / 2;
        var M2 = new Matrix(4, 4, true);
        M2.e[0][3] = offsetX / 2;
        M2.e[1][3] = offsetY / 2;
        this.screenM = M2.dot_m(M1);
    };

    /**
     * @description 光源の設定をする
     * @param {Object} param param.color は光源の色を表す Vector であり RGB の3次元を持ち、各次元は0から255までの大きさの数値。param.directin は光の入射方向を表す Vector。param.ambient は環境光の強さを表す数値、param.diffuse は拡散光の強さを表す数値であり、ふたつを足し合わせると1になることが望ましい。
     */
    Scene.prototype.setLight = function (param) {
        var light = {};
        light.color = param.color;
        light.direction = param.direction.normalize();
        light.ambient = param.ambient;
        light.diffuse = param.diffuse;

        this.light = light;
    };

    /**
     * @description メインループを開始する
     */
    Scene.prototype.startMainloop = function () {
        // number of frames in 1 second
        this.framecount = 0;

        // dummy fps
        this.fps = 1000;

        // second to count frames
        this.lasttime = new Date().getSeconds();

        // start mainloop
        var self = this;
        this.mainloop_id = setInterval(function () {
            self.mainloop();
        }, 0);
    };

    /**
     * @description メインループを終了する
     */
    Scene.prototype.stopMainloop = function () {
        clearInterval(this.mainloop_id);
    };

    /**
     * @description シーン内にある全てのオブジェクトを描画する
     */
    Scene.prototype.draw = function () {
        // clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // get depth of each object
        var objs = [];
        var i, ii;
        ii = this.objects.length;
        for (i = 0; i < ii; i++) {
            var pos = this.objects[i].getPerspectiveCoordinate();

            // if out of box then pass
            if (Math.abs(pos.e[0]) > 1.4) {
                continue;
            }
            if (Math.abs(pos.e[1]) > 1.4) {
                continue;
            }
            if (Math.abs(pos.e[2]) > 1) {
                continue;
            }

            objs.push([pos.e[2], this.objects[i]]);
        }

        // draw by depth order
        objs.sort(function (a, b) {
            return b[0] - a[0];
        });
        ii = objs.length;
        for (i = 0; i < ii; i++) {
            objs[i][1].draw();
        }

        // show fps
        this.ctx.fillStyle = 'red';
        this.ctx.font = "20pt Calibri";
        this.ctx.fillText(this.fps + " fps", 10, 30);
    };

    /**
     * @description メインループ。内部的に利用。
     */
    Scene.prototype.mainloop = function () {
        // user function excuted on each frame
        this.onFrame();

        // update (move etc.) all objects and camera
        var i = this.objects.length;
        while (i--) {
            this.objects[i].update();
        }
        this.camera.update();

        // draw scene
        this.draw();

        // user draw function
        this.extraDraw();

        // compute framerate
        this.framecount++;
        var s = new Date().getSeconds();
        if (this.lasttime !== s) {
            this.lasttime = s;
            this.fps = this.framecount;
            this.framecount = 0;
        }
    };

    ////////// Polygon: simple polygon

    /**
     * @name Polygon
     * @class 1枚の多角形を表すクラス
     * @property {Vector} center ポリゴンの中心の座標
     * @property {Vector} color ポリゴンの色
     * @property {Array} v ポリゴンの各頂点の座標
     * @description ポリゴンを作成する
     * @param {Scene} scene 作成対象となるシーン
     * @param {Object} param.v は各頂点を表す配列で各要素は Vector。param.color は面の色を表す RGB の3次元のベクトルで各要素は0から1の値を持つ。param.texture はテクスチャ情報であり setTexture メソッドにそのまま渡される。param.no_light を指定するとライティングが無効となる。param.show_back を指定するとポリゴンの裏面も描画される。
     * @return {K3DObject} 作成された多角形
     */
    function Polygon(scene, param) {
        this.scene = scene;

        // vertex
        this.setVertex(param.v);

        // color
        if (param.color) {
            this.setColor(param.color);
        } else {
            // default
            this.setColor($V([1, 1, 1]));
        }

        // texture
        if (param.texture) {
            this.setTexture(param.texture);
        }

        // lighting
        if (param.no_light) {
            this.no_light = true;
        }

        // backside
        if (param.show_back) {
            this.show_back = true;
        }
    }

    /**
     * @description テクスチャ情報を設定する
     * @param {Object} texture texture.image は Image オブジェクト。texture.v はポリゴンの各座標に対応するテクスチャ画像上での座標。
     */
    Polygon.prototype.setTexture = function (texture) {
        // Image object for texture
        var img = new Image();
        img.src = texture.url;
        texture.image = img;

        // wait for loading
        var self = this;
        img.onload = function () {
            // set parameters
            if (!texture.v) {
                // default mapping
                var tw = texture.image.width - 1;
                var th = texture.image.height - 1;
                texture.v = [$V([0, 0]), $V([0, th]), $V([tw, th]), $V([tw, 0])];
            }
            self.texture = texture;
        };
    };

    /**
     * @description ポリゴンの頂点を設定し、中心座標を計算する
     * @param {Array} v 座標の配列。座標は Vector で与えられる。
     */
    Polygon.prototype.setVertex = function (v) {
        // each vertex
        this.v = v;

        // center of the polygon
        var t = v[0];
        for (var i = 1; i < v.length; i++) {
            t = t.add(v[i]);
        }
        t = t.x(1.0 / v.length);
        this.center = t;
    };

    /**
     * @description ポリゴンの色を設定する
     * @param {Vector} color RGB を表す3次元のベクトルで各要素は0から1の値
     */
    Polygon.prototype.setColor = function (color) {
        this.color = color;
    };

    /**
     * @description ポリゴンの法線ベクトルを求める
     * @return {Vector} 法線ベクトル
     */
    Polygon.prototype.normal = function () {
        var v0v1 = this.v[1].sub(this.v[0]);
        var v0v2 = this.v[2].sub(this.v[0]);
        return v0v1.cross(v0v2).normalize();
    };

    /**
     * @description ポリゴンの中心座標の透視射影変換後の座標を求める
     * @return {Vector} 透視変換後の位置ベクトル
     */
    Polygon.prototype.getPerspectiveCoordinate = function () {
        var p = this.scene.persviewM.dot_v(this.center.to4D());
        return $V([p.e[0] / p.e[3], p.e[1] / p.e[3], p.e[2] / p.e[3]]);
    };

    /**
     * @description ポリゴンと線分との簡単な衝突判定。線分の両端がポリゴンの違う側にあれば衝突とする。
     * @param {Array} point 線分の両端の座標を格納した2次元の配列
     */
    Polygon.prototype.checkCollision = function (points) {
        // TODO 面の中心との距離の利用
        var norm = this.normal();
        if ((norm.dot(points[0]) - Math.PI / 2) * (norm.dot(points[1]) - Math.PI / 2) <= 0) {
            return false;
        }
        return true;
    };

    /**
     * @description シーン上にポリゴンを描画する
     */
    Polygon.prototype.draw = function () {
        var i, ii;

        // check backside
        var angle = this.scene.camera.direction.angleFrom(this.normal());
        if (!this.show_back && angle < 90 * Math.PI / 180) {
            // if backside of the polygon is seen
            return;
        }

        // compute screen coordinate of each vertex
        var v = this.v;
        var points = [];
        ii = v.length;
        for (i = 0; i < ii; i++) {
            // view and perspective translation
            points[i] = this.scene.persviewM.dot_v(v[i].to4D());

            // normalization
            for (var j = 0; j < 4; j++) {
                points[i].e[j] /= points[i].e[3];
            }

            // screen translation
            points[i] = this.scene.screenM.dot_v(points[i]);

            // to int
            points[i] = points[i].toInt();
        }

        // draw
        var c;
        var normal;
        var radian;
        var ctx = this.scene.ctx;
        if (!this.texture) {
            // no texture

            // make path
            ctx.beginPath();
            ctx.moveTo(points[0].e[0], points[0].e[1]);
            ii = points.length;
            for (i = 1; i < ii; i++) {
                ctx.lineTo(points[i].e[0], points[i].e[1]);
            }
            ctx.closePath();

            // compute color
            // color = light.ambient * this.color + light.diffuse * diffuse
            // diffuse = this.color .* light.color * abs(cos(radian))
            normal = this.normal();
            radian = normal.angleFrom(this.scene.light.direction);
            var diffuse = this.color.x_each(this.scene.light.color).x(Math.abs(Math.cos(radian)));
            c = this.color.x(255).x(this.scene.light.ambient).add(diffuse.x(this.scene.light.diffuse));
            ctx.fillStyle = "rgb(" + Math.floor(c.e[0]) + ", " + Math.floor(c.e[1]) + ", " + Math.floor(c.e[2]) + ")";

            // draw
            ctx.fill();
        } else {
            // with texture

            // lighting color
            // color = this.color .* scene.color * abs(cos(radian))
            // color.a = 1 - abs(cos(radian))
            if (!this.no_light) {
                normal = this.normal();
                radian = normal.angleFrom(this.scene.light.direction);
                c = this.color.x_each(this.scene.light.color).x(Math.abs(Math.cos(radian)));
                ctx.fillStyle = "rgba(" + Math.floor(c.e[0]) + ", " + Math.floor(c.e[1]) + ", " + Math.floor(c.e[2]) + ", " + (1 - Math.abs(Math.cos(radian)) / 1.2) + ")";
            }

            // draw par triangle
            ii = points.length - 2;
            for (i = 0; i < ii; i++) {
                // clipping
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(points[0].e[0], points[0].e[1]);
                ctx.lineTo(points[i + 1].e[0], points[i + 1].e[1]);
                ctx.lineTo(points[i + 2].e[0], points[i + 2].e[1]);
                ctx.closePath();
                ctx.clip();

                // draw texture
                var m = makeAffineMatrix(this.texture.v[0], this.texture.v[i + 1], this.texture.v[i + 2], points[0], points[i + 1], points[i + 2]);
                ctx.setTransform(m.e[0][0], m.e[1][0], m.e[0][1], m.e[1][1], m.e[0][2], m.e[1][2]);
                ctx.drawImage(this.texture.image, 0, 0);

                // lighting
                if (!this.no_light) {
                    ctx.fill();
                }
                ctx.restore();
            }
        }
    };

    ////////// K3DObject: general object to handle multi-polygon Object

    /**
     * @name K3DObject
     * @class シーンに存在するオブジェクトを表すクラス
     * @property {Vector} center 中心の座標
     * @property {Vector} direction オブジェクトの前方を示すベクトル
     * @property {Vector} upper オブジェクトの上方を示すベクトル
     * @property {Array} polygons オブジェクトに属するポリゴン
     * @property {Number} size オブジェクトの大まかな大きさ
     * @description オブジェクトを作成する。中心を原点に、y 軸を上方に、z 軸の正方向を持つオブジェクトが作成される。
     * @param {Scene} scene オブジェクトが作成されるシーン
     * @return {K3DObject} 作成されたオブジェクト
     */
    function K3DObject(scene) {
        this.scene = scene;

        // all polygons belong to this object
        this.polygons = [];

        // physical parameter 
        this.center = $V([0, 0, 0]);
        this.upper = $V([0, 1, 0]);
        this.direction = $V([0, 0, 1]);
        this.size = 0;
    }

    /**
     * @description 線分との衝突判定を行う
     * @param {Array} points 線分の両端の位置ベクトルを格納した配列
     */
    K3DObject.prototype.checkCollision = function (points) {
        // check the distance to the point
        if (points[0].sub(this.center).norm() > this.size) {
            return false;
        }
        if (points[1].sub(this.center).norm() > this.size) {
            return false;
        }

        // collision test on each polygon
        var i, ii;
        ii = this.polygons.length;
        for (i = 0; i < ii; i++) {
            if (this.polygons[i].checkCollision(points) === true) {
                return true;
            }
        }

        return false;
    };

    /**
     * @description オブジェクトに新しいポリゴンを追加する
     * @param {Polygon} polygon 追加するポリゴン
     */
    K3DObject.prototype.addPolygon = function (polygon) {
        // add polygon
        this.polygons.push(polygon);

        // compute size of the object
        var i, ii;
        ii = polygon.v.length;
        for (i = 0; i < ii; i++) {
            this.size = Math.max(this.size, polygon.v[i].sub(this.center).norm());
        }
    };

    /**
     * @description オブジェクトをシーン上に描画する
     */
    K3DObject.prototype.draw = function () {
        var ts = [];
        var i, ii;

        // get depth of each polygon
        ii = this.polygons.length;
        for (i = 0; i < ii; i++) {
            ts.push([this.polygons[i].getPerspectiveCoordinate().e[2], this.polygons[i]]);
        }

        // draw by depth order
        ts.sort(function (a, b) {
            return b[0] - a[0];
        });
        ii = ts.length;
        for (i = 0; i < ii; i++) {
            ts[i][1].draw();
        }
    };

    /**
     * @description オブジェクトの中心座標の透視射影変換後の座標を求める
     * @return {Vector} 透視変換後の位置ベクトル
     */
    K3DObject.prototype.getPerspectiveCoordinate = function () {
        var p = this.scene.persviewM.dot_v(this.center.to4D());
        return $V([p.e[0] / p.e[3], p.e[1] / p.e[3], p.e[2] / p.e[3]]);
    };

    /**
     * @description オブジェクトを拡大縮小する
     * @return {Vector} 拡大縮小の倍率。各軸の倍率を格納した3次元の Vector。
     */
    K3DObject.prototype.scale = function (scale_vector) {
        // TODO 回転対応
        var i, ii, j, jj;

        // for each polygon
        ii = this.polygons.length;
        for (i = 0; i < ii; i++) {
            // for each vertex
            var t = this.polygons[i];
            jj = t.v.length;
            for (j = 0; j < jj; j++) {
                // v = (v - center) * scale + center
                t.v[j] = t.v[j].sub(this.center).x_each(scale_vector).add(this.center);
            }
        }
    };

    /**
     * @description オブジェクトをオブジェクト座標をもとに回転する
     * @param {axis} axis 回転軸を表すベクトル
     * @param {radian} radian 回転角の大きさ
     */
    K3DObject.prototype.rotate = function (axis, radian) {
        // rotation matrix
        var R = makeRotationMatrix(axis, radian);

        // rotate upper & direction vector
        this.upper = R.dot_v(this.upper).normalize();
        this.direction = R.dot_v(this.direction).normalize();

        // for each polygon
        var i, ii, j, jj;
        ii = this.polygons.length;
        for (i = 0; i < ii; i++) {
            var t = this.polygons[i];

            // rotation of center of polygon
            t.center = R.dot_v(t.center.sub(this.center)).add(this.center);

            // for each vertex
            jj = t.v.length;
            for (j = 0; j < jj; j++) {
                // v = R * (v - center) + center
                t.v[j] = R.dot_v(t.v[j].sub(this.center)).add(this.center);
            }
        }
    };

    /**
     * @description ローリングする
     * @param {Number} radian 回転角
     */
    K3DObject.prototype.rotateRoll = function (radian) {
        this.rotate(this.direction, radian);
    };

    /**
     * @description ヨーイングする（左右を向く）
     * @param {Number} radian 回転角
     */
    K3DObject.prototype.rotateYaw = function (radian) {
        this.rotate(this.upper, radian);
    };

    /**
     * @description ピッチングする（上下を向く）
     * @param {Number} radian 回転角
     */
    K3DObject.prototype.rotatePitch = function (radian) {
        this.rotate(this.upper.cross(this.direction), radian);
    };

    /**
     * @description 平行移動する
     * @param {Number} speed 移動量
     * @param {Vector} direction 移動方向
     */
    K3DObject.prototype.move = function (speed, direction) {
        // center of object
        this.center = this.center.add(direction.x(speed));

        // for each polygon
        var i, ii, j, jj;
        ii = this.polygons.length;
        for (i = 0; i < ii; i++) {
            var t = this.polygons[i];

            // center of the polygon
            t.center = t.center.add(direction.x(speed));

            // for each vertex
            jj = t.v.length;
            for (j = 0; j < jj; j++) {
                t.v[j] = t.v[j].add(direction.x(speed));
            }
        }
    };

    /**
     * @description 前進する
     * @param {Number} speed 移動量
     */
    K3DObject.prototype.moveForward = function (speed) {
        this.move(speed, this.direction);
    };

    /**
     * @description 上方に移動する
     * @param {Number} speed 移動量
     */
    K3DObject.prototype.moveUp = function (speed) {
        this.move(speed, this.upper);
    };

    /**
     * @description 横向きに移動する
     * @param {Number} speed 移動量
     */
    K3DObject.prototype.moveLeft = function (speed) {
        this.move(speed, this.upper.cross(this.direction));
    };

    /**
     * @description 指定座標へ移動する
     * @param {Vector} to 移動位置
     */
    K3DObject.prototype.moveTo = function (to) {
        var diff = to.sub(this.center);

        // center of object
        this.center = this.center.add(diff);

        // for each polygon
        var i, ii, j, jj;
        ii = this.polygons.length;
        for (i = 0; i < ii; i++) {
            var t = this.polygons[i];

            // center of the polygon
            t.center = t.center.add(diff);

            // for each vertex
            jj = t.v.length;
            for (j = 0; j < jj; j++) {
                t.v[j] = t.v[j].add(diff);
            }
        }
    };

    /**
     * @description 指定した座標の方向を向く
     * @param {Vector} to 注視点の位置ベクトル
     */
    K3DObject.prototype.look = function (to) {
        var old_direction = this.direction;
        var new_direction = to.sub(this.center);

        if (new_direction.norm() < 0.5) {
            // too close to gaze point
            return;
        } else {
            new_direction = new_direction.normalize();
        }

        var radian = old_direction.angleFrom(new_direction);

        // return if radian < 0.1 degree
        if (radian < 0.1 * Math.PI / 180) {
            return;
        }

        var axis;
        if (radian > 175 * Math.PI / 180) {
            // unable to get cross of two vector
            axis = this.upper;
        } else {
            axis = new_direction.cross(old_direction).normalize();
        }

        this.rotate(axis, radian);
        // here, new_direction = this.direction

        // adjust upper (rolling) 
        axis = this.direction;
        radian = this.direction.cross(this.upper).angleFrom(this.direction.cross($V([0, 1, 0])));
        var r = $V([0, 1, 0]).cross(this.upper).angleFrom(this.direction);
        if (r > Math.PI / 2) {
            this.rotateRoll(-radian);
        } else {
            this.rotateRoll(radian);
        }
    };

    /**
     * @description 全てのポリゴンに対し色の設定を行う
     * @param {Vector} color RGB を表す3次元のベクトルで各要素は0から1までの値を持つ
     */
    K3DObject.prototype.setColor = function (color) {
        var i;
        i = this.polygons.length;
        while (i--) {
            this.polygons[i].color = color;
        }
    };

    /**
     * @description set motion pattern of object
     * @param {Array} animation animation.pattern は動作内容の配列。animation.pattern[i][0] は動作の関数。"rotateYaw" "moveForward" など。animation.pattern[i][1] はそれに与える引数。animation.pattern[i][2] はその動きにかける時間（ミリ秒）。これらが順に実行される。animation.repeat を設定すると動作は繰り返される。
     */
    K3DObject.prototype.setAnimation = function (animation) {
        this.animation = clone(animation);
        var anim = this.animation;

        anim.queue = [];
        var i, ii;
        ii = anim.pattern.length;
        for (i = 0; i < ii; i++) {
            anim.queue.push(clone(anim.pattern[i]));
        }
    };

    /**
     * @description 動作パターンを実行する。メインループ内で毎フレームごとに呼び出される。
     */
    K3DObject.prototype.update = function () {
        if (!this.animation) {
            return;
        }

        var anim = this.animation;
        var i, ii;

        // copy anim.pattern to anim.queue if queue is empty 
        if (anim.queue.length === 0 && anim.repeat) {
            ii = anim.pattern.length;
            for (i = 0; i < ii; i++) {
                anim.queue.push(clone(anim.pattern[i]));
            }
        }

        // animation
        if (anim.queue.length !== 0) {
            var q = anim.queue[0];

            // q[3] = q[2] - passed time
            if (!q[3]) {
                q[3] = q[2];
            }

            // next task if task was done
            if (q[3] <= 0) {
                anim.queue.shift();
                return;
            }

            // msec for this frame
            var msec = 1000 / this.scene.fps;
            q[3] -= msec;

            var p;
            switch (q[0]) {
            case "scale":
                var e = [];
                ii = q[1].e.length;
                for (i = 0; i < ii; i++) {
                    e[i] = Math.pow(q[1].e[i], msec / q[2]);
                }
                this.scale($V(e));
                break;
            case "moveUp":
                p = 1.0 * q[1] * (1 / q[2] * msec);
                this.moveUp(p);
                break;
            case "moveLeft":
                p = 1.0 * q[1] * (1 / q[2] * msec);
                this.moveLeft(p);
                break;
            case "moveForward":
                p = 1.0 * q[1] * (1 / q[2] * msec);
                this.moveForward(p);
                break;
            case "rotateYaw":
                p = 1.0 * q[1] * (1 / q[2] * msec);
                this.rotateYaw(p);
                break;
            case "rotateRoll":
                p = 1.0 * q[1] * (1 / q[2] * msec);
                this.rotateRoll(p);
                break;
            case "rotatePitch":
                p = 1.0 * q[1] * (1 / q[2] * msec);
                this.rotatePitch(p);
                break;
            case "look":
                p = q[1];
                this.look(p);
                break;
            }
        }
    };

    ////////// functions to create basic objects: Rectangle, Cube

    /**
     * @name makeRectangle
     * @description 四角形を作成する
     * @param {Scene} scene 四角形が作成されるシーン
     * @param {Object} param ほとんどのパラメタは Polygon のコンストラクタに渡される。param.billboard を指定するとこの四角形はビルボードとなる。 
     * @return {K3dObject} 作成された四角形オブジェクト
     */
    function makeRectangle(scene, param) {
        var rect = new K3DObject(scene);
        param = clone(param);

        // billboard
        if (param.billboard) {
            // set parameters
            param.no_light = true;
            if (param.fix_axis) {
                rect.fix_axis = param.fix_axis;
            }

            // new draw function for billboard
            rect.draw = function () {
                if (!rect.fix_axis) {
                    // sphere etc.
                    rect.look(rect.center.sub(rect.scene.camera.direction));
                } else {
                    // wood etc.
                    // adjust pitching
                    var axis = this.fix_axis;
                    var new_direction = this.scene.camera.direction;
                    var radian = axis.cross(this.direction).angleFrom(axis.cross(new_direction));
                    var r = $V([0, 1, 0]).angleFrom(this.direction.cross(new_direction));
                    if (r < Math.PI / 2) {
                        rect.rotate(axis, - radian);
                    } else {
                        rect.rotate(axis, radian);
                    }
                }
                K3DObject.prototype.draw.call(this);
            };
        }

        rect.addPolygon(new Polygon(scene, param));
        rect.center = rect.polygons[0].center;

        return rect;
    }

    /**
     * @name makeCube
     * @description 中心を原点とし各辺の長さが2である直方体を作成する
     * @param {Scene} scene 作成先のシーン
     * @return {K3DObject} 作成された直方体
     */
    function makeCube(scene) {
        var cube = new K3DObject(scene);

        // 8 verteces
        var v = [];
        v.push($V([-1, 1, - 1]).x(0.5));
        v.push(v[0].x_each($V([1, 1, - 1])));
        v.push(v[0].x_each($V([-1, 1, - 1])));
        v.push(v[0].x_each($V([-1, 1, 1])));
        v.push(v[0].x_each($V([1, - 1, 1])));
        v.push(v[0].x_each($V([1, - 1, - 1])));
        v.push(v[0].x_each($V([-1, - 1, - 1])));
        v.push(v[0].x_each($V([-1, - 1, 1])));

        // 6 faces
        cube.addPolygon(new Polygon(scene, {
            v: [v[0], v[1], v[2], v[3]]
        }));
        cube.addPolygon(new Polygon(scene, {
            v: [v[1], v[5], v[6], v[2]]
        }));
        cube.addPolygon(new Polygon(scene, {
            v: [v[2], v[6], v[7], v[3]]
        }));
        cube.addPolygon(new Polygon(scene, {
            v: [v[3], v[7], v[4], v[0]]
        }));
        cube.addPolygon(new Polygon(scene, {
            v: [v[0], v[4], v[5], v[1]]
        }));
        cube.addPolygon(new Polygon(scene, {
            v: [v[6], v[5], v[4], v[7]]
        }));

        return cube;
    }

    /**
     * @makeNeedle
     * @description 針オブジェクトを作成する
     * @param {Scene} scene 作成先のシーンオブジェクト
     * @param {Object} param param.height、param.width、param.depth は針の外側の大きさ、param.inner_width、param.inner_height は針の穴の大きさ、param.margin_top は針の上端から穴が始まるまでの距離
     * @return {K3DObject} 作成された針
     */
    function makeNeedle(scene, param) {
        var needle = new K3DObject(scene);

        // set parameters
        needle.center = $V([0, param.height, 0]);
        needle.height = param.height;
        needle.width = param.width;
        needle.depth = param.depth;
        needle.inner_width = param.inner_width;
        needle.inner_height = param.inner_height;
        needle.margin_top = param.margin_top;

        var v = [];

        // side, top, bottom
        v.push($V([param.width / 2, 0, param.depth / 2]));
        v.push($V([param.width / 2, 0, - param.depth / 2]));
        v.push($V([-param.width / 2, 0, - param.depth / 2]));
        v.push($V([-param.width / 2, 0, param.depth / 2]));
        v.push($V([param.width / 2, param.height, param.depth / 2]));
        v.push($V([param.width / 2, param.height, - param.depth / 2]));
        v.push($V([-param.width / 2, param.height, - param.depth / 2]));
        v.push($V([-param.width / 2, param.height, param.depth / 2]));

        needle.addPolygon(new Polygon(scene, {
            v: [v[0], v[1], v[2], v[3]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[4], v[0], v[1], v[5]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[6], v[2], v[3], v[7]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[6], v[7], v[4], v[5]]
        }));

        // front
        v.push($V([-param.width / 2, param.height - param.margin_top, param.depth / 2]));
        v.push($V([-param.inner_width / 2, param.height - param.margin_top, param.depth / 2]));
        v.push($V([param.inner_width / 2, param.height - param.margin_top, param.depth / 2]));
        v.push($V([param.width / 2, param.height - param.margin_top, param.depth / 2]));
        v.push($V([-param.width / 2, param.height - param.margin_top - param.inner_height, param.depth / 2]));
        v.push($V([-param.inner_width / 2, param.height - param.margin_top - param.inner_height, param.depth / 2]));
        v.push($V([param.inner_width / 2, param.height - param.margin_top - param.inner_height, param.depth / 2]));
        v.push($V([param.width / 2, param.height - param.margin_top - param.inner_height, param.depth / 2]));

        needle.addPolygon(new Polygon(scene, {
            v: [v[7], v[8], v[11], v[4]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[8], v[12], v[13], v[9]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[10], v[14], v[15], v[11]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[12], v[3], v[0], v[15]]
        }));

        // back
        v.push($V([param.width / 2, param.height - param.margin_top, - param.depth / 2]));
        v.push($V([param.inner_width / 2, param.height - param.margin_top, - param.depth / 2]));
        v.push($V([-param.inner_width / 2, param.height - param.margin_top, - param.depth / 2]));
        v.push($V([-param.width / 2, param.height - param.margin_top, - param.depth / 2]));
        v.push($V([param.width / 2, param.height - param.margin_top - param.inner_height, - param.depth / 2]));
        v.push($V([param.inner_width / 2, param.height - param.margin_top - param.inner_height, - param.depth / 2]));
        v.push($V([-param.inner_width / 2, param.height - param.margin_top - param.inner_height, - param.depth / 2]));
        v.push($V([-param.width / 2, param.height - param.margin_top - param.inner_height, - param.depth / 2]));

        needle.addPolygon(new Polygon(scene, {
            v: [v[5], v[16], v[19], v[6]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[16], v[20], v[21], v[17]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[18], v[22], v[23], v[19]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[20], v[1], v[2], v[23]]
        }));

        // inside
        needle.addPolygon(new Polygon(scene, {
            v: [v[9], v[13], v[22], v[18]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[13], v[14], v[21], v[22]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[14], v[10], v[17], v[21]]
        }));
        needle.addPolygon(new Polygon(scene, {
            v: [v[10], v[9], v[18], v[17]]
        }));

        // make inverse matrix for collision test 
        needle.make_inv = function () {
            var y = needle.upper;
            var z = needle.direction;
            var x = y.cross(z);
            needle.inv_axis = new Matrix(3, 3, false);
            needle.inv_axis.e[0][0] = y.e[1] * z.e[2] - z.e[1] * y.e[2];
            needle.inv_axis.e[0][1] = y.e[2] * z.e[0] - z.e[2] * y.e[0];
            needle.inv_axis.e[0][2] = y.e[0] * z.e[1] - z.e[0] * y.e[1];
            needle.inv_axis.e[1][0] = x.e[2] * z.e[1] - z.e[2] * x.e[1];
            needle.inv_axis.e[1][1] = x.e[0] * z.e[2] - z.e[0] * x.e[2];
            needle.inv_axis.e[1][2] = x.e[1] * z.e[0] - z.e[1] * x.e[0];
            needle.inv_axis.e[2][0] = y.e[2] * x.e[1] - x.e[2] * y.e[1];
            needle.inv_axis.e[2][1] = y.e[0] * x.e[2] - x.e[0] * y.e[2];
            needle.inv_axis.e[2][2] = y.e[1] * x.e[0] - x.e[1] * y.e[0];
        };

        // collision test function
        // param p is a point
        // returns [if in outerbox of needle, if in innerbox of needle]
        needle.in_point = function (p) {
            // object axis
            p = p.sub(this.center);

            // p = combination of axes
            // ret is coefficient
            var ret = this.inv_axis.dot_v(p);

            // check in or not
            var inside_outerbox = false;
            if ((Math.abs(ret.e[0]) < this.width / 2) && (-this.height < ret.e[1] && ret.e[1] < 0) && (Math.abs(ret.e[2]) < this.depth / 2)) {
                inside_outerbox = true;
            }
            var inside_innerbox = false;
            if ((Math.abs(ret.e[0]) < this.inner_width / 2) && ((-this.margin_top - this.inner_height < ret.e[1]) && ret.e[1] < -this.margin_top) && (Math.abs(ret.e[2]) < this.depth / 2)) {
                inside_innerbox = true;
            }
            return [inside_outerbox, inside_innerbox];
        };

        // new rotation function for needle
        needle.rotate = function (axis, radian) {
            K3DObject.prototype.rotate.call(this, axis, radian);
            this.make_inv();
        };

        // make inverse matrix for collision test
        needle.make_inv();

        return needle;
    }


    ////////// Camera: movable Camera

    /**
     * @name Camera
     * @class オブジェクト追跡などを行うカメラ
     * @description 新しくカメラを作成する
     * @param {Scene} scene カメラを適用するシーン
     * @param {Object} param param.center はカメラの中心位置を表すベクトル、param.upper はカメラの上方を表すベクトル、param.direction はカメラの向き
     * @return {Camera} 作成されたカメラ
     * @augments K3DObject
     */
    function Camera(scene, param) {
        // set parameters
        this.scene = scene;
        this.center = param.center;
        this.direction = param.direction;
        this.upper = param.upper;
    }

    // inheritance
    Camera.prototype = new K3DObject();

    // for re-computing view translation matirx
    Camera.prototype.rotate = function (axis, radian) {
        K3DObject.prototype.rotate.call(this, axis, radian);
        this.scene.setViewMatrix();
    };

    Camera.prototype.move = function (speed, direction) {
        K3DObject.prototype.move.call(this, speed, direction);
        this.scene.setViewMatrix();
    };

    Camera.prototype.moveTo = function (to) {
        this.center = to;
        this.scene.setViewMatrix();
    };

    Camera.prototype.look = function (to) {
        K3DObject.prototype.look.call(this, to);
        this.scene.setViewMatrix();
    };

    /**
     * @description カメラの追跡情報を与える
     * @param {K3DObject} obj 追跡対象のオブジェクト
     * @param {Object} param param.type は追跡タイプ。"gom" はオブジェクトとカメラがゴムひもで結ばれているような追跡を行う。"firstperson" は一人称視点。"lookdown" は一定角度で見下ろす。"gaze" はカメラは移動せず物体を注視する。"gom" ではゴムひものバネ定数 param.a と自然長 param.d を与える。"lookdown" ではカメラの上方 param.upper と方向 param.direction と物体までの距離 param.distance を与える。
     */
    Camera.prototype.track = function (obj, param) {
        // set parameters
        this.trackinfo = {};
        this.trackinfo.target = obj;

        this.trackinfo.type = param.tracktype;
        if (this.trackinfo.type === "lookdown") {
            this.trackinfo.upper = param.upper;
            this.trackinfo.direction = param.direction;
            this.trackinfo.distance = param.distance;
        } else if (this.trackinfo.type === "gom") {
            this.velocity = 0;
            this.trackinfo.a = param.a;
            this.trackinfo.v = param.v;
            this.trackinfo.distance = param.distance;
            this.trackinfo.upper = $V([0, 1, 0]);
        }
    };

    /**
     * @description カメラの位置を更新する。内部的に利用。
     */
    Camera.prototype.update = function () {
        if (this.trackinfo) {
            switch (this.trackinfo.type) {
            case "gom":
                // look object
                this.look(this.trackinfo.target.center);

                // adjust upper (rolling)
                var radian = this.direction.cross(this.upper).angleFrom(this.direction.cross(this.trackinfo.upper));
                var r = $V([0, 1, 0]).cross(this.upper).angleFrom(this.direction);
                if (r > Math.PI / 2) {
                    this.rotateRoll(-radian);
                } else {
                    this.rotateRoll(radian);
                }

                // compute velocity of camera
                var d = this.center.sub(this.trackinfo.target.center).norm();
                if (d > this.trackinfo.distance) {
                    var a = this.trackinfo.a / this.scene.fps * (d - this.trackinfo.distance);
                    this.velocity += a;
                }
                this.velocity *= this.trackinfo.v;
                if (d < this.trackinfo.distance / 2) {
                    this.velocity = 0;
                }

                // move
                this.moveForward(this.velocity);
                break;
            case "firstperson":
                this.moveTo(this.trackinfo.target.center);
                this.direction = this.trackinfo.target.direction;
                this.upper = this.trackinfo.target.upper;
                break;
            case "lookdown":
                this.moveTo(this.trackinfo.target.center.add(this.trackinfo.upper.x(this.trackinfo.distance)));
                this.look(this.trackinfo.target.center);
                this.upper = this.trackinfo.direction;
                break;
            case "gaze":
                this.look(this.trackinfo.target.center);
                break;
            }
        }
    };

    ///////// namespace
    /**
     * @namespace
     */
    var Kappa3D = {};

    Kappa3D.clone = clone;
    Kappa3D.makeAffineMatrix = makeAffineMatrix;
    Kappa3D.makeCube = makeCube;
    Kappa3D.makeNeedle = makeNeedle;
    Kappa3D.makeRectangle = makeRectangle;
    Kappa3D.makeRotationMatrix = makeRotationMatrix;
    Kappa3D.removeFromArray = removeFromArray;

    Kappa3D.Camera = Camera;
    Kappa3D.K3DObject = K3DObject;
    Kappa3D.Matrix = Matrix;
    Kappa3D.Polygon = Polygon;
    Kappa3D.Scene = Scene;
    Kappa3D.Vector = Vector;

    global.Kappa3D = Kappa3D;
    global.$V = $V;

}(window));
