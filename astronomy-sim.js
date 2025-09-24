document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const canvas = document.getElementById('sky-canvas');
    const ctx = canvas.getContext('2d');
    const datePicker = document.getElementById('date-picker');
    const timePicker = document.getElementById('time-picker');
    const infoDisplay = document.getElementById('info-display');

    // シミュレーションの状態
    const state = {
        simTime: new Date(),
        zoom: 1,
        panOffset: { x: 0, y: 0 },
        isPanning: false,
        lastPanPosition: { x: 0, y: 0 }
    };

    // 天体データ (簡易版)
    const STARS_COUNT = 500;
    let stars = [];

    const planets = [
        { name: '水星', color: '#B0A8A8', orbitalRadius: 0.39, orbitalPeriod: 88, description: '太陽に最も近い惑星。' },
        { name: '金星', color: '#E8D8A8', orbitalRadius: 0.72, orbitalPeriod: 225, description: '地球の「双子星」とも呼ばれる。' },
        { name: '地球', color: '#6888A8', orbitalRadius: 1, orbitalPeriod: 365, description: '私たちの住む惑星。' },
        { name: '火星', color: '#C86848', orbitalRadius: 1.52, orbitalPeriod: 687, description: '「赤い惑星」として知られる。' },
        { name: '木星', color: '#D8B890', orbitalRadius: 5.2, orbitalPeriod: 4333, description: '太陽系最大の惑星。' },
        { name: '土星', color: '#F0E8C0', orbitalRadius: 9.58, orbitalPeriod: 10759, description: '美しい環を持つ惑星。' }
    ];

    // --- 初期化処理 ---
    function init() {
        // canvasのサイズを親要素に合わせる
        const container = document.getElementById('astronomy-simulation');
        canvas.width = container.clientWidth;
        canvas.height = canvas.width * 0.75; // アスペクト比を4:3に

        // 初期の日時を設定
        const now = new Date();
        datePicker.value = now.toISOString().slice(0, 10);
        timePicker.value = now.toTimeString().slice(0, 5);
        state.simTime = now;

        // 星を生成
        createStars();

        // イベントリスナーを設定
        datePicker.addEventListener('change', handleTimeChange);
        timePicker.addEventListener('change', handleTimeChange);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel);
        canvas.addEventListener('click', handleClick);
        window.addEventListener('resize', onResize);


        // 初回レンダリング
        render();
    }

    function onResize() {
        const container = document.getElementById('astronomy-simulation');
        canvas.width = container.clientWidth;
        canvas.height = canvas.width * 0.75;
        render();
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STARS_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 0.5,
                brightness: Math.random() * 0.8 + 0.2
            });
        }
    }

    // --- イベントハンドラ ---
    function handleTimeChange() {
        const [year, month, day] = datePicker.value.split('-').map(Number);
        const [hour, minute] = timePicker.value.split(':').map(Number);
        state.simTime = new Date(year, month - 1, day, hour, minute);
        render();
    }

    function handleMouseDown(e) {
        state.isPanning = true;
        state.lastPanPosition = { x: e.clientX, y: e.clientY };
    }

    function handleMouseMove(e) {
        if (!state.isPanning) return;
        const dx = e.clientX - state.lastPanPosition.x;
        const dy = e.clientY - state.lastPanPosition.y;
        state.panOffset.x += dx / state.zoom;
        state.panOffset.y += dy / state.zoom;
        state.lastPanPosition = { x: e.clientX, y: e.clientY };
        render();
    }

    function handleMouseUp() {
        state.isPanning = false;
    }

    function handleWheel(e) {
        e.preventDefault();
        const zoomFactor = 1.1;
        if (e.deltaY < 0) {
            state.zoom *= zoomFactor;
        } else {
            state.zoom /= zoomFactor;
        }
        state.zoom = Math.max(0.5, Math.min(state.zoom, 5)); // ズーム範囲を制限
        render();
    }

    function handleClick(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // ワールド座標に変換
        const worldX = (mouseX - canvas.width / 2) / state.zoom + canvas.width / 2 - state.panOffset.x;
        const worldY = (mouseY - canvas.height / 2) / state.zoom + canvas.height / 2 - state.panOffset.y;

        let clickedObject = null;

        // 惑星のクリック判定
        const dayOfYear = (state.simTime - new Date(state.simTime.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24);
        planets.forEach(p => {
            const angle = (2 * Math.PI * (dayOfYear / p.orbitalPeriod)) % (2 * Math.PI);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const orbitSize = p.orbitalRadius * 50 * (canvas.width / 800);

            const planetX = centerX + Math.cos(angle) * orbitSize;
            const planetY = centerY + Math.sin(angle) * orbitSize;

            const distance = Math.sqrt(Math.pow(worldX - planetX, 2) + Math.pow(worldY - planetY, 2));
            if (distance < 10) { // クリック範囲
                clickedObject = p;
            }
        });

        if (clickedObject) {
            infoDisplay.innerHTML = `<h3>${clickedObject.name}</h3><p>${clickedObject.description}</p>`;
        } else {
            infoDisplay.innerHTML = '<p>星や惑星をクリックして情報を表示</p>';
        }
    }


    // --- レンダリング ---
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();

        // ズームとパンの中心をcanvasの中心に
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(state.zoom, state.zoom);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // パンの適用
        ctx.translate(state.panOffset.x, state.panOffset.y);

        drawStars();
        drawPlanets();

        ctx.restore();
    }

    function drawStars() {
        ctx.fillStyle = 'white';
        stars.forEach(star => {
            ctx.globalAlpha = star.brightness;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }

    function drawPlanets() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // 太陽
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
        ctx.fill();

        const dayOfYear = (state.simTime - new Date(state.simTime.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24);

        planets.forEach(p => {
            const orbitSize = p.orbitalRadius * 50 * (canvas.width / 800);

            // 軌道を描画
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, orbitSize, 0, 2 * Math.PI);
            ctx.stroke();

            // 惑星を描画
            const angle = (2 * Math.PI * (dayOfYear / p.orbitalPeriod)) % (2 * Math.PI);
            const x = centerX + Math.cos(angle) * orbitSize;
            const y = centerY + Math.sin(angle) * orbitSize;

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    // 初期化関数を実行
    init();
});
