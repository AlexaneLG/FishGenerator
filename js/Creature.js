const getRandomNum = (max = 0, min = 0) => Math.floor(Math.random() * (max + 1 - min)) + min;

class Creature {
    constructor(fish) {
        /*const geometry = new THREE.CylinderGeometry(1, 8, 25, 12);
        geometry.rotateX(THREE.Math.degToRad(90));
        const color = new THREE.Color(`hsl(${getRandomNum(360)}, 100%, 50%)`);
        const material = new THREE.MeshLambertMaterial({
            wireframe: false,
            color: color
        });
        this.mesh = new THREE.Mesh(geometry, material);*/
        this.mesh = fish;
        this.mesh.scale.set(0.5, 0.5, 0.5); // change global size
        this.mesh.rotateX(THREE.Math.degToRad(90));
        this.geometrySetFromObject = new THREE.Box3().setFromObject(fish);
        //console.log("this.mesh", this.mesh);
        const radius = getRandomNum(1, 250);
        const theta = THREE.Math.degToRad(getRandomNum(180));
        const phi = THREE.Math.degToRad(getRandomNum(360));
        this.mesh.position.x = Math.sin(theta) * Math.cos(phi) * radius;
        this.mesh.position.y = Math.sin(theta) * Math.sin(phi) * radius;
        this.mesh.position.z = Math.cos(theta) * radius;
        this.velocity = new THREE.Vector3(getRandomNum(100, -100) * 0.1, getRandomNum(100, -100) * 0.1, getRandomNum(100, -100) * 0.1);
        this.acceleration = new THREE.Vector3();
        this.wonderTheta = 0;
        this.maxSpeed = 7;
        this.boost = new THREE.Vector3();
    }

    applyForce(f) {
        this.acceleration.add(f.clone());
    }

    update() {
        const maxSpeed = this.maxSpeed;

        // boost
        this.applyForce(this.boost);
        this.boost.multiplyScalar(0.9);
        if (this.boost.length() < 0.01) {
            this.boost = new THREE.Vector3();
        }

        // update velocity
        this.velocity.add(this.acceleration);

        // limit velocity
        if (this.velocity.length() > maxSpeed) {
            this.velocity.clampLength(0, maxSpeed);
        }

        // update position
        this.mesh.position.add(this.velocity);
        
        // reset acc
        this.acceleration.multiplyScalar(0);
        
        // head
        const head = this.velocity.clone();
        head.multiplyScalar(10);
        head.add(this.mesh.position);
        this.mesh.lookAt(head);
        
    }
}