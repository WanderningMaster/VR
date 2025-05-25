const vertexShaderSource = `
attribute vec3 vertex;

uniform mat4 ProjectionMatrix;
uniform mat4 ModelViewMatrix;
uniform vec3 scale;

void main() {
	vec3 scaled = vertex * scale;

	gl_Position = ProjectionMatrix * ModelViewMatrix * vec4(scaled, 1.0);
}
`;

const fragmentShaderSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
   precision highp float;
#else
   precision mediump float;
#endif

uniform vec4 color;
void main() {
	gl_FragColor = color;
}`;



const backgroundVertexShader = `
attribute vec4 position;
attribute vec2 texCoord;
varying vec2 vTexCoord;

void main() {
	gl_Position = position;
	vTexCoord = texCoord;
}
`;

const backgroundFragmentShader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
   precision highp float;
#else
   precision mediump float;
#endif

uniform sampler2D uSampler;
varying vec2 vTexCoord;
void main() {
	gl_FragColor = texture2D(uSampler, vTexCoord);
}
`;
