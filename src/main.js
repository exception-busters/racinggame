let scene, camera, renderer, catModel;
        const cars = [];
        const trackLength = 200; // Increased track length for more speed feel
        const carSpeed = 0.5; // Increased car speed for more speed feel

        function initThreeJS() {
            const container = document.getElementById('threejs-background');

            // Scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x87ceeb); // Sky blue background

            // Camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 10, 15); // Raised camera position, slightly further back
            camera.lookAt(0, 0, -30); // Look further down the track

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            // Lights
            const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(0, 10, 5);
            scene.add(directionalLight);

            // Racing Track (Plane)
            const trackGeometry = new THREE.PlaneGeometry(20, trackLength);
            const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x555555, side: THREE.DoubleSide });
            const track = new THREE.Mesh(trackGeometry, trackMaterial);
            track.rotation.x = Math.PI / 2; // Rotate to be horizontal
            track.position.y = -0.5; // Slightly below cars
            track.position.z = -trackLength / 2; // Start track in front of camera
            scene.add(track);

            // Cars (simple boxes)
            const carColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
            for (let i = 0; i < 5; i++) {
                const carGeometry = new THREE.BoxGeometry(1, 0.5, 2);
                const carMaterial = new THREE.MeshLambertMaterial({ color: carColors[i % carColors.length] });
                const car = new THREE.Mesh(carGeometry, carMaterial);
                car.position.set(Math.random() * 10 - 5, 0, -Math.random() * trackLength); // Random x, start at random z
                cars.push(car);
                scene.add(car);
            }

            // Load Cat Model
            const loader = new THREE.GLTFLoader();
            loader.load(
                './assets/models/cat.glb',
                function (gltf) {
                    catModel = gltf.scene;
                    catModel.scale.set(0.5, 0.5, 0.5); // Adjust size as needed
                    catModel.position.set(0, -0.5, 0); // Position at the bottom of the screen
                    scene.add(catModel);
                },
                undefined,
                function (error) {
                    console.error('An error occurred while loading the cat model:', error);
                }
            );

            animate();
        }

        function animate() {
            requestAnimationFrame(animate);

            // Move cars forward
            cars.forEach(car => {
                car.position.z += carSpeed;
                if (car.position.z > 5) { // If car goes past camera, reset to back of track
                    car.position.z = -trackLength - (Math.random() * trackLength); // Reset further back
                    car.position.x = Math.random() * 10 - 5; // Random x position
                }
            });

            // Cat animation (simple rotation for now)
            if (catModel) {
                catModel.rotation.y += 0.01; // Rotate the cat
            }

            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        initThreeJS();

        // Settings Modal Logic
        const settingsButton = document.querySelector('.game-button.settings');
        const settingsModal = document.getElementById('settingsModal');
        const settingsCloseButton = settingsModal.querySelector('.close-button');

        settingsButton.addEventListener('click', () => {
            settingsModal.style.display = 'flex'; // Show the modal
        });

        settingsCloseButton.addEventListener('click', () => {
            settingsModal.style.display = 'none'; // Hide the modal
        });

        // Hide modal if clicked outside content
        window.addEventListener('click', (event) => {
            if (event.target == settingsModal) {
                settingsModal.style.display = 'none';
            }
        });

        // Volume slider logic
        const bgmVolume = document.getElementById('bgmVolume');
        const bgmVolumeValue = document.getElementById('bgmVolumeValue');
        bgmVolume.addEventListener('input', (event) => {
            bgmVolumeValue.textContent = event.target.value;
            // Here you would update your actual BGM volume
        });

        const sfxVolume = document.getElementById('sfxVolume');
        const sfxVolumeValue = document.getElementById('sfxVolumeValue');
        sfxVolume.addEventListener('input', (event) => {
            sfxVolumeValue.textContent = event.target.value;
            // Here you would update your actual SFX volume
        });

        // Create Room Modal Logic
        const createRoomButton = document.querySelector('.game-button.create-room');
        const createRoomModal = document.getElementById('createRoomModal');
        const createRoomCloseButton = createRoomModal.querySelector('.create-room-close');
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordInputContainer = document.getElementById('passwordInputContainer');

        createRoomButton.addEventListener('click', () => {
            createRoomModal.style.display = 'flex'; // Show the modal
        });

        createRoomCloseButton.addEventListener('click', () => {
            createRoomModal.style.display = 'none'; // Hide the modal
        });

        // Hide modal if clicked outside content
        window.addEventListener('click', (event) => {
            if (event.target == createRoomModal) {
                createRoomModal.style.display = 'none';
            }
        });

        // Toggle password input visibility
        passwordToggle.addEventListener('change', () => {
            if (passwordToggle.checked) {
                passwordInputContainer.style.display = 'block';
            } else {
                passwordInputContainer.style.display = 'none';
            }
        });

        // Find Room Modal Logic
        const findRoomButton = document.querySelector('.game-button.find-room');
        const findRoomModal = document.getElementById('findRoomModal');
        const findRoomCloseButton = findRoomModal.querySelector('.find-room-close');
        const roomListGrid = document.getElementById('roomListGrid');

        findRoomButton.addEventListener('click', () => {
            loadRooms(); // Load rooms when the modal is opened
            findRoomModal.style.display = 'flex'; // Show the modal
        });

        findRoomCloseButton.addEventListener('click', () => {
            findRoomModal.style.display = 'none'; // Hide the modal
        });

        // Hide modal if clicked outside content
        window.addEventListener('click', (event) => {
            if (event.target == findRoomModal) {
                findRoomModal.style.display = 'none';
            }
        });

        // Password Input Modal Logic
        const passwordInputModal = document.getElementById('passwordInputModal');
        const passwordInputCloseButton = passwordInputModal.querySelector('.password-input-close');
        const joinPasswordInput = document.getElementById('joinPassword');
        const submitPasswordButton = document.getElementById('submitPassword');

        passwordInputCloseButton.addEventListener('click', () => {
            passwordInputModal.style.display = 'none';
            joinPasswordInput.value = ''; // Clear password input
        });

        window.addEventListener('click', (event) => {
            if (event.target == passwordInputModal) {
                passwordInputModal.style.display = 'none';
                joinPasswordInput.value = '';
            }
        });

        submitPasswordButton.addEventListener('click', () => {
            const enteredPassword = joinPasswordInput.value;
            alert(`비밀번호: ${enteredPassword}로 방에 참가 시도`);
            passwordInputModal.style.display = 'none';
            joinPasswordInput.value = '';
        });

        // Dummy room data
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
            roomListGrid.innerHTML = ''; // Clear existing rooms
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

            // Attach event listeners to join buttons after rooms are loaded
            document.querySelectorAll('.join-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const roomId = event.target.dataset.roomId;
                    const room = dummyRooms.find(r => r.id == roomId);

                    if (room && room.password) {
                        passwordInputModal.style.display = 'flex';
                        // Store room ID or other info if needed for password verification
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
        }
        