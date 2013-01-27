"use strict";

var scene;
var title_logo;

function game_start() {
    var istouch = false;
    var touchX, touchY;
    var score;
    var keystate = [];

    /* variable initialization */
    score = 0;

    /* make needles */
    var needles = [];
    var next_needle = 0;
    var needle_pos = [$V([0, 0.5, 40]), $V([0, - 2, 30]), $V([5, - 2, 20])];
    var needle_yaw = [0, 0, Math.PI / 4];
    for (var i = 0; i < needle_pos.length; i++) {
        var needle = Kappa3D.makeNeedle(scene, {
            width: 1,
            height: 20,
            depth: 1,
            inner_width: 0.8,
            inner_height: 1.6,
            margin_top: 0.2
        });
        needle.setColor($V([0.8, 0.8, 0.8]));
        needle.moveTo(needle_pos[i]);
        needle.rotateYaw(needle_yaw[i]);
        scene.objects.push(needle);
        needles.push(needle);
    }
    needles[0].setColor($V([0.6, 0.6, 1]));

    /* make string head */
    var str_head = new Kappa3D.K3DObject(scene);
    scene.objects.push(str_head);
    str_head.moveTo($V([0, 0, 50]));
    str_head.look($V([0, 0, 0]));
    var str_obj = [];
    var str_count = 0;

    /* set camera */
    scene.camera.moveTo($V([20, 10, 60]));
    scene.camera.track(str_head, {
        tracktype: "gom",
        a: 0.05,
        distance: 1,
        v: 0.9
    });
    
    // touch state
    window.addEventListener('touchstart', function (event) {
        istouch = true;
        touchX = event.changedTouches[0].pageX;
        touchY = event.changedTouches[0].pageY;
    }, false);
    window.addEventListener('touchmove', function (event) {
        touchX = event.changedTouches[0].pageX;
        touchY = event.changedTouches[0].pageY;
    }, false);
    window.addEventListener('touchend', function () {
        istouch = false;
    }, false);

    // key state
    window.onkeydown = function (e) {
        keystate[e.keyCode] = true;
    };
    window.onkeyup = function (e) {
        keystate[e.keyCode] = false;
    };

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

    // mainloop
    var str_last_vertex = [];
    scene.onFrame = function () {
        // rotate string
        if (istouch) {
            if (50 < touchX && touchX < 80 && 180 < touchY && touchY < 210) {
                str_head.rotatePitch(2.0 / scene.fps);
            }
            if (50 < touchX && touchX < 80 && 240 < touchY && touchY < 270) {
                str_head.rotatePitch(-2.0 / scene.fps);
            }
            if (20 < touchX && touchX < 50 && 210 < touchY && touchY < 240) {
                str_head.rotateYaw(-2.0 / scene.fps);
            }
            if (80 < touchX && touchX < 110 && 210 < touchY && touchY < 240) {
                str_head.rotateYaw(2.0 / scene.fps);
            }
        }
        if (keystate[72]) {
            str_head.rotateYaw(-2.0 / scene.fps);
        }
        if (keystate[76]) {
            str_head.rotateYaw(2.0 / scene.fps);
        }
        if (keystate[74]) {
            str_head.rotatePitch(-2.0 / scene.fps);
        }
        if (keystate[75]) {
            str_head.rotatePitch(2.0 / scene.fps);
        }

        // move string 
        str_head.moveForward(1.0 / scene.fps);

        // collision test
        for (var i = 0; i < needles.length; i++) {
            var collision = needles[i].in_point(str_head.center);
            if (collision[0] && !collision[1]) {
                // hit needle
                for (i = 0; i < str_obj.length; i++) {
                    Kappa3D.removeFromArray(str_obj[i], scene.objects);
                }
                str_head.moveTo($V([0, 0, 50]));
                str_head.look($V([0, 0, 0]));
                scene.camera.moveTo($V([20, 10, 60]));
                needles[next_needle].setColor($V([0.8, 0.8, 0.8]));
                needles[0].setColor($V([0.6, 0.6, 1]));
                str_last_vertex = [];
                score = 0;
                next_needle = 0;
            }
            if (collision[1] && i === next_needle) {
                // pass needle
                score += 1;
                next_needle++;
                make_new_needle();
                needles[i].setColor($V([0.8, 0.8, 0.8]));
                needles[next_needle].setColor($V([0.6, 0.6, 1]));
            }
        }

        // expand string
        var p = (scene.fps < 40) ? 4 : 50;
        if (scene.framecount % p === 0) {
            var str_vertex = [];
            var center = str_head.center;
            var upper = str_head.upper.x(0.1);
            var cross = upper.cross(str_head.direction);
            str_vertex.push(upper.add(cross).add(center));
            str_vertex.push(upper.add(cross.x(-1)).add(center));
            str_vertex.push(upper.x(-1).add(cross.x(-1)).add(center));
            str_vertex.push(upper.x(-1).add(cross).add(center));

            if (str_last_vertex.length !== 0) {
                var tmp;
                tmp = new Kappa3D.K3DObject(scene);
                tmp.addPolygon(new Kappa3D.Polygon(scene, {
                    v: [str_vertex[0], str_last_vertex[0], str_last_vertex[1], str_vertex[1]]
                }));
                tmp.addPolygon(new Kappa3D.Polygon(scene, {
                    v: [str_vertex[1], str_last_vertex[1], str_last_vertex[2], str_vertex[2]]
                }));
                tmp.addPolygon(new Kappa3D.Polygon(scene, {
                    v: [str_vertex[2], str_last_vertex[2], str_last_vertex[3], str_vertex[3]]
                }));
                tmp.addPolygon(new Kappa3D.Polygon(scene, {
                    v: [str_vertex[3], str_last_vertex[3], str_last_vertex[0], str_vertex[0]]
                }));
                tmp.center = Kappa3D.clone(str_head.center);
                Kappa3D.removeFromArray(str_obj[str_count], scene.objects);
                str_obj[str_count] = tmp;
                scene.objects.push(tmp);

                str_count++;
                if (str_count === 30) {
                    str_count = 0;
                }
            }
            str_last_vertex = str_vertex;
        }
    };

    scene.extraDraw = function () {
        // controller for mobile 
        this.ctx.fillStyle = "rgba(0,0,255, 0.5)";
        this.ctx.fillRect(50, 180, 30, 30);
        this.ctx.fillRect(20, 210, 30, 30);
        this.ctx.fillRect(80, 210, 30, 30);
        this.ctx.fillRect(50, 240, 30, 30);

        this.ctx.fillStyle = 'yellow';
        this.ctx.font = "20pt Calibri";
        this.ctx.fillText("Score: " + score, 200, 30);
    };

    function make_new_needle() {
        var last_needle = needles[needles.length - 1];
        var new_pos = last_needle.center.sub(last_needle.direction.x(10));
        new_pos = new_pos.add($V([(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4]));
        var new_yaw = (Math.random() - 0.5) * Math.PI / 2;
        var new_needle = Kappa3D.makeNeedle(scene, {
            width: 1,
            height: 20,
            depth: 1,
            inner_width: 0.8,
            inner_height: 1.6,
            margin_top: 0.2
        });
        new_needle.setColor($V([0.8, 0.8, 0.8]));
        new_needle.rotateYaw(new_yaw);
        new_needle.moveTo(new_pos);
        scene.objects.push(new_needle);
        needles.push(new_needle);
    }
}

// wait function for start
function onTitleTouch() {
    document.removeEventListener("click", onTitleTouch);
    document.removeEventListener("touchstart", onTitleTouch);
    game_start();
}

// show title logo
function onTitleLogoLoaded() {
    // draw title logo
    scene.extraDraw = function () {
        this.ctx.drawImage(title_logo, (this.canvas.width - title_logo.width) / 2, (this.canvas.height - title_logo.height) / 2);
    };

    // start mainloop
    scene.startMainloop();

    // wait for touch
    document.addEventListener("click", onTitleTouch, false);
    document.addEventListener("touchstart", onTitleTouch, false);
}

// init function
window.addEventListener("load", function () {
    // hide url bar
    setTimeout(scrollTo, 0, 0, 1);

    // make scene
    var canvas = document.getElementsByTagName("canvas")[0];
    scene = new Kappa3D.Scene(canvas);
    //scene.light.ambient = 0.5;

    // load title image
    title_logo = new Image();
    title_logo.src = "demo1.jpg";
    title_logo.onload = onTitleLogoLoaded;
}, false);
