import { Surface } from "./surface.mjs";

const ctx = {
	surface: {
		mesh: null,
		wireframeMesh: null,
		u: 80,
		v: 80
	},
	three: {
		scene: null,
		camera: null,
		clock: null,
		renderer: null,
		markerRoot: null,
		smoothedRoot: null
	},
	ar: {
		source: null,
		context: null,
		controls: null,
	}
}


function init() {
	initScene();
	initCamera();
	initClock();
	initRenderer();
	initARToolkit();
	initMarkerControls();
	initSmoothedControls();
	addAmbientLight();
	addSurfaceMesh();
	window.addEventListener('resize', onResize);
}

function initScene() {
	ctx.three.scene = new THREE.Scene();
}

function initCamera() {
	ctx.three.camera = new THREE.Camera();
	ctx.three.scene.add(ctx.three.camera);
}

function initClock() {
	ctx.three.clock = new THREE.Clock();
}

function initRenderer() {
	ctx.three.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	ctx.three.renderer.setClearColor(new THREE.Color('lightgrey'), 0);
	ctx.three.renderer.setSize(window.innerWidth, window.innerHeight);
	ctx.three.renderer.domElement.style.position = 'absolute';
	ctx.three.renderer.domElement.style.top = '0px';
	ctx.three.renderer.domElement.style.left = '0px';
	document.body.appendChild(ctx.three.renderer.domElement);
}

function initARToolkit() {
	ctx.ar.source = new THREEx.ArToolkitSource({ sourceType: 'webcam' });
	ctx.ar.source.init(onResize);

	ctx.ar.context = new THREEx.ArToolkitContext({
		cameraParametersUrl: '/data/camera_para.dat',
		detectionMode: 'mono',
	});
	ctx.ar.context.init(() => {
		ctx.three.camera.projectionMatrix.copy(ctx.ar.context.getProjectionMatrix());
	});
}

function initMarkerControls() {
	ctx.three.markerRoot = new THREE.Group();
	ctx.three.scene.add(ctx.three.markerRoot);

	new THREEx.ArMarkerControls(ctx.ar.context, ctx.three.markerRoot, {
		type: 'pattern',
		patternUrl: '/data/marker.patt',
	});
}

function initSmoothedControls() {
	ctx.three.smoothedRoot = new THREE.Group();
	ctx.three.scene.add(ctx.three.smoothedRoot);

	ctx.ar.controls = new THREEx.ArSmoothedControls(ctx.three.smoothedRoot, {
		lerpPosition: 0.8,
		lerpQuaternion: 0.8,
		lerpScale: 1,
	});
}

function addAmbientLight() {
	const ambient = new THREE.AmbientLight(0xcccccc, 0.5);
	ctx.three.scene.add(ambient);
}

function addSurfaceMesh() {
	const model = new Surface(ctx);
	const geometry = model.CreateGeometry(model.CreateSurfaceData());
	geometry.rotateX(Math.PI);

	const material = new THREE.MeshStandardMaterial({
		color: 0xffde21,
		side: THREE.DoubleSide,
		depthTest: true,
		wireframe: true
	});

	ctx.surface.mesh = new THREE.Mesh(geometry, material);
	ctx.surface.mesh.position.y = 0;
	ctx.surface.mesh.scale.setScalar(0.01);

	ctx.three.smoothedRoot.add(ctx.surface.mesh);
}

function onResize() {
	ctx.ar.source.onResize();
	ctx.ar.source.copySizeTo(ctx.three.renderer.domElement);

	if (ctx.ar.context.arController !== null) {
		ctx.ar.source.copySizeTo(ctx.ar.context.arController.canvas);
	}
}

function update() {
	if (ctx.ar.source.ready) {
		ctx.ar.context.update(ctx.ar.source.domElement);
	}

	if (ctx.surface.mesh) {
		const t = ctx.three.clock.getElapsedTime();

		ctx.surface.mesh.rotation.z = t * 0.8;
		ctx.surface.mesh.rotation.y = t * 0.3;

		const pulse = 0.01 + 0.001 * Math.sin(t * 3.5);
		ctx.surface.mesh.scale.set(pulse, pulse, pulse);
	}

	ctx.ar.controls.update(ctx.three.markerRoot);
}

function render() {
	ctx.three.renderer.render(ctx.three.scene, ctx.three.camera);
}

function loop() {
	requestAnimationFrame(loop);
	update();
	render();
}
init();
loop();
