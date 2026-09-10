(() => {

    const container = document.getElementById("hero-3d");

    if (!container || typeof THREE === "undefined")
        return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);


    // PARTICLES

    const particleCount = 90;

    const positions = new Float32Array(
        particleCount * 3
    );

    const points = [];

    for (let i = 0; i < particleCount; i++) {

        const x = (Math.random() - 0.5) * 16;
        const y = (Math.random() - 0.5) * 8;
        const z = (Math.random() - 0.5) * 8;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        points.push(
            new THREE.Vector3(x, y, z)
        );
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    const material = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.055,
        transparent: true,
        opacity: 0.8
    });

    const particles = new THREE.Points(
        geometry,
        material
    );


    // CONNECT NEARBY PARTICLES

    const linePositions = [];

    const connectionDistance = 2.1;

    for (let i = 0; i < points.length; i++) {

        for (let j = i + 1; j < points.length; j++) {

            const distance =
                points[i].distanceTo(points[j]);

            if (distance < connectionDistance) {

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

    const lineGeometry = new THREE.BufferGeometry();

    lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            linePositions,
            3
        )
    );

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.12
    });

    const lines = new THREE.LineSegments(
        lineGeometry,
        lineMaterial
    );


    // GROUP EVERYTHING

    const network = new THREE.Group();

    network.add(particles);
    network.add(lines);

    scene.add(network);


    // MOUSE PARALLAX

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener(
        "mousemove",
        event => {

            mouseX =
                event.clientX / window.innerWidth - 0.5;

            mouseY =
                event.clientY / window.innerHeight - 0.5;
        }
    );


    // ANIMATION

    function animate() {

        requestAnimationFrame(animate);

        network.rotation.y += 0.0007;
        network.rotation.x += 0.00015;

        camera.position.x +=
            (mouseX * 0.7 - camera.position.x) *
            0.025;

        camera.position.y +=
            (-mouseY * 0.4 - camera.position.y) *
            0.025;

        camera.lookAt(scene.position);

        renderer.render(
            scene,
            camera
        );
    }

    animate();


    // RESIZE

    function resize() {

        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width === 0 || height === 0)
            return;

        camera.aspect = width / height;

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