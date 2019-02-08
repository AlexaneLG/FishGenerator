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