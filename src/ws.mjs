export const client = new WebSocket("ws://192.168.0.103:8081/sensor/connect?type=android.sensor.rotation_vector");

// let packetCount = 0;
// setInterval(() => {
//   console.log(`WebSocket packets/sec: ${packetCount}`);
//   packetCount = 0;
// }, 1000);
//
export function setDataCallback(cb) {
	client.onmessage = ((ev) => {
		// packetCount += 1;
		const data = JSON.parse(ev.data)

		cb(data.values.slice(0, -1))
	})
}
