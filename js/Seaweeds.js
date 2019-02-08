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
