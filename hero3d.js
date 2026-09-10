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

    const positions = new Float32Array(
        particleCount * 3
    );

    const basePositions = [];

    for (let i = 0; i < particleCount; i++) {

        // Spread particles across the whole hero.
        const x = THREE.MathUtils.randFloat(-8.0, 8.5);
        const y = THREE.MathUtils.randFloat(-3.4, 3.4);
        const z = THREE.MathUtils.randFloat(-2.8, 1.1);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        basePositions.push({
            x,
            y,
            z,

            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            phaseZ: Math.random() * Math.PI * 2,

            speedX: THREE.MathUtils.randFloat(0.10, 0.28),
            speedY: THREE.MathUtils.randFloat(0.12, 0.32),
            speedZ: THREE.MathUtils.randFloat(0.08, 0.20),

            amountX: THREE.MathUtils.randFloat(0.08, 0.25),
            amountY: THREE.MathUtils.randFloat(0.10, 0.30),
            amountZ: THREE.MathUtils.randFloat(0.04, 0.14)
        });
    }


    const particleGeometry =
        new THREE.BufferGeometry();

    particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const particleMaterial =
        new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.06,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        });


    const particles =
        new THREE.Points(
            particleGeometry,
            particleMaterial
        );


    // --------------------------------------------------
    // WORK OUT WHICH PARTICLES ARE CONNECTED
    // --------------------------------------------------

    const connections = [];

    const maxDistance = 2.2;

    for (let i = 0; i < particleCount; i++) {

        for (let j = i + 1; j < particleCount; j++) {

            const dx =
                basePositions[i].x -
                basePositions[j].x;

            const dy =
                basePositions[i].y -
                basePositions[j].y;

            const dz =
                basePositions[i].z -
                basePositions[j].z;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy +
                    dz * dz
                );

            if (distance < maxDistance) {

                connections.push({
                    a: i,
                    b: j
                });
            }
        }
    }


    // --------------------------------------------------
    // LINE GEOMETRY
    // --------------------------------------------------

    const linePositions =
        new Float32Array(
            connections.length * 6
        );


    const lineGeometry =
        new THREE.BufferGeometry();

    lineGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            linePositions,
            3
        )
    );


    const lineMaterial =
        new THREE.LineBasicMaterial({
            color: 0xabffdf,
            transparent: true,
            opacity: 0.34,
            depthWrite: false
        });


    const lines =
        new THREE.LineSegments(
            lineGeometry,
            lineMaterial
        );


    // --------------------------------------------------
    // NETWORK
    // --------------------------------------------------

    const network =
        new THREE.Group();

    network.add(lines);
    network.add(particles);

    scene.add(network);


    // --------------------------------------------------
    // ANIMATION
    // --------------------------------------------------

    const clock =
        new THREE.Clock();


    function animate() {

        requestAnimationFrame(animate);

        const elapsed =
            clock.getElapsedTime();


        // ----------------------------------------------
        // MOVE PARTICLES
        // ----------------------------------------------

        const particleArray =
            particleGeometry.attributes.position.array;


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


            particleArray[i * 3] =
                x;

            particleArray[i * 3 + 1] =
                y;

            particleArray[i * 3 + 2] =
                z;
        }


        particleGeometry.attributes.position.needsUpdate =
            true;


        // ----------------------------------------------
        // MOVE LINES WITH THEIR PARTICLES
        // ----------------------------------------------

        const lineArray =
            lineGeometry.attributes.position.array;


        for (let i = 0; i < connections.length; i++) {

            const connection =
                connections[i];

            const a =
                connection.a;

            const b =
                connection.b;


            // Start of line

            lineArray[i * 6] =
                particleArray[a * 3];

            lineArray[i * 6 + 1] =
                particleArray[a * 3 + 1];

            lineArray[i * 6 + 2] =
                particleArray[a * 3 + 2];


            // End of line

            lineArray[i * 6 + 3] =
                particleArray[b * 3];

            lineArray[i * 6 + 4] =
                particleArray[b * 3 + 1];

            lineArray[i * 6 + 5] =
                particleArray[b * 3 + 2];
        }


        lineGeometry.attributes.position.needsUpdate =
            true;


        // ----------------------------------------------
        // SLOW RANDOM-LOOKING OVERALL DRIFT
        // ----------------------------------------------

        network.rotation.y =
            Math.sin(elapsed * 0.08) * 0.02;

        network.rotation.x =
            Math.cos(elapsed * 0.06) * 0.01;

        network.position.y =
            Math.sin(elapsed * 0.17) * 0.03;

        network.position.x =
            Math.cos(elapsed * 0.13) * 0.02;


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