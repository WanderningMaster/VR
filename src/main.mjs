'use strict';
import { Texture } from './models/texture.mjs';
import { Model } from './models/surface.mjs';

import { Anaglyph } from './anaglyph.mjs';

import {MainProgram, BackgroundProgram} from "./program.mjs";

const state = {
        gl: null,
        canvas: null,
        surfaceModel: null,
        shaderProgram: null,
        backgroundShaderProgram: null,
        trackball: null,
        anaglyph: null,
	videoElement: null,
	texId: null,
	texture: null,
        context: {
                scaleFactor: 0.05,
                u: 80,
                v: 80,
        }
};

function setupAnaglyphControls() {
	const params = [
		'eyeSeparation',
		'FOV',
		'nearClippingDistance',
		'convergence',
	];

	params.forEach((id) => {
		const slider = document.getElementById(id);
		const display = document.getElementById(id + 'Value');

		display.textContent = slider.value;
		slider.addEventListener('input', e => {
			const v = parseFloat(e.target.value);
			state.anaglyph[id] = v;
			display.textContent = v.toFixed(2);
		});
	});
}

function updateSurfaceGeometry() {
        const { gl, context, shaderProgram } = state;
        state.surfaceModel = new Model(context, gl, shaderProgram);

        const meshData = state.surfaceModel.CreateSurfaceData();
        state.surfaceModel.BufferData(meshData);
}

function createShaderProgram(gl, vertexSrc, fragmentSrc) {
        const vertexShader   = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
        }
        return program;
}

function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw new Error(`Compile error: ${gl.getShaderInfoLog(shader)}`);
        }
        return shader;
}


function renderEye({ projectionMatrix, colorMask, eyeOffset }) {
        const { gl, shaderProgram, surfaceModel, trackball, context } = state;

        gl.uniformMatrix4fv(
                shaderProgram.uniformLocations.projectionMatrix,
                false,
                projectionMatrix
        );

        const viewMat = trackball.getViewMatrix();
        const rotToZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
        const moveBack = m4.translation(0, 0, -10);
        let mv = m4.multiply(rotToZero, viewMat);
        mv = m4.multiply(eyeOffset, mv);
        mv = m4.multiply(moveBack, mv);

        gl.uniformMatrix4fv(shaderProgram.uniformLocations.modelViewMatrix, false, mv);

        gl.colorMask(...colorMask);

        gl.uniform4fv(shaderProgram.uniformLocations.color, [1, 1, 1, 1]);
        gl.uniform3fv(shaderProgram.uniformLocations.scale, [
                context.scaleFactor,
                context.scaleFactor,
                context.scaleFactor
        ]);
        surfaceModel.Draw();

        gl.uniform4fv(shaderProgram.uniformLocations.color, [0.5, 0.5, 0.5, 1]);
        gl.uniform3fv(shaderProgram.uniformLocations.scale, [
                context.scaleFactor,
                context.scaleFactor,
                context.scaleFactor
        ]);
        surfaceModel.Wireframe();
}

function drawScene() {
        const { gl, anaglyph, backgroundShaderProgram, shaderProgram, videoElement } = state;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if(videoElement !== null && videoElement.readyState >= 2) {
		gl.disable(gl.DEPTH_TEST);

		backgroundShaderProgram.use();
		state.texture.BufferData(state.texture.CreateSurfaceData());

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, state.texture.texId);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0,  gl.RGBA, gl.UNSIGNED_BYTE, videoElement);

		gl.uniform1i(backgroundShaderProgram.texture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		gl.enable(gl.DEPTH_TEST);

	}

        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1, 0);

	shaderProgram.use();
	state.surfaceModel.BufferData(
		state.surfaceModel.CreateSurfaceData()
	);

        renderEye({
                projectionMatrix: anaglyph.calcLeftFrustum(),
                colorMask:        [true, false, false, true],
                eyeOffset:        m4.translation(anaglyph.eyeSeparation / 2, 0, 0)
        });

        gl.clear(gl.DEPTH_BUFFER_BIT);

        renderEye({
                projectionMatrix: anaglyph.calcRightFrustum(),
                colorMask:        [false, true, true, true],
                eyeOffset:        m4.translation(-anaglyph.eyeSeparation / 2, 0, 0)
        });

        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.colorMask(true, true, true, true);

	requestAnimationFrame(drawScene);
}

function initWebGL() {
        const { gl } = state;

        const prog = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
        const sp = new MainProgram(gl, prog);
        sp.use();
        sp.initLocations();
	state.shaderProgram = sp;
	state.surfaceModel = new Model(state.context, gl, sp);
	state.surfaceModel.BufferData(state.surfaceModel.CreateSurfaceData());

	const backgroundProg = createShaderProgram(gl, backgroundVertexShader, backgroundFragmentShader);
	const bsp = new BackgroundProgram(gl, backgroundProg);
	bsp.initLocations();
	state.backgroundShaderProgram = bsp;
	state.texture = new Texture(gl, bsp);


        gl.enable(gl.DEPTH_TEST);
}

function initVideoFeed() {
        state.videoElement = document.createElement('video');
        state.videoElement.autoplay = true;
        navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
			state.videoElement.srcObject = stream;
			const track = stream.getVideoTracks()[0];
			const settings = track.getSettings();

			state.texture.AllocTexture({
				width: settings.width,
				height: settings.height
			});

			state.videoElement.play();
		})
                .catch(err => console.error('Webcam init error:', err));
}

function initialize() {
        state.canvas = document.getElementById('webglcanvas');
        state.gl = state.canvas.getContext('webgl');
        if (!state.gl) {
                document.getElementById('canvas-holder').innerHTML =
                        '<p>Sorry, your browser does not support WebGL.</p>';
                return;
        }

        try {
                initWebGL();
        } catch (err) {
                console.error('Failed to init GL:', err);
                document.getElementById('canvas-holder').innerHTML =
                        `<p>Initialization error: ${err.message}</p>`;
                return;
        }
	initVideoFeed();

        state.anaglyph = new Anaglyph(
                0.3,
                12.0,
                state.canvas.width / state.canvas.height,
                0.6,
                8.0,
                25.0
        );
	setupAnaglyphControls();

        state.trackball = new TrackballRotator(state.canvas, null, 0);
	drawScene();
}

document.addEventListener('DOMContentLoaded', initialize);
