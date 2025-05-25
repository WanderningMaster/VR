export class MainProgram {
        constructor(gl, prog) {
                this.program = prog;
		this.gl = gl;

                this.attribLocations = {
                        vertex: null,
                };
                this.uniformLocations = {
                        projectionMatrix: null,
                        modelViewMatrix:  null,
                        color:            null,
                        scale:            null,
                };
        }

        use() {
                this.gl.useProgram(this.program);
        }

        initLocations() {
                this.attribLocations.vertex              = this.gl.getAttribLocation(this.program, 'vertex');

                this.uniformLocations.projectionMatrix   = this.gl.getUniformLocation(this.program, 'ProjectionMatrix');
                this.uniformLocations.modelViewMatrix    = this.gl.getUniformLocation(this.program, 'ModelViewMatrix');
                this.uniformLocations.color              = this.gl.getUniformLocation(this.program, 'color');
                this.uniformLocations.scale              = this.gl.getUniformLocation(this.program, 'scale');
        }
}

export class BackgroundProgram {
        constructor(gl, prog) {
                this.program = prog;
		this.gl = gl;

                this.attribLocations = {
                        position: null,
			texCoord: null,
                };
		this.uniformLocations = {
			scale: null,
		}
		this.texture = null
        }

        use() {
                this.gl.useProgram(this.program);
        }

        initLocations() {
                this.attribLocations.position = this.gl.getAttribLocation(this.program, 'position');
		this.attribLocations.texCoord = this.gl.getAttribLocation(this.program, 'texCoord');

		// this.uniformLocations.scale = this.gl.getUniformLocation(this.program, 'scale');
		this.texture = this.gl.getUniformLocation(this.program, 'uSampler');
        }
}
