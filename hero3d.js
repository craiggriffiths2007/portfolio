(() => {
    const container = document.getElementById("hero-3d");

    if (!container || typeof THREE === "undefined")
        return;

    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion)
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    // A restrained foreground constellation which sits mainly on the right,
    // complementing the static artwork rather than covering the headline.
    const particleCount = 48;
    const positions = [];
    const points = [];

    for (let i = 0; i < particleCount; i++) {
        const x = THREE.MathUtils.randFloat(1.6, 8.3);
        const y = THREE.MathUtils.randFloat(-3.3, 3.4);
        const z = THREE.MathUtils.randFloat(-2.5, 1.0);

        positions.push(x, y, z);
        points.push(new THREE.Vector3(x, y, z));
    }

    const particleGeometry = new THREE.BufferGeometry();

    particleGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xd7f7ff,
        size: 0.045,
        transparent: true,
        opacity: 0.72,
        depthWrite: false
    });

    const particles = new THREE.Points(
        particleGeometry,
        particleMaterial
    );

    const linePositions = [];
    const maxDistance = 1.55;

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const distance = points[i].distanceTo(points[j]);

            if (distance < maxDistance) {
                linePositions.push(
                    points[i].x, points[i].y, points[i].z,
                    points[j].x, points[j].y, points[j].z
                );
            }
        }
    }

    const lineGeometry = new THREE.BufferGeometry();

    lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x9ee9ff,
        transparent: true,
        opacity: 0.18,
        depthWrite: false
    });

    const lines = new THREE.LineSegments(
        lineGeometry,
        lineMaterial
    );

    const network = new THREE.Group();
    network.add(lines);
    network.add(particles);
    scene.add(network);

    let pointerX = 0;
    let pointerY = 0;

    window.addEventListener("pointermove", event => {
        pointerX = event.clientX / window.innerWidth - 0.5;
        pointerY = event.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        network.position.y = Math.sin(elapsed * 0.18) * 0.055;
        network.position.x = Math.cos(elapsed * 0.11) * 0.035;
        network.rotation.y = Math.sin(elapsed * 0.09) * 0.025;

        camera.position.x +=
            (pointerX * 0.20 - camera.position.x) * 0.018;

        camera.position.y +=
            (-pointerY * 0.12 - camera.position.y) * 0.018;

        camera.lookAt(0.35, 0, 0);

        renderer.render(scene, camera);
    }

    animate();

    function resize() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (!width || !height)
            return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener("resize", resize, { passive: true });
})();
