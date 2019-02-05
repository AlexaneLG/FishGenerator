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
		//console.log("DEBUG materials", materials);
		objLoader.load('models/fixed-scene.obj', function ( mesh ){
				mesh.traverse( function ( child ) {
		        	if ( child instanceof THREE.Mesh ) {
		        		child.material.flatShading = true;
		            }
		        });
				mesh.receiveShadow = true;
				mesh.castShadow = true;
				scene.add(mesh);
				//mesh.position.set(-200, -40, 0);
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

/*loadSeaweed(-300, -35, 130, 0, Math.PI/2, 0);
loadSeaweed(-250, -37, -150, 0, -Math.PI/3, 0);*/
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
        /*this.mesh.position.x = -200;
        this.mesh.position.z = -10;
        this.mesh.position.y = 160;*/
    }
}

/* GENETIC ALGORITHM
-------------------------------------------------------------*/
let genotypeFitness = {
	bodyModel: {
    	bits: [0],
    	nBits: 1,
    	phenotype: 0,
    	forFitness: true
    },
    dorsalFinModel: {
    	bits: [0],
    	nBits: 1,
    	phenotype: 0,
    	forFitness: true
    },
    pectoralFinModel: {
    	bits: [0],
    	nBits: 1,
    	phenotype: 0,
    	forFitness: true
    },
    caudalFinModel: {
    	bits: [0],
    	nBits: 1,
    	phenotype: 0,
    	forFitness: true
    },
    sizeXBody: {
    	bits: [0, 0, 0],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: true
    },
    sizeYBody: {
    	bits: [0, 1, 1],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: true
    },
    sizeZBody: {
    	bits: [0, 1, 1],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: true
    },
    colorBody: {
    	bits: [0, 1, 0],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: false
    },
    sizeYDorsalFin: {
    	bits: [0, 1, 0],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: true
    },
    sizeZDorsalFin: {
    	bits: [0, 1, 1],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: true
    },
    sizeYCaudalFin: {
    	bits: [0, 1, 1],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: true
    },
    sizeZCaudalFin: {
    	bits: [0, 1, 0],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: true
    },
    sizeXPectoralFin: {
    	bits: [1, 1, 0],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: true
    },
    sizeYPectoralFin: {
    	bits: [0, 1, 1],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: true
    },
    colorFin: {
    	bits: [1, 1, 0],
    	nBits: 3,
    	phenotype: 0,
    	forFitness: false
    }
}

