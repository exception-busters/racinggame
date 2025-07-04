
playground/
├── public/                    # 정적 파일 (index.html, 이미지, 텍스처, 오디오 등)
│   ├── index.html
│   ├── assets/
│   │   ├── textures/
│   │   ├── models/
│   │   └── sounds/
├── src/                       # 주요 JS/TS 코드
│   ├── main.js                # 진입점 (Three.js 초기화 등)
│   ├── App.js                 # 게임 루프 관리
│   ├── scenes/                # 씬 구성 요소 (메인 씬, 로딩 씬 등)
│   │   └── MainScene.js
│   ├── components/            # 재사용 가능한 구성 요소 (캐릭터, UI, 빛 등)
│   │   ├── Player.js
│   │   ├── Light.js
│   ├── systems/               # 게임 시스템 (충돌 처리, 물리, 입력 등)
│   │   ├── PhysicsSystem.js
│   │   ├── InputSystem.js
│   ├── utils/                 # 유틸 함수 (로딩, 수학 함수 등)
│   │   ├── loader.js
│   │   ├── math.js
│   └── config/                # 설정 파일 (게임 설정, 키 바인딩 등)
│       ├── gameConfig.js
│       └── controls.js
├── package.json
├── README.md
└── .gitignore
