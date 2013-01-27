window.onload = function () {
    "use strict";

    // hide url bar
    setTimeout(scrollTo, 0, 0, 1);

    // make scene
    var canvas = document.getElementById("canvas");
    var scene = new Kappa3D.Scene(canvas);


    /* make textured polygon */
    var param1 = {};

    // vertices
    param1.v = [$V([-2, 1, 0]), $V([-2, - 1, 0]), $V([2, - 1, 0]), $V([2, 1, 0])];

    // texture
    param1.texture = {};
    param1.texture.url = "demo3.jpg";

    // disable hidden surface removal
    param1.show_back = true;

    // make rectangle
    var obj1 = Kappa3D.makeRectangle(scene, param1);

    // add to scene
    scene.objects.push(obj1);


    /* make cube */
    var obj2 = Kappa3D.makeCube(scene);

    // add to scene
    scene.objects.push(obj2);

    // move
    obj2.moveTo($V([1, 0, 2]));


    /* function executed at each frame */
    scene.onFrame = function () {
        obj1.rotatePitch(0.4 / scene.fps);
        obj2.rotateYaw(1.0 / scene.fps);
        obj2.rotateRoll(0.7 / scene.fps);
        obj2.rotatePitch(0.3 / scene.fps);
    };


    /* additional draw function */
    scene.extraDraw = function () {
        this.ctx.fillStyle = 'blue';
        this.ctx.font = "15pt Calibri";
        this.ctx.fillText("Simple Kappa3D Demo", 10, 60);
    };


    /* camera tracking */
    scene.camera.track(obj1, {
        tracktype: "gom",
        a: 0.05,
        distance: 5,
        v: 0.9
    });


    /* run */
    scene.startMainloop();
};
