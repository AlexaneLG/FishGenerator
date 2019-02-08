/* constants
-------------------------------------------------------------*/
let boid;
let creatureMeshGroup = new THREE.Group();
let creatureObjectGroup = new THREE.Group();

const colorPalette = {
    screenBg: 0x041f60,
    containerBox: 0xffffff,
    ambientLight: 0x666666,
    directionalLight: 0xb4f5f0,
    spotLight: 0x2ceef0,
    seaweed: 0x1ea055
}

// Options to be added to the GUI
let gui = new dat.GUI();
let nMaxGens = gui.addFolder('Number of generations');
let nFirstGen = gui.addFolder('Number of fishes in first generation');
let nChilds = gui.addFolder('Number of fishes in next generations');

let options = {
  nMaxGens: 2,
  nFirstGen: 4,
  nChilds: 5,
  Generate: function() {
    //removeEntities('fish');
    createAndDisplayFishes();
    generateBoid();
    
  }
};

nMaxGens.add(options, 'nMaxGens', 1, 10, 1).listen();
nMaxGens.open();

nFirstGen.add(options, 'nFirstGen', 1, 10, 1).listen();
nFirstGen.open();

nChilds.add(options, 'nChilds', 1, 10, 1).listen();
nChilds.open();

gui.add(options, 'Generate');

// load fixed scene obj and mtl
let mtlLoader = new THREE.MTLLoader();
mtlLoader.load('models/fixed-scene.mtl', function ( materials ){
		materials.preload();
		let objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.load('models/fixed-scene.obj', function ( mesh ){
				mesh.traverse( function ( child ) {
		        	if ( child instanceof THREE.Mesh ) {
		        		child.material.flatShading = true;
		            }
		        });
				mesh.receiveShadow = true;
				mesh.castShadow = true;
				scene.add(mesh);
				mesh.position.set(0, -200, 10);
				mesh.rotation.set(0, -Math.PI, 0);
			}
		);
	}
);

// load animated seaweeds
let seaweedMeshes = [];
let mixers = [];
let clock = new THREE.Clock; 
let jsonLoader = new THREE.JDLoader();

loadSeaweed(-100, -195, 140, 0, Math.PI/2, 0);
loadSeaweed(-50, -197, -140, 0, -Math.PI/3, 0);

// set ocean
const verticesSegments = 15;
let waterGeo = new THREE.PlaneGeometry(490, 490, verticesSegments, verticesSegments);
let waterMat = new THREE.MeshPhongMaterial({
  color: 0x00aeff,
  emissive: 0x0023b9,
  flatShading: true,
  shininess: 100,
  specular: 30,
  transparent: true,
  opacity: 0.5,
  reflectivity: 1,
  side: THREE.DoubleSide
});

for (let j = 0; j < waterGeo.vertices.length; j++) {
  waterGeo.vertices[j].x = waterGeo.vertices[j].x + Math.random() * Math.random() * 30;
  waterGeo.vertices[j].y = waterGeo.vertices[j].y + Math.random() * Math.random() * 20;
}

/* LOOPS
-------------------------------------------------------------*/

const render = () => {
    controls.update();
    renderer.render( scene, camera );
}

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

let count = 0;
let update = function () {
	// game logic
	boid.update();

	let delta = clock.getDelta();
	for (let i = 0; i < mixers.length; ++i) {
    	mixers[i].update(delta);
	}	

	// animate ocean
	let i = 0;
	for (let ix = 0; ix < verticesSegments; ix++) {
	    for (let iy = 0; iy < verticesSegments; iy++) {
	      waterObj.geometry.vertices[i++].z = Math.sin((ix + count) * 2) * 3 + Math.cos((iy + count) * 1.5) * 6;
	      waterObj.geometry.verticesNeedUpdate = true;
	    }
	}
	count += 0.015;
		
};

let GameLoop = function () {
	requestAnimationFrame(GameLoop);
	update();
	render();
};

/* CLASSES
-------------------------------------------------------------*/
class BoxContainer {
    constructor(width = 480, height = 400, depth = 500, color = 0xffffff) {
        const geometry = new THREE.BoxGeometry(width, height, depth, 10, 10, 10);
        const material = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            wireframe: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        this.mesh = new THREE.Mesh(geometry, material);
    }
}

/* scene
-------------------------------------------------------------*/
let scene = new THREE.Scene();
//scene.fog = new THREE.Fog(colorPalette.screenBg, 0, 1200);

/* camera
-------------------------------------------------------------*/
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-400, 0, 0);
camera.lookAt(scene.position);
scene.add(camera);

/* renderer
-------------------------------------------------------------*/
let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
renderer.setClearColor ( colorPalette.screenBg, 1 );
document.body.appendChild(renderer.domElement);

/* AmbientLight
-------------------------------------------------------------*/
var ambientLight = new THREE.AmbientLight( colorPalette.ambientLight, 1.0 );
scene.add (ambientLight);

/* SpotLight
-------------------------------------------------------------*/
const spotLight = new THREE.SpotLight(colorPalette.spotLight);
spotLight.angle = Math.PI / 4;
spotLight.intensity = 9;
spotLight.decay = 4;
spotLight.distance = 9000;
spotLight.penumbra = 1.0;
spotLight.position.set(-2200, 3000, 0);
scene.add(spotLight);

/* PointLight
-------------------------------------------------------------*/
var pointLight = new THREE.PointLight( 0x174a84, 0.8, 18 );
pointLight.position.set(0, 0, 0);
pointLight.castShadow = true;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 50; //25
scene.add(pointLight);

/* BoxContainer
-------------------------------------------------------------*/
const isLongSideWidth = window.innerWidth > window.innerHeight;
const boxContainer = new BoxContainer(); // 2300, 2300, 2300, colorPalette.boxContainer
scene.add(boxContainer.mesh);

/* Ocean
-------------------------------------------------------------*/
let waterObj = new THREE.Mesh(waterGeo, waterMat);
waterObj.rotation.x = -Math.PI / 2;
waterObj.position.set(5, 195, 5);
scene.add(waterObj);

/* Boid generation
-------------------------------------------------------------*/
const generateBoid = () => {
    const creatures = [];
    for (let i = 0; i < creatureObjectGroup.children.length; ++i) {
        const creature = new Creature(creatureObjectGroup.children[i]);
        creatureMeshGroup.add(creature.mesh);
        creatures.push(creature);
    }
    boid = new Boid(creatures);
    scene.add(creatureMeshGroup);
}

/* OrbitControls
-------------------------------------------------------------*/
const controls = new THREE.OrbitControls( camera, renderer.domElement );

/* resize
-------------------------------------------------------------*/
window.addEventListener( 'resize', onResize );

/* rendering start
-------------------------------------------------------------*/
createAndDisplayFishes();
generateBoid();
GameLoop();
