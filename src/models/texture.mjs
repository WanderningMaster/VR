export class Texture {
	constructor(gl, shProgram) {
		this.iVertexBuffer = gl.createBuffer();
		this.iTexCoordBuffer = gl.createBuffer();

		this.glCtx = gl;
		this.shProgram = shProgram;
		this.texId = -1;

	}

	BufferData({vertices, texCoords}) {
		this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.iVertexBuffer);
		this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, vertices, this.glCtx.STATIC_DRAW);

		this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.iTexCoordBuffer);
		this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, texCoords, this.glCtx.STATIC_DRAW);

		this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.iVertexBuffer);
		this.glCtx.enableVertexAttribArray(this.shProgram.attribLocations.position);
		this.glCtx.vertexAttribPointer(this.shProgram.attribLocations.position, 2, this.glCtx.FLOAT, false, 0, 0);

		this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.iTexCoordBuffer);
		this.glCtx.enableVertexAttribArray(this.shProgram.attribLocations.texCoord);
		this.glCtx.vertexAttribPointer(this.shProgram.attribLocations.texCoord, 2, this.glCtx.FLOAT, false, 0, 0);
	};

	AllocTexture({width, height}) {
		this.texId = this.glCtx.createTexture();
		this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.texId);

		this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.LINEAR);
		this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.LINEAR);

		this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_WRAP_S, this.glCtx.CLAMP_TO_EDGE);
		this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_WRAP_T, this.glCtx.CLAMP_TO_EDGE);

		this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, width, height, 0, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, null);
	}

	CreateSurfaceData() {
		const vertices = new Float32Array([
			-1, -1,
			1, -1,
			-1,  1,
			-1,  1,
			1, -1,
			1,  1,
		]);
		const texCoords = new Float32Array([
			0, 0,
			1, 0,
			0, 1,
			0, 1,
			1, 0,
			1, 1,
		]);

		for(let idx = 0; idx < texCoords.length; idx += 1) {
			texCoords[idx] = 1 - texCoords[idx];
		}

		return {
			vertices,
			texCoords,
		}
	}
}
