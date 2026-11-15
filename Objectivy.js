
/**
%cube centerRelativeX centerRelativeY centerRelativeZ Width Heigth Depth r g b
%ball centerRelativeX centerRelativeY centerRelativeZ Radio r g b
 */

// Objetivy.js for create dinamically objects in one 3d model
import * as THREE from "./three.js";

export class Objetivy {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
    }
    cube(x, y, z, width, height, depth, material) {
        const geometry = new THREE.BoxGeometry(
            width,
            height,
            depth
        );

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(x, y, z);

        this.scene.add(mesh);
        this.objects.push(mesh);

        return mesh;
    }
    ball(x, y, z, radius, material) {
        const geometry = new THREE.SphereGeometry(radius);

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(x, y, z);

        this.scene.add(mesh);
        this.objects.push(mesh);

        return mesh;
    }
    renderNew(mod, pos=[0,0,0], scale=[1,1,1]) {
        let ax = new ObjetivyInterpretator(mod);
        
        ax.actor(this, pos, scale);
    }
}

export class ObjetivyInterpretator {
    constructor(fileCode) {
        this.wat = [];
        for (let a of fileCode.split(/\r?\n/)) {
            this.wat.push(...this.lineInterpretator(a))
        }
    }
    lineInterpretator(line) {
        console.log(line)
        if (typeof line !== 'string')
            throw new Error('not a string');
        
        let litri = line.trim();

        if (litri == '')
            return [];

        const regex = /%(cube|ball)\s+((?:-?\d+(?:\.\d+)?\s*)+)/g;
        let net = [];

        const expected = {
            cube: 6,
            ball: 4
        };

        for (const match of litri.matchAll(regex)) {
            const type = match[1];
            const values = match[2].trim().split(/\s+/).map(Number);

            let color = [255, 255, 255];

            if (values.length === expected[type] + 3) {
                color = values.slice(-3);
            }
            else if (values.length !== expected[type]) {
                throw new Error(`Invalid arguments for ${type}`);
            }

            net.push({
                type,
                relativePos: values.slice(0, 3),
                values: values.slice(3, expected[type]),
                color
            });
        }

        return net;
    }
    actor(scene, position = [0, 0, 0], size = [1, 1, 1]) {
        if (!(scene instanceof Objetivy))
            throw new Error('scene must be Objetivy');

        // Record the things
        for (const item of this.wat) {
            const { color, relativePos, type, values } = item;
            const relCalc = [relativePos[0] * size[0],relativePos[1] * size[1],relativePos[2] * size[2]];
            const absPos =  [ position[0] + relCalc[0], position[1] + relCalc[1], position[2] + relCalc[2]];
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setRGB(
                    color[0] / 255,
                    color[1] / 255,
                    color[2] / 255
                )
            });

            // Radio Case
            if (type === 'ball') {
                const radio = values[0] * size[0];
                scene.ball(absPos[0], absPos[1], absPos[2],radio, material);
            }
            // Not radio case
            else {
                const sizeCalc = [
                    values[0] * size[0],
                    values[1] * size[1],
                    values[2] * size[2]
                ]

                if (type === 'cube') {
                    scene.cube(absPos[0], absPos[1], absPos[2],sizeCalc[0], sizeCalc[1], sizeCalc[2], material);
                }
            }
        }

        return scene;
    }
}

export function initCanvas() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.z = 5;
    camera.position.y = 2

    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);

    const sunlight = new THREE.DirectionalLight(0xffffff, 2);
    sunlight.position.set(5, 10, 5);
    scene.add(sunlight);

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        'ClientRes/px.png',
        'ClientRes/px.png',
        'ClientRes/skyup.png',
        'ClientRes/skydown.png',
        'ClientRes/px.png',
        'ClientRes/px.png',
    ]);

    scene.background = texture;
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    function animate() {
        requestAnimationFrame(animate);

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return new Objetivy(scene);
}