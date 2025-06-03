class ArrayBufferIterable {
	constructor(array) {
		this.buffer = array;
		this.index = 0;
	}

	reset() {
		this.index = 0;
	}

	len() {
		return this.buffer.length
	}

	push_batch(...args) {
		for(const x of args) {
			this.push_next(x)
		}
	}

	push_next(x) {
		if (this.index > this.buffer.length - 1) {
			throw new Error('Reached the end of the TypedArray.');
		}
		this.buffer[this.index] = x;
		this.index += 1;
	}

	collect() {
		return this.buffer;
	}
}

export class Surface {
	constructor(ctx) {
		this.uSteps = ctx.surface.u
		this.vSteps = ctx.surface.v

	}

	Eq(u, v) {
		const m = 6;
		const b = 6 * m;
		const a = 4 * m;
		const n = 0.1;
		const phi = 0;

		const w = m * Math.PI / b;
		const x = v * Math.cos(u);
		const y = v * Math.sin(u);
		const z = a * Math.pow(Math.E, -n * v) * Math.sin(w * v + phi);

		return {x,y,z}
	}

	CreateGeometry({indices, vertices}) {
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			'position',
			new THREE.BufferAttribute(vertices, 3)
		);
		geometry.setIndex(new THREE.BufferAttribute(indices, 1));
		geometry.computeVertexNormals();

		return geometry;
	}

	CreateSurfaceData() {
		const vStepSize = 36 / this.vSteps;
		const uStepSize = 2 * Math.PI / this.uSteps;

		const totalTriangles = this.vSteps * this.uSteps * 2;
		const totalVertices  = totalTriangles * 3;

		let vertices = new ArrayBufferIterable(new Float32Array(totalVertices * 3));
		let indices  = new ArrayBufferIterable(new Uint16Array(totalVertices));

		let idxOffset = 0;
		let v = 0;
		for (let vStep = 0; vStep < this.vSteps; vStep++) {
			let u = 0;
			for (let uStep = 0; uStep < this.uSteps; uStep++) {
				const p0 = this.Eq(u, v);
				const p1 = this.Eq(u + uStepSize, v);
				const p2 = this.Eq(u, v + vStepSize);
				const p3 = this.Eq(u + uStepSize, v + vStepSize);

				vertices.push_batch(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
				indices.push_batch(idxOffset++, idxOffset++, idxOffset++);

				vertices.push_batch(p1.x, p1.y, p1.z, p3.x, p3.y, p3.z, p2.x, p2.y, p2.z)
				indices.push_batch(idxOffset++, idxOffset++, idxOffset++);
				u += uStepSize;

			}
			v += vStepSize;
		}

		return {
			vertices: vertices.collect(),
			indices: indices.collect(),
		};
	}
}
