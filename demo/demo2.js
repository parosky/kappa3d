window.onload = function () {
    "use strict";

    // hide url bar
    setTimeout(scrollTo, 0, 0, 1);

    // make scene
    var canvas = document.getElementsByTagName("canvas")[0];
    var scene = new Kappa3D.Scene(canvas);

    // make floor
    for (var i = -10; i < 10; i++) {
        for (var j = -10; j < 10; j++) {
            var temp_floor = Kappa3D.makeRectangle(scene, {
                v: [$V([i * 4, 0, j * 4]), $V([(i + 1) * 4, 0, (j) * 4]), $V([(i + 1) * 4, 0, (j + 1) * 4]), $V([i * 4, 0, (j + 1) * 4])],
                color: $V([0, 1, 0]),
                show_back: true
            });
            scene.objects.push(temp_floor);
        }
    }

    // make kappa
    var texture = {};
    texture.url = "demo2.jpg";
    for (i = 0; i < 50; i++) {
        var kappa = Kappa3D.makeRectangle(scene, {
            v: [$V([-1, 1, 0]), $V([-1, - 1, 0]), $V([1, - 1, 0]), $V([1, 1, 0])],
            texture: texture,
            show_back: true
        });
        kappa.moveTo($V([(Math.random() - 0.5) * 80, 1, (Math.random() - 0.5) * 80]));
        kappa.rotateYaw(Math.random() * 2 * Math.PI);
        scene.objects.push(kappa);
    }

    // make cube
    var cube = new Kappa3D.makeCube(scene);
    cube.moveTo($V([0, 4, 0]));
    scene.objects.push(cube);

    // camera settings
    scene.camera.moveTo($V([0, 20, 0]));
    scene.camera.track(cube, {
        tracktype: "gom",
        a: 0.05,
        distance: 5,
        v: 0.9
    });

    // mainloop
    scene.onFrame = function () {
        cube.moveForward(3.0 / scene.fps);
        cube.rotateYaw(0.3 / scene.fps);

    };

    // start
    scene.startMainloop();

    // selectbox for camera type
    document.getElementById("selectbox").onchange = function () {
        switch (this.selectedIndex) {

        case 0:
            // gom
            scene.camera.track(cube, {
                tracktype: "gom",
                a: 0.05,
                distance: 5,
                v: 0.9
            });
            scene.camera.upper = $V([0, 1, 0]);
            break;

        case 1:
            // firstperson
            scene.camera.track(cube, {
                tracktype: "firstperson"
            });
            scene.camera.upper = $V([0, 1, 0]);
            break;

        case 2:
            // lookdown
            scene.camera.track(cube, {
                tracktype: "lookdown",
                upper: $V([0, 1, 1]).normalize(),
                direction: $V([0, 0, - 1]),
                distance: 10
            });
            break;

        case 3:
            // gaze
            scene.camera.moveTo($V([0, 20, 0]));
            scene.camera.track(cube, {
                tracktype: "gaze"
            });
            break;
        }
    };

    // slider for light settings
    var func_slider = function () {
        var r = document.getElementById("R").value;
        var g = document.getElementById("G").value;
        var b = document.getElementById("B").value;
        var al = document.getElementById("Al").value;
        var az = document.getElementById("Az").value;
        scene.light.color = $V([r, g, b]);
        scene.light.direction = $V([0, 0, 1]);
        scene.light.direction = Kappa3D.makeRotationMatrix($V([0, 1, 0]), (az - 180) * Math.PI / 180).dot_v(scene.light.direction);
        scene.light.direction = Kappa3D.makeRotationMatrix($V([1, 0, 0]), al * Math.PI / 180).dot_v(scene.light.direction);
    };

    document.getElementById("R").onchange = func_slider;
    document.getElementById("G").onchange = func_slider;
    document.getElementById("B").onchange = func_slider;
    document.getElementById("Al").onchange = func_slider;
    document.getElementById("Az").onchange = func_slider;
};
