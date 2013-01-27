window.onload = function () {
    "use strict";

    var istouch = false;
    var touchX, touchY;
    var keystate = [];
    var score;
    var time;
    var sec;
    var i;

    // hide url bar
    setTimeout(scrollTo, 0, 0, 1);

    // make scene
    var canvas = document.getElementsByTagName("canvas")[0];
    var scene = new Kappa3D.Scene(canvas);

    // make trees
    var trees = [];
    var texture_tree = {};
    texture_tree.url = "tree.png";
    for (i = 0; i < 50; i++) {
        var param_tree = {
            v: [$V([-1, 1, 0]), $V([-1, - 1, 0]), $V([1, - 1, 0]), $V([1, 1, 0])],
            texture: texture_tree,
            no_light: true,
            billboard: true,
            fix_axis: $V([0, 1, 0]),
            show_back: true
        };
        var tree = Kappa3D.makeRectangle(scene, param_tree);
        tree.moveTo($V([(Math.random() - 0.5) * 80, 1, (Math.random() - 0.5) * 80]));
        scene.objects.push(tree);
        trees.push(tree);
    }

    // make spheres
    var spheres = [];
    var texture_sphere = {};
    texture_sphere.url = "sphere.png";
    for (i = 0; i < 50; i++) {
        var param_sphere = {
            v: [$V([-1, 1, 0]), $V([-1, - 1, 0]), $V([1, - 1, 0]), $V([1, 1, 0])],
            texture: texture_sphere,
            no_light: true,
            billboard: true
        };
        var sphere = Kappa3D.makeRectangle(scene, param_sphere);
        sphere.moveTo($V([(Math.random() - 0.5) * 80, Math.random() * 4, (Math.random() - 0.5) * 80]));
        scene.objects.push(sphere);
        spheres.push(sphere);
    }

    // make cube
    var cube = new Kappa3D.makeCube(scene);
    cube.moveTo($V([0, 0, 0]));
    scene.objects.push(cube);

    // camera settings
    scene.camera.moveTo($V([0, 20, - 100]));
    scene.camera.track(cube, {
        tracktype: "gom",
        a: 0.05,
        distance: 5,
        v: 0.9
    });

    // set animation of spheres
    var animation1 = {
        pattern: [
            ["moveLeft", 3, 2000],
            ["moveLeft", - 3, 2000]
        ],
        repeat: true
    };
    var animation2 = {
        pattern: [
            ["moveUp", 3, 2000],
            ["moveUp", - 3, 2000]
        ],
        repeat: true
    };
    var animation3 = {
        pattern: [
            ["scale", $V([2, 2, 2]), 500],
            ["scale", $V([0.5, 0.5, 0.5]), 500]
        ],
        repeat: true
    };
    for (i = 0; i < spheres.length; i++) {
        if (Math.random() < 0.1) {
            spheres[i].setAnimation(animation1);
        }
        if (Math.random() < 0.1) {
            spheres[i].setAnimation(animation2);
        }
        if (Math.random() < 0.1) {
            spheres[i].setAnimation(animation3);
        }
    }

    // key state
    window.onkeydown = function (e) {
        keystate[e.keyCode] = true;
    };
    window.onkeyup = function (e) {
        keystate[e.keyCode] = false;
    };

    // touch state
    window.addEventListener('touchstart', function () {
        istouch = true;
        touchX = event.changedTouches[0].pageX;
        touchY = event.changedTouches[0].pageY;
    }, false);
    window.addEventListener('touchmove', function () {
        touchX = event.changedTouches[0].pageX;
        touchY = event.changedTouches[0].pageY;
    }, false);
    window.addEventListener('touchend', function () {
        istouch = false;
    }, false);

    // prevent scroll
    var preventScroll = function (event) {
        event.preventDefault();
    };
    document.addEventListener("touchstart", preventScroll, false);
    document.addEventListener("touchmove", preventScroll, false);
    document.addEventListener("touchend", preventScroll, false);
    document.addEventListener("gesturestart", preventScroll, false);
    document.addEventListener("gesturechange", preventScroll, false);
    document.addEventListener("gestureend", preventScroll, false);

    // game start
    scene.startMainloop();
    gameover();

    // start function
    function gameover() {
        cube.moveTo($V([0, 0, 0]));
        cube.look($V([0, 0, 1]));
        score = 0;
        time = 60;
        scene.camera.moveTo($V([0, 20, - 100]));
        sec = new Date().getSeconds();
    }

    // frame function
    scene.onFrame = function () {
        if ((keystate[70]) || (50 < touchX && touchX < 80 && 210 < touchY && touchY < 240)) {
            // move forward
            var old_pos = cube.center;
            cube.moveForward(10.0 / scene.fps);
            if (cube.center.e[1] < 0) {
                cube.moveTo($V([cube.center.e[0], 0, cube.center.e[2]]));
            }
            if (cube.center.e[1] > 5) {
                cube.moveTo($V([cube.center.e[0], 5, cube.center.e[2]]));
            }
            var new_pos = cube.center;

            // check collision
            var i, ii;
            ii = trees.length;
            for (i = 0; i < ii; i++) {
                if (trees[i].checkCollision([new_pos, old_pos]) === true) {
                    // hit tree
                    gameover();
                    break;
                }
            }

            ii = spheres.length;
            for (i = 0; i < ii; i++) {
                if (spheres[i].checkCollision([new_pos, old_pos]) === true) {
                    // hit sphere
                    Kappa3D.removeFromArray(spheres[i], scene.objects);
                    Kappa3D.removeFromArray(spheres[i], spheres);
                    score += 1;
                    break;
                }
            }
        }

        // move by player
        if ((keystate[72]) || (20 < touchX && touchX < 50 && 210 < touchY && touchY < 240)) {
            cube.rotateYaw(-2.0 / scene.fps);
        }
        if ((keystate[76]) || (80 < touchX && touchX < 110 && 210 < touchY && touchY < 240)) {
            cube.rotateYaw(2.0 / scene.fps);
        }
        if ((keystate[74]) || (50 < touchX && touchX < 80 && 240 < touchY && touchY < 270)) {
            cube.rotatePitch(-2.0 / scene.fps);
        }
        if ((keystate[75]) || (50 < touchX && touchX < 80 && 180 < touchY && touchY < 210)) {
            cube.rotatePitch(2.0 / scene.fps);
        }

        // timer
        var t = new Date().getSeconds();
        if (t !== sec) {
            sec = t;
            time -= 1;
        }
    };

    // draw score and time
    scene.extraDraw = function () {
        // score
        this.ctx.font = "20pt Calibri";
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillText("Score: " + score, 200, 30);
        this.ctx.fillStyle = 'blue';
        this.ctx.fillText("Time: " + time, 200, 60);
        if (time === 0) {
            window.alert("your score: " + score);
            gameover();
        }

        // timer
        this.ctx.fillStyle = "rgba(0,0,255, 0.5)";
        this.ctx.fillRect(50, 180, 30, 30);
        this.ctx.fillRect(20, 210, 30, 30);
        this.ctx.fillRect(80, 210, 30, 30);
        this.ctx.fillRect(50, 240, 30, 30);

        this.ctx.fillStyle = 'yellow';
        this.ctx.fillText("Score: " + score, 200, 30);
    };
};
