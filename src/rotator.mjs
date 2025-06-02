const rotationVector = new Float32Array(4);
const R = new Float32Array(16);

export function dataCb(vec) {
	rotationVector[0] = vec[0];
	rotationVector[1] = vec[1];
	rotationVector[2] = vec[2];
	rotationVector[3] = vec[3];
	getRotationMatrixFromVector(rotationVector);
}

export function getViewMatrix() {
	return R;
}

export function getRotationMatrixFromVector(rotationVector) {
    let q0;
    const q1 = rotationVector[0];
    const q2 = rotationVector[1];
    const q3 = rotationVector[2];

    if (rotationVector.length >= 4) {
        q0 = rotationVector[3];
    } else {
        let t = 1 - q1 * q1 - q2 * q2 - q3 * q3;
        q0 = t > 0 ? Math.sqrt(t) : 0;
    }

    // Precompute repeated terms
    const sq_q1 = 2 * q1 * q1;
    const sq_q2 = 2 * q2 * q2;
    const sq_q3 = 2 * q3 * q3;
    const q1_q2 = 2 * q1 * q2;
    const q3_q0 = 2 * q3 * q0;
    const q1_q3 = 2 * q1 * q3;
    const q2_q0 = 2 * q2 * q0;
    const q2_q3 = 2 * q2 * q3;
    const q1_q0 = 2 * q1 * q0;

    if (R.length === 9) {
        R[0] = 1 - sq_q2 - sq_q3;
        R[1] = q1_q2 - q3_q0;
        R[2] = q1_q3 + q2_q0;

        R[3] = q1_q2 + q3_q0;
        R[4] = 1 - sq_q1 - sq_q3;
        R[5] = q2_q3 - q1_q0;

        R[6] = q1_q3 - q2_q0;
        R[7] = q2_q3 + q1_q0;
        R[8] = 1 - sq_q1 - sq_q2;
    } else if (R.length === 16) {
        R[0]  = 1 - sq_q2 - sq_q3;
        R[1]  = q1_q2 - q3_q0;
        R[2]  = q1_q3 + q2_q0;
        R[3]  = 0.0;

        R[4]  = q1_q2 + q3_q0;
        R[5]  = 1 - sq_q1 - sq_q3;
        R[6]  = q2_q3 - q1_q0;
        R[7]  = 0.0;

        R[8]  = q1_q3 - q2_q0;
        R[9]  = q2_q3 + q1_q0;
        R[10] = 1 - sq_q1 - sq_q2;
        R[11] = 0.0;

        R[12] = 0.0;
        R[13] = 0.0;
        R[14] = 0.0;
        R[15] = 1.0;
    } else {
        throw new Error("R must be an array of length 9 or 16.");
    }
}
