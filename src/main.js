import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

console.log('main.js 스크립트 시작');

let scene, camera, renderer, catModel;
        const cars = [];
        const trackLength = 200; // 속도감을 위해 트랙 길이를 늘렸습니다.
        const carSpeed = 0.5; // 속도감을 위해 자동차 속도를 높였습니다.

        function initThreeJS() {
            const container = document.getElementById('threejs-background');
            console.log('initThreeJS 실행됨. threejs-background 컨테이너:', container);

            // 장면
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x87ceeb); // 하늘색 배경

            // 카메라
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 10, 15); // 카메라 위치를 약간 뒤로 높였습니다.
            camera.lookAt(0, 0, -30); // 트랙 아래쪽을 바라보도록 설정

            // 렌더러
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            // 조명
            const ambientLight = new THREE.AmbientLight(0x404040); // 부드러운 흰색 조명
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(0, 10, 5);
            scene.add(directionalLight);

            // 레이싱 트랙 (평면)
            const trackGeometry = new THREE.PlaneGeometry(20, trackLength);
            const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x555555, side: THREE.DoubleSide });
            const track = new THREE.Mesh(trackGeometry, trackMaterial);
            track.rotation.x = Math.PI / 2; // 수평으로 회전
            track.position.y = -0.5; // 자동차보다 약간 아래에 위치
            track.position.z = -trackLength / 2; // 카메라 앞에서 트랙 시작
            scene.add(track);

            // 자동차 (간단한 상자)
            const carColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
            for (let i = 0; i < 5; i++) {
                const carGeometry = new THREE.BoxGeometry(1, 0.5, 2);
                const carMaterial = new THREE.MeshLambertMaterial({ color: carColors[i % carColors.length] });
                const car = new THREE.Mesh(carGeometry, carMaterial);
                car.position.set(Math.random() * 10 - 5, 0, -Math.random() * trackLength); // 무작위 x, 무작위 z에서 시작
                cars.push(car);
                scene.add(car);
            }

            // 고양이 모델 로드
            const loader = new GLTFLoader();
            loader.load(
                './assets/models/cat.glb',
                function (gltf) {
                    catModel = gltf.scene;
                    catModel.scale.set(0.5, 0.5, 0.5); // 필요에 따라 크기 조절
                    catModel.position.set(0, -0.5, 0); // 화면 하단에 위치
                    scene.add(catModel);
                },
                undefined,
                function (error) {
                    console.error('고양이 모델을 로드하는 중 오류가 발생했습니다:', error);
                }
            );

            animate();
        }

        function animate() {
            requestAnimationFrame(animate);

            // 자동차를 앞으로 이동
            cars.forEach(car => {
                car.position.z += carSpeed;
                if (car.position.z > 5) { // 자동차가 카메라를 지나가면 트랙 뒤로 재설정
                    car.position.z = -trackLength - (Math.random() * trackLength); // 더 뒤로 재설정
                    car.position.x = Math.random() * 10 - 5; // 무작위 x 위치
                }
            });

            // 고양이 애니메이션 (현재는 간단한 회전)
            if (catModel) {
                catModel.rotation.y += 0.01; // 고양이 회전
            }

            renderer.render(scene, camera);
        }

        console.log('창 크기 조절 이벤트 리스너 등록 시도');
        // 창 크기 조절 처리
        window.addEventListener('resize', () => {
            console.log('창 크기 조절 이벤트 발생!');
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        console.log('창 크기 조절 이벤트 리스너 등록 완료');

        initThreeJS();

        // 설정 모달 로직
        const settingsButton = document.querySelector('.game-button.settings');
        const settingsModal = document.getElementById('settingsModal');
        const settingsCloseButton = settingsModal.querySelector('.close-button');
        console.log('설정 버튼:', settingsButton, '설정 모달:', settingsModal);

        settingsButton.addEventListener('click', () => {
            console.log('설정 버튼 클릭됨!');
            settingsModal.style.display = 'flex'; // 모달 표시
        });

        settingsCloseButton.addEventListener('click', () => {
            console.log('설정 모달 닫기 버튼 클릭됨!');
            settingsModal.style.display = 'none'; // 모달 숨기기
        });

        console.log('설정 모달 외부 클릭 이벤트 리스너 등록 시도');
        // 콘텐츠 외부를 클릭하면 모달 숨기기
        window.addEventListener('click', (event) => {
            if (event.target == settingsModal) {
                console.log('설정 모달 외부 클릭됨!');
                settingsModal.style.display = 'none';
            }
        });
        console.log('설정 모달 외부 클릭 이벤트 리스너 등록 완료');

        // 볼륨 슬라이더 로직
        const bgmVolume = document.getElementById('bgmVolume');
        const bgmVolumeValue = document.getElementById('bgmVolumeValue');
        console.log('BGM 볼륨 슬라이더:', bgmVolume);
        bgmVolume.addEventListener('input', (event) => {
            console.log('BGM 볼륨 변경됨:', event.target.value);
            bgmVolumeValue.textContent = event.target.value;
            // 실제 BGM 볼륨을 업데이트하는 부분
        });

        const sfxVolume = document.getElementById('sfxVolume');
        const sfxVolumeValue = document.getElementById('sfxVolumeValue');
        console.log('SFX 볼륨 슬라이더:', sfxVolume);
        sfxVolume.addEventListener('input', (event) => {
            console.log('SFX 볼륨 변경됨:', event.target.value);
            sfxVolumeValue.textContent = event.target.value;
            // 실제 효과음 볼륨을 업데이트하는 부분
        });

        // 방 생성 모달 로직
        const createRoomButton = document.querySelector('.game-button.create-room');
        const createRoomModal = document.getElementById('createRoomModal');
        const createRoomCloseButton = createRoomModal.querySelector('.create-room-close');
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordInputContainer = document.getElementById('passwordInputContainer');
        console.log('방 생성 버튼:', createRoomButton, '방 생성 모달:', createRoomModal);

        createRoomButton.addEventListener('click', () => {
            console.log('방 생성 버튼 클릭됨!');
            createRoomModal.style.display = 'flex'; // 모달 표시
        });

        createRoomCloseButton.addEventListener('click', () => {
            console.log('방 생성 모달 닫기 버튼 클릭됨!');
            createRoomModal.style.display = 'none'; // 모달 숨기기
        });

        console.log('방 생성 모달 외부 클릭 이벤트 리스너 등록 시도');
        // 콘텐츠 외부를 클릭하면 모달 숨기기
        window.addEventListener('click', (event) => {
            if (event.target == createRoomModal) {
                console.log('방 생성 모달 외부 클릭됨!');
                createRoomModal.style.display = 'none';
            }
        });
        console.log('방 생성 모달 외부 클릭 이벤트 리스너 등록 완료');

        // 비밀번호 입력 가시성 토글
        passwordToggle.addEventListener('change', () => {
            console.log('비밀번호 토글 변경됨!', passwordToggle.checked);
            if (passwordToggle.checked) {
                passwordInputContainer.style.display = 'block';
            } else {
                passwordInputContainer.style.display = 'none';
            }
        });

        // 방 찾기 모달 로직
        const findRoomButton = document.querySelector('.game-button.find-room');
        const findRoomModal = document.getElementById('findRoomModal');
        const findRoomCloseButton = findRoomModal.querySelector('.find-room-close');
        const roomListGrid = document.getElementById('roomListGrid');
        console.log('방 찾기 버튼:', findRoomButton, '방 찾기 모달:', findRoomModal);

        findRoomButton.addEventListener('click', () => {
            console.log('방 찾기 버튼 클릭됨!');
            loadRooms(); // 모달이 열릴 때 방 목록 로드
            findRoomModal.style.display = 'flex'; // 모달 표시
        });

        findRoomCloseButton.addEventListener('click', () => {
            console.log('방 찾기 모달 닫기 버튼 클릭됨!');
            findRoomModal.style.display = 'none'; // 모달 숨기기
        });

        console.log('방 찾기 모달 외부 클릭 이벤트 리스너 등록 시도');
        // 콘텐츠 외부를 클릭하면 모달 숨기기
        window.addEventListener('click', (event) => {
            if (event.target == findRoomModal) {
                console.log('방 찾기 모달 외부 클릭됨!');
                findRoomModal.style.display = 'none';
            }
        });
        console.log('방 찾기 모달 외부 클릭 이벤트 리스너 등록 완료');

        // 비밀번호 입력 모달 로직
        const passwordInputModal = document.getElementById('passwordInputModal');
        const passwordInputCloseButton = passwordInputModal.querySelector('.password-input-close');
        const joinPasswordInput = document.getElementById('joinPassword');
        const submitPasswordButton = document.getElementById('submitPassword');
        console.log('비밀번호 입력 모달:', passwordInputModal);

        passwordInputCloseButton.addEventListener('click', () => {
            console.log('비밀번호 입력 모달 닫기 버튼 클릭됨!');
            passwordInputModal.style.display = 'none';
            joinPasswordInput.value = ''; // 비밀번호 입력 지우기
        });

        console.log('비밀번호 입력 모달 외부 클릭 이벤트 리스너 등록 시도');
        window.addEventListener('click', (event) => {
            if (event.target == passwordInputModal) {
                console.log('비밀번호 입력 모달 외부 클릭됨!');
                passwordInputModal.style.display = 'none';
                joinPasswordInput.value = '';
            }
        });
        console.log('비밀번호 입력 모달 외부 클릭 이벤트 리스너 등록 완료');

        submitPasswordButton.addEventListener('click', () => {
            console.log('비밀번호 확인 버튼 클릭됨!');
            const enteredPassword = joinPasswordInput.value;
            alert(`비밀번호: ${enteredPassword}로 방에 참가 시도`);
            passwordInputModal.style.display = 'none';
            joinPasswordInput.value = '';
        });

        // 임시 방 데이터
        const dummyRooms = [
            { id: 1, title: "홍길동의 방", mode: "1인용", map: "도시", password: false },
            { id: 2, title: "김철수의 방", mode: "2인용", map: "사막", password: true, correctPassword: "1234" },
            { id: 3, title: "영희의 방", mode: "1인용", map: "설원", password: false },
            { id: 4, title: "바둑이의 방", mode: "2인용", map: "도시", password: false },
            { id: 5, title: "철수의 방", mode: "1인용", map: "사막", password: true, correctPassword: "abcd" },
            { id: 6, title: "미애의 방", mode: "2인용", map: "설원", password: false },
            { id: 7, title: "새로운 방 1", mode: "1인용", map: "도시", password: false },
            { id: 8, title: "새로운 방 2", mode: "2인용", map: "사막", password: true, correctPassword: "qwer" },
        ];

        function loadRooms() {
            console.log('loadRooms 함수 실행됨');
            roomListGrid.innerHTML = ''; // 기존 방 목록 지우기
            dummyRooms.forEach(room => {
                const roomItem = document.createElement('div');
                roomItem.classList.add('room-item');
                roomItem.innerHTML = `
                    <h3>${room.title}</h3>
                    <p>모드: ${room.mode}</p>
                    <p>맵: ${room.map}</p>
                    <p>비밀번호: ${room.password ? '있음' : '없음'}</p>
                    <button class="join-button" data-room-id="${room.id}">참가하기</button>
                `;
                roomListGrid.appendChild(roomItem);
            });

            console.log('참가 버튼 이벤트 리스너 등록 시도');
            // 방 목록이 로드된 후 참가 버튼에 이벤트 리스너 연결
            document.querySelectorAll('.join-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    console.log('참가 버튼 클릭됨!', event.target);
                    const roomId = event.target.dataset.roomId;
                    const room = dummyRooms.find(r => r.id == roomId);

                    if (room && room.password) {
                        passwordInputModal.style.display = 'flex';
                        // 비밀번호 확인에 필요한 경우 방 ID 또는 기타 정보 저장
                        submitPasswordButton.onclick = () => {
                            const enteredPassword = joinPasswordInput.value;
                            if (enteredPassword === room.correctPassword) {
                                alert(`${room.title}에 성공적으로 참가했습니다!`);
                                passwordInputModal.style.display = 'none';
                                joinPasswordInput.value = '';
                            } else {
                                alert('비밀번호가 틀렸습니다.');
                            }
                        };
                    } else if (room) {
                        alert(`${room.title}에 참가했습니다!`);
                    }
                });
            });
            console.log('참가 버튼 이벤트 리스너 등록 완료');
        }