/*
return Object: genotype's reference structure
*/
function createGenotypeObject() {
	return {
		bodyModel: {
	    	bits: [],
	    	nBits: 1,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    dorsalFinModel: {
	    	bits: [],
	    	nBits: 1,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    pectoralFinModel: {
	    	bits: [],
	    	nBits: 1,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    caudalFinModel: {
	    	bits: [],
	    	nBits: 1,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    sizeXBody: {
	    	bits: [],
	    	nBits: 3,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    sizeYBody: {
	    	bits: [],
	    	nBits: 3,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    sizeZBody: {
	    	bits: [],
	    	nBits: 3,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    colorBody: {
	    	bits: [],
	    	nBits: 4,
	    	phenotype: 0,
	    	forFitness: false
	    },
	    sizeYDorsalFin: {
	    	bits: [],
	    	nBits: 3,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    sizeZDorsalFin: {
	    	bits: [],
	    	nBits: 3,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    sizeYCaudalFin: {
	    	bits: [],
	    	nBits: 3,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    sizeZCaudalFin: {
	    	bits: [],
	    	nBits: 3,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    sizeXPectoralFin: {
	    	bits: [],
	    	nBits: 3,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    sizeYPectoralFin: {
	    	bits: [],
	    	nBits: 3,
	    	phenotype: 0,
	    	forFitness: true
	    },
	    colorFin: {
	    	bits: [],
	    	nBits: 4,
	    	phenotype: 0,
	    	forFitness: false
	    }
	};
}

/* 
return genotype object filled of random bits
*/
function createRandomGenotype() {
	let genotype = createGenotypeObject();
	for (let property in genotype) {
		for (let i = 0;  i < genotype[property].nBits; ++i) {
			let bit = Math.round(Math.random());
			genotype[property].bits.push(bit); // 0 or 1
		}
	}

	return genotype;
}

/*
bits: genotype of the fish
nGeneration: number of generation of the fish
return Object: { genotype, phenotypes, fitness }
*/
function createFishObject(genotypeObject, nGeneration) {
	return {
		genotype: createPhenotypes(genotypeObject),
		fitness: fitness(genotypeObject),
		generation: nGeneration
	};
}

/* 
nFishes: number of fishes 
nBits: number of bits 
nGen: generation of the fish
return Array of fish objects
*/
function createRandomFishes(nFishes, nGen) {
	let i = 0;
	let fishes = [];

	while (i < nFishes) {
		++i;
		let genotype = createRandomGenotype();
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
	for (let i = 0; i < binaries.length; ++i) {
		int += binaries[i] * Math.pow(2, binaries.length - 1 - i);
	}
	return int;
}

/*
genotype: Object
return Object
*/
function createPhenotypes(genotype) {
	for (let property in genotype) {
		genotype[property].phenotype = binaryToInt(genotype[property].bits);
	}
	return genotype;
}

/*
phenotype: Array of integers
return Group of meshes / 3d objects
*/
function create3DFish(genotype){
	let fishLoader = new THREE.OBJLoader();
	let group = new THREE.Group();
	const colors = [0x7dd0b6, 0x7dd0ca, 0x7dbdd0, 0x7da6d0, 0x7d88d0, 0xffd4f5, 0xE65F5C, 0xffddd4, 0xffe5d4, 0xffecd4, 0xfeffa7, 0xfeff86, 0xf6b6da, 0xfeffba, 0xffffe8, 0xF39237];
	const bodyModels = ['models/fish-body-01.obj', 'models/fish-body-02.obj'];
	const dorsalFinModels = ['models/dorsal-fin-01.obj', 'models/dorsal-fin-02.obj'];
	const pectoralFinModels = ['models/pectoral-fin-01.obj', 'models/pectoral-fin-02.obj'];
	const caudalFinModels = ['models/caudal-fin-01.obj', 'models/caudal-fin-02.obj'];

	let sizes = []; // size = Vector3(width, height, depth)
	// for each body
	for (let m = 0; m < bodyModels.length; ++m) {
		fishLoader.load(bodyModels[m], function ( mesh ){
				mesh.scale.set(genotype.sizeXBody.phenotype*0.25+1, genotype.sizeYBody.phenotype*0.25+1, genotype.sizeZBody.phenotype*0.25+1);
				let obj = new THREE.Box3().setFromObject(mesh);
				minBox = obj.min;
				maxBox = obj.max;
				sizes[m]  = new THREE.Vector3(maxBox.x - minBox.x, maxBox.y - minBox.y, maxBox.z - minBox.z);
			}
		);
	}

	fishLoader.load(bodyModels[genotype.bodyModel.phenotype], function ( mesh ){
		mesh.traverse(function ( child ) {
        	if ( child instanceof THREE.Mesh ) {
            	child.material = new THREE.MeshPhongMaterial({
            		color: colors[genotype.colorBody.phenotype],
            		flatShading: true,
            		shininess: 200,
            		specular: colors[genotype.colorBody.phenotype]
            	});
            }
        });
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		mesh.scale.set(genotype.sizeXBody.phenotype*0.25+1, genotype.sizeYBody.phenotype*0.25+1, genotype.sizeZBody.phenotype*0.25+1);
		group.add(mesh);
	});

	fishLoader.load(dorsalFinModels[genotype.dorsalFinModel.phenotype], function ( mesh ){
		mesh.traverse( function ( child ) {
        	if ( child instanceof THREE.Mesh ) {
            	child.material = new THREE.MeshPhongMaterial({
            		color: colors[genotype.colorFin.phenotype],
            		flatShading: true,
            		shininess: 200,
            		specular: colors[genotype.colorFin.phenotype]
            	});
            }
        });
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		mesh.scale.set(1, genotype.sizeYDorsalFin.phenotype*0.25+1, genotype.sizeZDorsalFin.phenotype*0.25+1);
		mesh.position.set(0, sizes[genotype.bodyModel.phenotype].y/2, -sizes[genotype.bodyModel.phenotype].z/3);
		group.add(mesh);
	});

	fishLoader.load(caudalFinModels[genotype.caudalFinModel.phenotype], function ( mesh ){
		mesh.traverse( function ( child ) {
        	if ( child instanceof THREE.Mesh ) {
            	child.material = new THREE.MeshPhongMaterial({
            		color: colors[genotype.colorFin.phenotype],
            		flatShading: true,
            		shininess: 200,
            		specular: colors[genotype.colorFin.phenotype]
            	});
            }
        });
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		mesh.scale.set(1, genotype.sizeYCaudalFin.phenotype*0.25+1, genotype.sizeZCaudalFin.phenotype*0.25+1);
		mesh.position.set(0, 0, -sizes[genotype.bodyModel.phenotype].z);
		group.add(mesh);
	});

	fishLoader.load(pectoralFinModels[genotype.pectoralFinModel.phenotype], function ( mesh ){
		mesh.traverse( function ( child ) {
        	if ( child instanceof THREE.Mesh ) {
            	child.material = new THREE.MeshPhongMaterial({
            		color: colors[genotype.colorFin.phenotype],
            		flatShading: true,
            		shininess: 200,
            		specular: colors[genotype.colorFin.phenotype]
            	});
            }
        });
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		mesh.scale.set(genotype.sizeXPectoralFin.phenotype*0.25+1, genotype.sizeYPectoralFin.phenotype*0.25+1, 1);
		mesh.position.set(-sizes[genotype.bodyModel.phenotype].x/2, 0, -sizes[genotype.bodyModel.phenotype].z/3);
		group.add(mesh);
	});

	fishLoader.load(pectoralFinModels[genotype.pectoralFinModel.phenotype], function ( mesh ){
		mesh.traverse( function ( child ) {
        	if ( child instanceof THREE.Mesh ) {
            	child.material = new THREE.MeshPhongMaterial({
            		color: colors[genotype.colorFin.phenotype],
            		flatShading: true,
            		shininess: 200,
            		specular: colors[genotype.colorFin.phenotype]
            	});
            }
        });
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		mesh.scale.set(genotype.sizeXPectoralFin.phenotype*0.25+1, genotype.sizeYPectoralFin.phenotype*0.25+1, 1);
		mesh.position.set(sizes[genotype.bodyModel.phenotype].x/2, 0, -sizes[genotype.bodyModel.phenotype].z/3);
		group.add(mesh);
	});

	group.name = "fish";
	//group.scale.set(0.5, 0.5, 0.5); // change global size
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
	const properties = Object.keys(fish.genotype); // array of properties

	const nAttributs = properties.length;
	const randAttribut = getRandomInt(0, nAttributs);
	const property = properties[randAttribut];

	const lenghtAttribut = fish.genotype[property].nBits; // number of bits
	const randBit = getRandomInt(0, lenghtAttribut);

	const bit = fishM.genotype[property].bits[randBit] === 0 ? 1 : 0;
	fishM.genotype[property].bits[randBit] = bit;

	fishM.genotype = createPhenotypes(fishM.genotype);
	return fishM;
}

/*
genotypeA: Object
genotypeB: Object
return Object, new genotype
*/
function crossover(genotypeA, genotypeB) {
	let genotypeC = createGenotypeObject();
	const properties = Object.keys(genotypeC); // array of properties
	const nAttributs = properties.length;
	
	for (let property in genotypeC) {
		const randProperty = Math.round(Math.random()); // 0 or 1
		const parentGenotype = randProperty === 0 ? genotypeA : genotypeB;
		genotypeC[property].bits = parentGenotype[property].bits;
	}
	
	return genotypeC;
}

/* 
Estimate difference between ideal fitness and compared genotype 
*/
function fitness(genotype) {
	let difference = 0;
	for (let property in genotype) {
		if (genotype[property].forFitness == true) {
			for (let i = 0; i < genotype[property].nBits; ++i) {
				if (genotype[property].nBits[i] != genotypeFitness[property].nBits[i]) {
					difference += 1;
				}
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

/*
return an array of indexes 
numberOfFishes: length
*/
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
function displayFish(genotype, x, y) {
	let fish = create3DFish(genotype);
	/*scene.add(fish);
	//fish.rotation.set(0, Math.PI / 2, 0);
	fish.position.set(-150, 10 * y, x - 350);*/

	// add fishes to boid group
	creatureObjectGroup.add(fish);
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
	scene.remove(creatureMeshGroup);
	creatureMeshGroup = new THREE.Group();
	creatureObjectGroup = new THREE.Group();

	let nGen = 0; // index or number of the generation
	let generations = []; // all fishes

	generations = createRandomFishes(options.nFirstGen, nGen); // init fishes

	let posX = 0;
	let n;
	// display first generation
	for (n = 0; n < generations.length; ++n) {
		displayFish(generations[n].genotype, posX, generations[n].generation);
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
			/*console.log("SELECTED", selected);
			console.log("WINNER", winner);*/
			parents.push(winner);
		}

		// new gen
		let indexFather;
		let indexMother;
		let child = 0;
		let newGen = [];

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
			displayFish(newGen[n].genotype, posX, nGen * 3);
			posX += 100;
		}
	} while (nGen < options.nMaxGens);
}

/* scene
-------------------------------------------------------------*/
let scene = new THREE.Scene();
//scene.fog = new THREE.Fog(colorPalette.screenBg, -30, 600);

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
//spotLight.position.set(-1800, 3000, 2000);
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
/*waterObj.position.y = 355;
waterObj.position.x = -205;
waterObj.position.z = -5;*/
waterObj.position.set(5, 195, 5);
scene.add(waterObj);

/* creature
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

