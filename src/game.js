import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

let scene, camera, renderer, carModel, mixer;
let currentSpeed = 0;
let currentDecibel = 0;
const maxSpeed = 100; // 최대 속도 (km/h)
const maxDecibel = 100; // 최대 데시벨 (dB)
const minDecibel = 30; // 최소 데시벨 (dB)

const keys = {
    left: false,
    right: false
};

// Web Audio API 관련 변수
let audioContext;
let analyser;
let microphone;

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // 하늘색 배경

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10); // 초기 카메라 위치 (자동차 뒤, 위)

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('gameCanvas') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040); // 부드러운 흰색 조명
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Plane (맵)
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x7CFC00, side: THREE.DoubleSide }); // 잔디색
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Load Ambulance Model
    const loader = new FBXLoader();
    loader.load(
        '/racinggame/assets/models/cars/ambulance.fbx',
        function (object) {
            carModel = object;
            carModel.scale.set(0.05, 0.05, 0.05); // 크기 조절
            carModel.position.set(0, 0, 0); // 초기 위치
            carModel.rotation.y = Math.PI; // 모델 방향 조정
            carModel.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(carModel);

            // 애니메이션 믹서 설정 (FBX 모델에 애니메이션이 있다면)
            if (carModel.animations && carModel.animations.length > 0) {
                mixer = new THREE.AnimationMixer(carModel);
                const action = mixer.clipAction(carModel.animations[0]);
                action.play();
            }

            // 카메라를 자동차 뒤, 위에 고정
            updateCameraPosition();
        },
        undefined,
        function (error) {
            console.error('앰뷸런스 모델 로드 중 오류 발생:', error);
        }
    );

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Web Audio API 초기화
    initAudio();

    animate();
}

function updateCameraPosition() {
    if (carModel) {
        const relativeCameraOffset = new THREE.Vector3(0, 10, 15); // 자동차로부터의 상대적 위치 (뒤, 위)
        const cameraOffset = relativeCameraOffset.applyMatrix4(carModel.matrixWorld);

        camera.position.copy(cameraOffset);
        camera.lookAt(carModel.position);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    switch (event.key) {
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.key) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
    }
}

function animate() {
    requestAnimationFrame(animate);

    const delta = 0.01; // 애니메이션 업데이트 시간 간격
    if (mixer) mixer.update(delta);

    if (carModel) {
        // 방향 조절
        if (keys.left) {
            carModel.rotation.y += 0.05; // 왼쪽으로 회전
        }
        if (keys.right) {
            carModel.rotation.y -= 0.05; // 오른쪽으로 회전
        }

        // 속도에 따른 이동
        const moveDistance = currentSpeed * 0.01; // 속도를 이동 거리로 변환
        carModel.translateZ(moveDistance); // 자동차를 앞으로 이동

        updateCameraPosition(); // 카메라 위치 업데이트
    }

    // UI 업데이트
    document.getElementById('speed-display').textContent = `속도: ${Math.round(currentSpeed)} km/h`;
    document.getElementById('decibel-display').textContent = `데시벨: ${Math.round(currentDecibel)} dB`;

    renderer.render(scene, camera);
}

async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        // 오디오 데이터 처리 루프
        function processAudio() {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // 데시벨 계산 (간단한 근사치)
            currentDecibel = 20 * Math.log10(average / 255 * 100); // 0-255 스케일을 0-100으로 정규화 후 데시벨로 변환
            if (currentDecibel < 0) currentDecibel = 0; // 음수 데시벨 방지

            // 데시벨을 속도로 매핑
            // minDecibel과 maxDecibel 사이의 값만 유효하게 사용
            const normalizedDecibel = Math.max(0, Math.min(1, (currentDecibel - minDecibel) / (maxDecibel - minDecibel)));
            currentSpeed = normalizedDecibel * maxSpeed;

            requestAnimationFrame(processAudio);
        }
        processAudio();

    } catch (err) {
        console.error('마이크 접근 오류:', err);
        alert('마이크 접근 권한이 필요합니다. 페이지를 새로고침하고 권한을 허용해주세요.');
    }
}

init();
