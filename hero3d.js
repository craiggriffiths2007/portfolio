(() => {

    const container = document.getElementById("hero-3d");

    if (!container || typeof THREE === "undefined")
        return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        52,
        container.clientWidth / Math.max(container.clientHeight, 1),
        0.1,
        100
    );

    camera.position.set(0, 0, 8.8);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.6)
    );

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);


    // --------------------------------------------------
    // PARTICLES
    // --------------------------------------------------

    const particleCount = 55;

    const positions = [];
    const basePositions = [];
    const points = [];

    for (let i = 0; i < particleCount; i++) {

        // Keep most of the activity to the right
        const x = THREE.MathUtils.randFloat(1.2, 8.5);
        const y = THREE.MathUtils.randFloat(-3.4, 3.4);
        const z = THREE.MathUtils.randFloat(-2.8, 1.1);

        positions.push(x, y, z);

        basePositions.push({
            x: x,
            y: y,
            z: z,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            phaseZ: Math.random() * Math.PI * 2,
            speedX: THREE.MathUtils.randFloat(0.10, 0.28),
            speedY: THREE.MathUtils.randFloat(0.12, 0.32),
            speedZ: THREE.MathUtils.randFloat(0.08, 0.20),
            amountX: THREE.MathUtils.randFloat(0.08, 0.28),
            amountY: THREE.MathUtils.randFloat(0.10, 0.34),
            amountZ: THREE.MathUtils.randFloat(0.04, 0.16)
        });

        points.push(
            new THREE.Vector3(x, y, z)
        );
    }

    const particleGeometry =
        new THREE.BufferGeometry();

    particleGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            positions,
            3
        )
    );

    const particleMaterial =
        new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.06,
            transparent: true,
            opacity: 0.82,
            depthWrite: false
        });

    const particles =
        new THREE.Points(
            particleGeometry,
            particleMaterial
        );

    scene.add(particles);


    // --------------------------------------------------
    // STATIC CONNECTION LINES
    // --------------------------------------------------

    const linePositions = [];

    const maxDistance = 1.55;

    for (let i = 0; i < points.length; i++) {

        for (let j = i + 1; j < points.length; j++) {

            const distance =
                points[i].distanceTo(points[j]);

            if (distance < maxDistance) {

                linePositions.push(
                    points[i].x,
                    points[i].y,
                    points[i].z,

                    points[j].x,
                    points[j].y,
                    points[j].z
                );
            }
        }
    }

    const lineGeometry =
        new THREE.BufferGeometry();

    lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            linePositions,
            3
        )
    );

    const lineMaterial =
        new THREE.LineBasicMaterial({
            color: 0xb9f3ff,
            transparent: true,
            opacity: 0.22,
            depthWrite: false
        });

    const lines =
        new THREE.LineSegments(
            lineGeometry,
            lineMaterial
        );

    scene.add(lines);


    // --------------------------------------------------
    // OVERALL NETWORK GROUP
    // --------------------------------------------------

    const network =
        new THREE.Group();

    scene.remove(particles);
    scene.remove(lines);

    network.add(lines);
    network.add(particles);

    scene.add(network);


    // --------------------------------------------------
    // RANDOM ORGANIC MOVEMENT
    // --------------------------------------------------

    const clock =
        new THREE.Clock();

    function animate() {

        requestAnimationFrame(animate);

        const elapsed =
            clock.getElapsedTime();

        const positionAttribute =
            particleGeometry.attributes.position;

        for (let i = 0; i < particleCount; i++) {

            const base =
                basePositions[i];

            const x =
                base.x +
                Math.sin(
                    elapsed * base.speedX +
                    base.phaseX
                ) * base.amountX;

            const y =
                base.y +
                Math.sin(
                    elapsed * base.speedY +
                    base.phaseY
                ) * base.amountY;

            const z =
                base.z +
                Math.cos(
                    elapsed * base.speedZ +
                    base.phaseZ
                ) * base.amountZ;

            positionAttribute.setXYZ(
                i,
                x,
                y,
                z
            );
        }

        positionAttribute.needsUpdate = true;


        // Slow overall drift as well
        network.rotation.y =
            Math.sin(elapsed * 0.08) * 0.05;

        network.rotation.x =
            Math.cos(elapsed * 0.06) * 0.025;

        network.position.y =
            Math.sin(elapsed * 0.18) * 0.08;

        network.position.x =
            Math.cos(elapsed * 0.14) * 0.06;


        renderer.render(
            scene,
            camera
        );
    }

    animate();


    // --------------------------------------------------
    // RESIZE
    // --------------------------------------------------

    function resize() {

        const width =
            container.clientWidth;

        const height =
            container.clientHeight;

        if (!width || !height)
            return;

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height
        );
    }

    window.addEventListener(
        "resize",
        resize
    );

})();