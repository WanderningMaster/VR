export class ArrayBufferIterable {
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
