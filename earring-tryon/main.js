/* =======================
   GLOBAL
======================= */

let leftEarring, rightEarring;
let currentMetal = "gold";

/* =======================
   THREE SETUP
======================= */

const canvas = document.getElementById("arCanvas");
const scene = new THREE.Scene();

const camera3D = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  10
);
camera3D.position.z = 1;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

/* =======================
   LIGHTING
======================= */

scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(0, 1, 1);
scene.add(light);

/* =======================
   METAL PRESETS
======================= */

const METALS = {
  gold: { color: 0xd4af37, metalness: 1.0, roughness: 0.25 },
  silver: { color: 0xe6e6e6, metalness: 1.0, roughness: 0.2 },
  rose: { color: 0xb76e79, metalness: 1.0, roughness: 0.3 },
};

/* =======================
   LOAD GLB
======================= */

new THREE.GLTFLoader().load("earring.glb", (gltf) => {
  leftEarring = gltf.scene.clone();
  rightEarring = gltf.scene.clone();

  setupEarring(leftEarring, -1);
  setupEarring(rightEarring, 1);

  scene.add(leftEarring, rightEarring);
});

/* =======================
   EARRING SETUP
======================= */

function setupEarring(model, side) {
  model.traverse((o) => {
    if (o.isMesh) {
      o.material = o.material.clone();
      o.material.needsUpdate = true;
    }
  });
  model.userData.side = side;
  applyMetal(model, currentMetal);
}

/* =======================
   MATERIAL CONTROL
======================= */

function applyMetal(model, type) {
  if (!model) return;
  const m = METALS[type];
  model.traverse((o) => {
    if (o.isMesh) {
      o.material.color.setHex(m.color);
      o.material.metalness = m.metalness;
      o.material.roughness = m.roughness;
    }
  });
}

window.setMetal = (type) => {
  currentMetal = type;
  applyMetal(leftEarring, type);
  applyMetal(rightEarring, type);
};

/* =======================
   MEDIAPIPE CAMERA
======================= */

const video = document.getElementById("camera");

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

const faceMesh = new FaceMesh({
  locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

faceMesh.onResults(onResults);

new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 640,
  height: 480,
}).start();

/* =======================
   LANDMARK UTILS
======================= */

function lm(l) {
  return new THREE.Vector3((l.x - 0.5) * 2, -(l.y - 0.5) * 2, -l.z * 0.5);
}

/* =======================
   FACE TRACKING LOGIC
======================= */

function onResults(res) {
  if (!res.multiFaceLandmarks || !leftEarring) return;

  const f = res.multiFaceLandmarks[0];

  const leftCheek = lm(f[234]);
  const rightCheek = lm(f[454]);
  const nose = lm(f[1]);

  const faceCenter = leftCheek.clone().add(rightCheek).multiplyScalar(0.5);
  const faceWidth = leftCheek.distanceTo(rightCheek);

  const yaw = (rightCheek.z - leftCheek.z) / faceWidth;
  const baseY = faceCenter.y - faceWidth * 0.18;

  function place(model) {
    const side = model.userData.side;

    const x = faceCenter.x + side * faceWidth * 0.42;
    const y = baseY - Math.abs(yaw) * faceWidth * 0.04;
    const z = nose.z - faceWidth * (0.25 + Math.abs(yaw) * 0.4);

    model.position.lerp(new THREE.Vector3(x, y, z), 0.45);

    const scale = faceWidth * 0.08;
    model.scale.setScalar(scale);

    const swing = yaw * 0.6;
    model.rotation.z += (side * swing - model.rotation.z) * 0.15;

    const VIS_YAW = 0.15;
    model.visible = side === -1 ? yaw < VIS_YAW : yaw > -VIS_YAW;
  }

  place(leftEarring);
  place(rightEarring);
}

/* =======================
   RENDER LOOP
======================= */

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera3D);
}
animate();
