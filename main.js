require([
    'src/LightingScene'
], function(
    LightingScene
){
    'use strict';

    var scene = new LightingScene();

    scene.appendTo(document.body);

    function tick(){
        requestAnimationFrame(tick);

        scene.render();
    }
    tick();
});
