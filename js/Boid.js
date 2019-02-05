class Boid {
    constructor(creatures = []) {
        this.creatures = creatures;
    }

    update() {
        this.creatures.forEach((creature) => { 
            // boid
            creature.applyForce(this.align(creature));
            creature.applyForce(this.separate(creature));
            creature.applyForce(this.choesin(creature));

            creature.applyForce(this.avoidBoxContainer(creature, boxContainer.mesh.geometry.parameters.width / 2,
                boxContainer.mesh.geometry.parameters.height / 2,
                boxContainer.mesh.geometry.parameters.depth / 2
            ));
            
            creature.update();
        });
    }

    setBoost() {
        this.creatures.forEach((creature) => {
            if (creature.boost.length() === 0) {
                creature.boost.x = getRandomNum(10, -10) * 0.1;
                creature.boost.y = getRandomNum(10, -10) * 0.1;
                creature.boost.z = getRandomNum(10, -10) * 0.1;
                creature.boost.normalize();
                creature.boost.multiplyScalar(this.params.maxSpeed);
            }
        });
    }

    seek(currentCreature, target = new THREE.Vector3()) {
        const maxSpeed = 7;
        const maxForce = 0.04;
        const toGoalVector = new THREE.Vector3();
        toGoalVector.subVectors(target, currentCreature.mesh.position);
        const distance = toGoalVector.length();
        toGoalVector.normalize();
        toGoalVector.multiplyScalar(maxSpeed);
        const steerVector = new THREE.Vector3();
        steerVector.subVectors(toGoalVector, currentCreature.velocity);
        // limit force
        if (steerVector.length() > maxForce) {
            steerVector.clampLength(0, maxForce);
        }
        return steerVector;
    }

    align(currentCreature) {
        const sumVector = new THREE.Vector3();
        let cnt = 0;
        const maxSpeed = 7; //params
        const maxForce = 0.04; //params
        const effectiveRange = 85; //params
        const steerVector = new THREE.Vector3();

        this.creatures.forEach((creature) => {
            const dist = currentCreature.mesh.position.distanceTo(creature.mesh.position);
            if (dist > 0 && dist < effectiveRange) {
                sumVector.add(creature.velocity);
                cnt++;
            }
        });

        if (cnt > 0) {
            sumVector.divideScalar(cnt);
            sumVector.normalize();
            sumVector.multiplyScalar(maxSpeed);

            steerVector.subVectors(sumVector, currentCreature.velocity);
            // limit force
            if (steerVector.length() > maxForce) {
                steerVector.clampLength(0, maxForce);
            }
        }

        return steerVector;
    }

    separate(currentCreature) {
        const sumVector = new THREE.Vector3();
        let cnt = 0;
        const maxSpeed = 7;
        const maxForce = 0.2;
        const effectiveRange = 70;
        const steerVector = new THREE.Vector3();

        this.creatures.forEach((creature) => {
            const dist = currentCreature.mesh.position.distanceTo(creature.mesh.position);
            if (dist > 0 && dist < effectiveRange) {
                let toMeVector = new THREE.Vector3();
                toMeVector.subVectors(currentCreature.mesh.position, creature.mesh.position);
                toMeVector.normalize();
                toMeVector.divideScalar(dist);
                sumVector.add(toMeVector);
                cnt++;
            }
        });

        if (cnt > 0) {
            sumVector.divideScalar(cnt);
            sumVector.normalize();
            sumVector.multiplyScalar(maxSpeed);

            steerVector.subVectors(sumVector, currentCreature.velocity);
            // limit force
            if (steerVector.length() > maxForce) {
                steerVector.clampLength(0, maxForce);
            }
        }

        return steerVector;
    }

    choesin(currentCreature) {
        const sumVector = new THREE.Vector3();
        let cnt = 0;
        const effectiveRange = 200;
        const steerVector = new THREE.Vector3();

        this.creatures.forEach((creature) => {
            const dist = currentCreature.mesh.position.distanceTo(creature.mesh.position);
            if (dist > 0 && dist < effectiveRange) {
                sumVector.add(creature.mesh.position);
                cnt++;
            }
        })

        if (cnt > 0) {
            sumVector.divideScalar(cnt);
            steerVector.add(this.seek(currentCreature, sumVector));
        }

        return steerVector;
    }

    avoid(currentCreature, wall = new THREE.Vector3()) {
        let boundingSphere = new THREE.Sphere();
        currentCreature.geometrySetFromObject.getBoundingSphere(boundingSphere); // BUG
        
        const toMeVector = new THREE.Vector3();
        toMeVector.subVectors(currentCreature.mesh.position, wall);

        const distance = toMeVector.length() - boundingSphere.radius * 2;
        const steerVector = toMeVector.clone();
        steerVector.normalize();
        steerVector.multiplyScalar(1 / (Math.pow(distance, 2)));
        return steerVector;
    }

    avoidBoxContainer(currentCreature, rangeWidth = 80, rangeHeight = 80, rangeDepth = 80) {
        const sumVector = new THREE.Vector3();
        sumVector.add(this.avoid(currentCreature, new THREE.Vector3(rangeWidth, currentCreature.mesh.position.y, currentCreature.mesh.position.z)));
        sumVector.add(this.avoid(currentCreature, new THREE.Vector3(-rangeWidth, currentCreature.mesh.position.y, currentCreature.mesh.position.z)));
        sumVector.add(this.avoid(currentCreature, new THREE.Vector3(currentCreature.mesh.position.x, rangeHeight, currentCreature.mesh.position.z)));
        sumVector.add(this.avoid(currentCreature, new THREE.Vector3(currentCreature.mesh.position.x, -rangeHeight, currentCreature.mesh.position.z)));
        sumVector.add(this.avoid(currentCreature, new THREE.Vector3(currentCreature.mesh.position.x, currentCreature.mesh.position.y, rangeDepth)));
        sumVector.add(this.avoid(currentCreature, new THREE.Vector3(currentCreature.mesh.position.x, currentCreature.mesh.position.y, -rangeDepth)));
        sumVector.multiplyScalar(Math.pow(currentCreature.velocity.length(), 3));
        return sumVector;
    }
}