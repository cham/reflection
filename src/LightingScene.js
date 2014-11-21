define(function(){
    'use strict';

    function windowSize(){
        return {
            width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        };
    }

    function renderer(){
        var glRenderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        
        glRenderer.shadowMapEnabled = true;
        glRenderer.shadowMapType = THREE.PCFSoftShadowMap;
        glRenderer.setClearColor(0xffffff, 1);

        return glRenderer;
    }

    function texturecamera(){
        var wSize = windowSize();
        var cam = new THREE.PerspectiveCamera(45, 1, 0.1, 20000);
        
        cam.position.set(0, -117, 0);
        cam.target = new THREE.Vector3(0, 1, 0);
        cam.lookAt(cam.target);

        return cam;
    }

    function camera(){
        var wSize = windowSize();
        var cam = new THREE.PerspectiveCamera(40, wSize.width / wSize.height, 1, 20000);
        
        cam.position.set(0, 100, -1000);
        cam.target = new THREE.Vector3(0, 0, 0);
        cam.lookAt(cam.target);

        return cam;
    }

    function rotateCamera(cam, ticks){
        var cameraDistance = 100;
        cam.position.x = Math.sin(ticks*0.01) * cameraDistance;
        cam.position.z = Math.cos(ticks*0.01) * cameraDistance;

        cam.target = new THREE.Vector3(0, 0, 0);
        cam.lookAt(cam.target);
    }

    function spotlight(colour, x, y, z){
        var light = new THREE.SpotLight(colour, 1);

        light.position.set(x, y, z);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadowDarkness = 0.5;
        light.shadowMapWidth = 1024;
        light.shadowMapHeight = 1024;

        return light;
    }

    function lighting(){
        var group = new THREE.Group();

        group.add(spotlight(0xcccccc, 100, 100, -100));
        group.add(spotlight(0xcccccc, -100, 100, -100));

        return group;
    }

    function mirrorplane(renderTarget){
        var geometry = new THREE.PlaneBufferGeometry(100, 100, 10, 10);
        var solidMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            opacity: 0.4,
            transparent: true,
            shininess: 60
        });
        var material = new THREE.MeshBasicMaterial({map: renderTarget});
        var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
            material,
            solidMaterial
        ]);

        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = -Math.PI / 2;

        return mesh;
    }

    function box(){
        var geometry = new THREE.BoxGeometry(10, 10, 10);
        var material  = new THREE.MeshLambertMaterial({
            color: 0xff0000
        });
        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(0, 10, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        function tick(){
            requestAnimationFrame(tick);
            mesh.rotation.y += 0.07;
            mesh.rotation.z += 0.07;
        }
        tick();

        return mesh;
    }

    function knot(){
        var geometry = new THREE.TorusKnotGeometry(10, 2, 64, 64, 1);
        var material  = new THREE.MeshLambertMaterial({
            color: 0x0000ff
        });
        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(30, 20, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        function tick(){
            requestAnimationFrame(tick);
            mesh.rotation.x += 0.05;
        }
        tick();

        return mesh;
    }

    function text(){
        var geometry = new THREE.TextGeometry('BEES', {
            size: 10,
            height: 2
        });
        var material  = new THREE.MeshLambertMaterial({
            color: 0xffff00
        });
        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(-50, 20, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        function tick(){
            requestAnimationFrame(tick);
            mesh.rotation.x -= 0.03;
        }
        tick();

        return mesh;
    }

    function LightingScene(){
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0xffffff, 0.005);
        this.renderer = renderer();
        this.camera = camera();
        this.textureCamera = texturecamera();
        this.mirrorTarget = new THREE.WebGLRenderTarget(512, 512, {format: THREE.RGBFormat});
        this.flipTarget = new THREE.WebGLRenderTarget(512, 512, {format: THREE.RGBFormat});

        this.plane = mirrorplane(this.mirrorTarget);

        this.scene.add(this.textureCamera);
        this.scene.add(this.plane);
        this.scene.add(lighting());
        this.scene.add(box());
        this.scene.add(knot());
        this.scene.add(text());

        this.resize();
        this.animate();
    }

    LightingScene.prototype.resize = function resize(){
        var wSize = windowSize();
        this.renderer.setSize(wSize.width, wSize.height);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        // this.textureCamera.aspect = window.innerWidth / window.innerHeight;
        this.textureCamera.updateProjectionMatrix();
    };

    LightingScene.prototype.animate = function(){
        var cam = this.camera;
        var numTicks = 0;

        function tick(){
            requestAnimationFrame(tick);
            rotateCamera(cam, numTicks++);
        }
        tick();
    };

    LightingScene.prototype.appendTo = function appendTo(node){
        node.appendChild(this.renderer.domElement);
    };

    LightingScene.prototype.render = function render(){
    this.plane.visible = false;
    this.renderer.render(this.scene, this.textureCamera, this.mirrorTarget, true);
    this.plane.visible = true;

    // slight problem: texture is mirrored.
    //    solve problem by rendering (and hence mirroring) the texture again
    
    // render another scene containing just a quad with the texture
    //    and put the result into the final texture
    // renderer.render( screenScene, screenCamera, finalRenderTarget, true );
    
        this.renderer.render(this.scene, this.camera);
    };

    return LightingScene;

});
