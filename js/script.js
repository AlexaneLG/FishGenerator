/* constants
-------------------------------------------------------------*/
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
    removeEntities('fish');
    createAndDisplayFishes();
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
				mesh.position.set(-200, -40, 0);
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

loadSeaweed(-300, -35, 130, 0, Math.PI/2, 0);
loadSeaweed(-250, -37, -150, 0, -Math.PI/3, 0);

// set ocean
let waterGeo = new THREE.PlaneGeometry(3000, 3000, 100, 100);
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

// loops

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
	//boids.update();

	let delta = clock.getDelta();
	for (let i = 0; i < mixers.length; ++i) {
    	mixers[i].update(delta);
	}	

	// animate ocean
	let i = 0;
	for (let ix = 0; ix < 100; ix++) {
	    for (let iy = 0; iy < 100; iy++) {
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
    constructor(width = 100, height = 100, depth = 100, color = 0xffffff) {
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


/* GENETIC ALGORITHM
-------------------------------------------------------------*/

/* Parameters
A fish as :
	# body
	# dorsal fin
	# caudal fin
	# pectoral fins (paired)
Body is defined by :
	# size x
	# size y
	# size z
	# color R de 0 à 255
	# color G de 0 à 255
	# color B de 0 à 255
Each fin is defined by :
	# size between 1 and 4
	# color R de 0 à 255
	# color G de 0 à 255
	# color B de 0 à 255
*/

/* Genotype
sizeXBody | sizeYBody | sizeZBody | colorBody | sizeXDorsalFin | sizeYDorsalFin | sizeXCaudalFin | sizeYCaudalFin | sizeXPectoralFin | sizeYPectoralFin | colorFin
100 | 100 | 100 | 111 | 100 | 100 | 100 | 100 | 100 | 100 | 111
Soit 33 bits
*/

/* 
n: number of bits 
return Array of bits
*/
function createRandomGenotype(nBits) {
	let i;
	let genotype = [];
	for (i = 0; i < nBits; ++i) {
		let binary = Math.round(Math.random());
		genotype.push(binary); // 0 or 1
	}
	return genotype;
}

/*
binaries: genotype of the fish
nGeneration: number of generation of the fish
return Object: { genotype, phenotypes, fitness }
*/
function createFishObject(binaries, nGeneration) {
	return {
		genotype: binaries,
		phenotypes: createPhenotype(binaries),
		fitness: fitness(binaries),
		generation: nGeneration
	};
}

/* 
nFishes: number of fishes 
nBits: number of bits 
nGen: generation of the fish
return Array of fish objects
*/
function createRandomFishes(nFishes, nBits, nGen) {
	let i = 0;
	let fishes = [];

	while (i < nFishes) {
		++i;
		let genotype = createRandomGenotype(nBits);
		fishes.push(createFishObject(genotype, nGen));
	}
	return fishes;
}

/*
binaries: Array of bits
return converted int
*/
function binaryToInt(binaries) {
	let int = 0;
	let i;
	for (i = 0; i < binaries.length; ++i) {
		int += binaries[i] * Math.pow(2, binaries.length - 1 - i);
	}
	return int;
}

/*
genotype: Array of bits
return Array of phenotypes
*/
function createPhenotype(genotype) {
	let phenotype = [];
	let i;
	for (i = 0; i < genotype.length; i += 3) {
		phenotype.push(binaryToInt(genotype.slice(i, i+3)));
	}
	return phenotype;
}

/*
phenotype: Array of integers
return Group of meshes / 3d objects
SCALE -> BUG
*/
function create3DFish(phenotype){
	let fishLoader = new THREE.OBJLoader();
	let group = new THREE.Group();
	const colors = [0x1C77C3, 0x39A9DB, 0x40BCD8, 0xF39237, 0xE65F5C, 0x731DD8, 0x48A9A6, 0xE4DFDA];

	let size = new THREE.Vector3(); // width, height, depth
	let sizeX, sizeY, sizeZ;
	let center = new THREE.Vector3(); // center point of the box
	let max = new THREE.Vector3();
	let min = new THREE.Vector3();
	var helper;
	//helper.update();
	//scene.add(helper);

	fishLoader.load('models/fish-body.obj', function ( mesh ){
			mesh.traverse( function ( child ) {
            	if ( child instanceof THREE.Mesh ) {
                	child.material = new THREE.MeshPhongMaterial({
                		color: colors[phenotype[3]],
                		flatShading: true,
                		shininess: 200,
                		specular: colors[phenotype[3]]
                	});
                }
            });
			mesh.receiveShadow = true;
			mesh.castShadow = true;
			mesh.scale.set(phenotype[0]*0.25+1, phenotype[1]*0.25+1, phenotype[2]*0.25+1);
			group.add(mesh);

			let obj = new THREE.Box3().setFromObject(mesh);
			obj.getSize(size);
			obj.getCenter(center);
			
			/*console.log("center", center);

			helper = new THREE.BoxHelper(mesh, 0xff0000);
			console.log("obj", obj);
			group.add(helper);*/
		}
	);

	sizeX = size.x;
	sizeY = size.y;
	sizeZ = size.z;
	// debug
	if (sizeX < sizeZ) {
		console.log("BUG DETECTED ________________________________");
		console.log("size", size);
		console.log("center", center);
		let w = size.x;
		size.x = size.z;
		size.z = w;
	}

	fishLoader.load('models/dorsal-fin.obj', function ( mesh ){
			mesh.traverse( function ( child ) {
            	if ( child instanceof THREE.Mesh ) {
                	child.material = new THREE.MeshPhongMaterial({
                		color: colors[phenotype[10]],
                		flatShading: true,
                		shininess: 200,
                		specular: colors[phenotype[10]]
                	});
                }
            });
			mesh.receiveShadow = true;
			mesh.castShadow = true;
			mesh.scale.set(1, phenotype[4]*0.25+1, phenotype[5]*0.25+1);
			mesh.position.set(0, size.y/2, -size.z/3);
			group.add(mesh);
		}
	);

	fishLoader.load('models/caudal-fin.obj', function ( mesh ){
			mesh.traverse( function ( child ) {
            	if ( child instanceof THREE.Mesh ) {
                	child.material = new THREE.MeshPhongMaterial({
                		color: colors[phenotype[10]],
                		flatShading: true,
                		shininess: 200,
                		specular: colors[phenotype[10]]
                	});
                }
            });
			mesh.receiveShadow = true;
			mesh.castShadow = true;
			mesh.scale.set(1, phenotype[6]*0.25+1, phenotype[7]*0.25+1);
			mesh.position.set(0, 0, -size.z);
			group.add(mesh);
		}
	);

	fishLoader.load('models/pectoral-fin.obj', function ( mesh ){
			mesh.traverse( function ( child ) {
            	if ( child instanceof THREE.Mesh ) {
                	child.material = new THREE.MeshPhongMaterial({
                		color: colors[phenotype[10]],
                		flatShading: true,
                		shininess: 200,
                		specular: colors[phenotype[10]]
                	});
                }
            });
			mesh.receiveShadow = true;
			mesh.castShadow = true;
			mesh.scale.set(phenotype[8]*0.25+1, phenotype[9]*0.25+1, 1);
			mesh.position.set(-size.x/2, 0, -size.z/3);
			group.add(mesh);
		}
	);

	fishLoader.load('models/pectoral-fin.obj', function ( mesh ){
			mesh.traverse( function ( child ) {
            	if ( child instanceof THREE.Mesh ) {
                	child.material = new THREE.MeshPhongMaterial({
                		color: colors[phenotype[10]],
                		flatShading: true,
                		shininess: 200,
                		specular: colors[phenotype[10]]
                	});
                }
            });
			mesh.receiveShadow = true;
			mesh.castShadow = true;
			mesh.scale.set(phenotype[8]*0.25+1, phenotype[9]*0.25+1, 1);
			mesh.position.set(size.x/2, 0, -size.z/3);
			group.add(mesh);
		}
	);

	group.name = "fish";
	return group;
}

/*
min: inclus
max: exclus
return integer
*/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

/*
fish: Object
return Fish Object with 1 mutated bit in his genotype
*/
function mutation(fish) {
	let fishM = fish;
	const nAttributs = 11;
	const randAttribut = getRandomInt(0, nAttributs);
	const lenghtAttribut = 3;
	const randBit = getRandomInt(0, lenghtAttribut);
	const index = randAttribut * 3 + randBit;
	const bit = fishM.genotype[index] === 0 ? 1 : 0;
	fishM.genotype[index] = bit;
	fishM.phenotypes = createPhenotype(fishM.genotype);
	return fishM;
}

/*
genotypeA: Array of bits
genotypeB: Array of bits
return Array of bits, new genotype
*/
function crossover(genotypeA, genotypeB) {
	let i;
	const nAttributs = 11;
	let genotypeC = [];
	
	for ( i = 0; i < nAttributs; ++i ) {
		const randAttribut = Math.round(Math.random());
		const parentGenotype = randAttribut === 0 ? genotypeA : genotypeB;
		const parentAttribut = parentGenotype.slice( i * 3, i * 3 + 3 );
		genotypeC = genotypeC.concat( parentAttribut );
	}
	
	return genotypeC;
}

/* 
Estimate difference between ideal fitness and compared genotype 
*/
function fitness(genotype) {
	const fitness = [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0];
	const colorsIndexes = [9, 10, 11, 30, 31, 32];
	let i;
	let difference = 0;
	for (i = 0; i < fitness.length; ++i) {
		if (colorsIndexes.includes(i) == false) {
			if (fitness[i] != genotype[i]) {
				difference += 1;
			}
		}
	}
	return difference;
}
 
/* 
fishes: Array of Object
return the fish with the best genotype : the lowest fitness
*/
function tournament(fishes) {
	let minIndex = 0;
	let i;
	for (i = 0; i < fishes.length; ++i) {
		if (Math.min(fishes[minIndex].fitness, fishes[i].fitness) === fishes[i].fitness) {
			minIndex = i;
		}
	}
	return fishes[minIndex];
}

/* return an array of indexes 
numberOfFishes: length */
function selection(numberOfFishes) {
	const selectionSize = getRandomInt(1, Math.ceil(numberOfFishes / 2)); // tiny selection
	let selected = [];
	let i;
	for (i = 0; i < selectionSize; ++i) {
		const index = getRandomInt(0, numberOfFishes);
		if (selected.includes(index) == false) {
			selected.push(index);
		} else {
			--i;
		}
	}
	return selected;
}

/*
Display fish Object3D in the scene
*/
function displayFish(phenotype, x, y) {
	let fish = create3DFish(phenotype);
	scene.add(fish);
	//fish.rotation.set(0, Math.PI / 2, 0);
	//fish.position.set(x - 350, 10 * y, -150);
	fish.position.set(-150, 10 * y, x - 350);
}

/*
Remove all objects in the scene by name
*/
function removeEntities(name) {
	let selectedObject;
	do {
	    selectedObject = scene.getObjectByName(name);
	    if(selectedObject) {
	    	scene.remove( selectedObject );
	    	//animate();
	    }
	} while (selectedObject);
}

/*
Apply genetic algorithm
*/
function createAndDisplayFishes() {
	//const maxGen = 5; // how many generations to display
	let nGen = 0; // index or number of the generation
	//const nFirstGen = 10; // number of fishes of first generation
	let generations = []; // all fishes

	generations = createRandomFishes(options.nFirstGen, 33, nGen); // init fishes

	let posX = 0;
	let n;
	// display first generation
	for (n = 0; n < generations.length; ++n) {
		displayFish(generations[n].phenotypes, posX, generations[n].generation);
		posX += 100;
	}

	do {
		// select new generation based on generation - 1
		nGen += 1;
		console.log("__________________________________________________________________________GENERATION ", nGen);
		let parents = [];
		let selected = [];
		let parentsGen = generations.filter(fish => fish.generation === nGen - 1); // select parents generation
		console.log("ALL GEN", generations);
		console.log("PREVIOUS GEN: ", parentsGen);

		// selection based on parents generation
		let p;
		for (p = 0; p < 5; ++p) {
			const selectedIndexes = selection(parentsGen.length);
			let x;
			for (x = 0; x < selectedIndexes.length; ++x) {
				selected.push(parentsGen[selectedIndexes[x]]);
			} 
			const winner = tournament(selected);
			console.log("SELECTED", selected);
			console.log("WINNER", winner);
			parents.push(winner);
		}

		// new gen
		let indexFather;
		let indexMother;
		let child = 0;
		let newGen = [];
		//const nChilds = 10;

		 while (child < options.nChilds) {
			indexFather = getRandomInt(0, parents.length);
			do {
				indexMother = getRandomInt(0, parents.length);
			} while (indexMother === indexFather);

			let crossoveredGenotype = crossover(parents[indexFather].genotype, parents[indexMother].genotype);
			newGen.push(createFishObject(crossoveredGenotype, nGen));
			child += 1;
		} 

		// mutation
		const mutationIndex = getRandomInt(0, newGen.length);
		const mutated = mutation(newGen[mutationIndex]);
		newGen[mutationIndex] = mutated;

		console.log("NEW GEN: ", newGen);
		generations = generations.concat(newGen);

		// display new generation
		posX = 0;
		let n;
		for (n = 0; n < newGen.length; ++n) {
			displayFish(newGen[n].phenotypes, posX, nGen * 3);
			posX += 100;
		}
	} while (nGen < options.nMaxGens);
}

/* scene
-------------------------------------------------------------*/
let scene = new THREE.Scene();
scene.fog = new THREE.Fog(colorPalette.screenBg, -30, 600);

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
scene.add ( ambientLight );

/* SpotLight
-------------------------------------------------------------*/
const spotLight = new THREE.SpotLight(colorPalette.spotLight);
spotLight.angle = Math.PI / 4;
spotLight.intensity = 9;
spotLight.decay = 4;
spotLight.distance = 9000;
spotLight.penumbra = 1.0;
//spotLight.position.set(-1800, 3000, 2000);
spotLight.position.set(-2200, 3000, 0);
scene.add(spotLight);

/* PointLight
-------------------------------------------------------------*/
var pointLight = new THREE.PointLight( 0x174a84, 0.8, 18 );
pointLight.position.set(0, 0, 0);
pointLight.castShadow = true;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 25;
scene.add(pointLight);

/* BoxContainer
-------------------------------------------------------------*/
const isLongSideWidth = window.innerWidth > window.innerHeight;
const boxContainer = new BoxContainer(2300, 2300, 2300, colorPalette.boxContainer);
scene.add(boxContainer.mesh);

/* Ocean
-------------------------------------------------------------*/
let waterObj = new THREE.Mesh(waterGeo, waterMat);
waterObj.rotation.x = -Math.PI / 2;
waterObj.position.y = 150;
scene.add(waterObj);

/* OrbitControls
-------------------------------------------------------------*/
const controls = new THREE.OrbitControls( camera, renderer.domElement );
/*orbitControls.autoRotate = false;
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.39;*/

/* resize
-------------------------------------------------------------*/
window.addEventListener( 'resize', onResize );

/* rendering start
-------------------------------------------------------------*/
createAndDisplayFishes();
GameLoop();

/* decors functions
-------------------------------------------------------------*/
function addSeaweedToScene(mesh, posX, posY, posZ, rotX, rotY, rotZ, scaX, scaY, scaZ) {
	let object = new THREE.Group();
	object.add(mesh);
	scene.add(object);
	object.position.set(posX, posY, posZ);
	object.rotation.set(rotX, rotY, rotZ);
	object.scale.set(scaX, scaY, scaZ);
	return object;
}

function loadSeaweed(posX, posY, posZ, rotX, rotY, rotZ) {
	jsonLoader.load("models/seaweed1.JD", function (data) {                            
	    for (let i = 0; i < data.objects.length; ++i)
	    {
	        if (data.objects[i].type == "Mesh")
	        {
	            let mesh = null;
	            let matArray = new THREE.MeshPhongMaterial({
		    		color: colorPalette.seaweed,
		    		flatShading: true,
		    		shininess: 200,
		    		specular: colorPalette.seaweed
		    	});

	            mesh = new THREE.Mesh(data.objects[i].geometry, matArray);
	            let object = new THREE.Group();
				object.add(mesh);
				scene.add(object);
				object.position.set(posX, posY, posZ);
				object.rotation.set(rotX, rotY, rotZ);
				seaweedMeshes.push(object);

	            if (mesh && mesh.geometry.animations) {
	                let mixer = new THREE.AnimationMixer(mesh);
	                mixers.push(mixer);
	                let action = mixer.clipAction( mesh.geometry.animations[0] );
	                action.play();
	            }
	        }
	    }        
	});
}

