let map, marker;
const maxRounds = 10;
const sessionTimeLimit = 180;
const marginOfError = 6000;
let accumulatedDistance = 0;
let currentRound = 0;
let timeRemaining = sessionTimeLimit;
let countdownInterval;
let screenshotPool = [];
let gameData = {
    rounds: [],
    score: 0,
};

// Map configuration for each city
const cityConfigs = {
    Andea: {
        getTileUrl: function (coords) {
            const { x, y, z } = coords;
            const zPrefix = 'z'.repeat(8 - z);
            const folderX = Math.floor(x / 32);
            const folderY = Math.floor(y / 32);
            const fileX = x % 32;
            const fileY = y % 32;
            const tileUrl = `https://map.cubed.community/tiles/Andea/flat/${folderX}_${folderY}/${zPrefix}_${fileX}_${fileY}.jpg?timestamp=1733267803676`;
            console.log(`Generated Tile URL: ${tileUrl}`);
            return tileUrl;
        },
        initialCoords: [-5, -3],
        maxZoom: 4,
        minZoom: 0,
    },
    Oasia: {
        initialCoords: [3840, 3336],
        maxZoom: 4,
        minZoom: 0,
    },
};

// Initialize the map
const initMap = (city) => {
    const config = cityConfigs[city];
    if (map) map.remove();

    map = L.map("map-container", {
        center: config.initialCoords,
        zoom: 2,
        minZoom: config.minZoom,
        maxZoom: config.maxZoom,
    });

    const tileLayer = L.tileLayer("", {
        attribution: "Map data © Cubed Community",
        maxZoom: config.maxZoom,
        tileSize: 128,
        zoomOffset: 0,
        getTileUrl: function (coords) {
            const { x, y, z } = coords;
            const tileUrl = config.tileUrl(z, x, y);
            console.log(`Generated tile URL: ${tileUrl}`); // Debugging log
            return tileUrl;
        },
    });

    tileLayer.addTo(map);

    // Add click event for marker placement
    map.on("click", (e) => {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng).addTo(map);
        updateCoordinatesDisplay(e.latlng);
    });
};

// Update displayed coordinates
const updateCoordinatesDisplay = (latlng) => {
    document.getElementById("coordinates-display").textContent = `Your guess: X: ${Math.round(
        latlng.lng
    )}, Z: ${Math.round(latlng.lat)}`;
};

// Load screenshots and coordinates for a city
const loadScreenshotPool = (gamemode) => {
    if (gamemode === "Andea") {
        screenshotPool = [
            { image: "images/andea1.png", x: 122, z: -674 },
            { image: "images/andea2.png", x: 83, z: -509 },
            { image: "images/andea3.png", x: -134, z: -1322 },
            { image: "images/andea4.png", x: 13, z: -725 },
            { image: "images/andea5.png", x: 155, z: 301 },
            { image: "images/andea6.png", x: -190, z: -1348 },
            { image: "images/andea7.png", x: -222, z: -1229 },
            { image: "images/andea8.png", x: 332, z: 1045 },
            { image: "images/andea9.png", x: 6, z: 169 },
            { image: "images/andea10.png", x: -2060, z: -1984 },
            { image: "images/andea11.png", x: -1720, z: -856 },
            { image: "images/andea12.png", x: -228, z: 1123 },
            { image: "images/andea13.png", x: -853, z: -330 },
            { image: "images/andea14.png", x: -105, z: -2386 },
            { image: "images/andea15.png", x: -3241, z: 3151 },
            { image: "images/andea16.png", x: -3597, z: -3277 },
            { image: "images/andea17.png", x: -3601, z: -3257 },
            { image: "images/andea18.png", x: 522, z: -536 },
            { image: "images/andea19.png", x: -2, z: -1176 },
            { image: "images/andea20.png", x: 4, z: -1308 },
            { image: "images/andea21.png", x: 107, z: -1483 },
            { image: "images/andea22.png", x: -1233, z: -977 },
            { image: "images/andea23.png", x: -3867, z: -319 },
            { image: "images/andea24.png", x: 358, z: 4 },
            { image: "images/andea25.png", x: -1483, z: -175 },
            { image: "images/andea26.png", x: -3411, z: -4871 },
            { image: "images/andea27.png", x: -820, z: 3050 }
        ];
    } else if (gamemode === "Aura") {
        screenshotPool = [
            { image: "images/aura1.jpg", x: 500, z: -300 },
            { image: "images/aura2.jpg", x: 800, z: 600 },
        ];
    }
};

// Start the game
const startGame = () => {
    const gamemode = document.getElementById("gamemode-select").value;
    loadScreenshotPool(gamemode);
    shuffleArray(screenshotPool);
    gameData.rounds = screenshotPool.slice(0, maxRounds);
    currentRound = 0;
    gameData.score = 0;
    accumulatedDistance = 0;
    timeRemaining = sessionTimeLimit;

    document.getElementById("threshold-display").textContent = threshold;
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    initMap(gamemode);
    startCountdown();
    loadRound();
};

// Confirm user's guess
const confirmGuess = () => {
    if (!marker) {
        alert("Please place a marker on the map!");
        return;
    }

    const round = gameData.rounds[currentRound];
    const guess = marker.getLatLng();
    const guessX = Math.round(guess.lng);
    const guessZ = Math.round(guess.lat);

    const distance = Math.abs(round.x - guessX) + Math.abs(round.z - guessZ);
    accumulatedDistance += distance;

    if (accumulatedDistance > marginOfError) {
        endGame("You exceeded the margin of error! Better luck next time!");
        return;
    }

    const score = Math.max(0, 1000 - distance);
    gameData.score += score;

    currentRound++;

    if (currentRound < maxRounds) {
        loadRound();
    } else {
        endGame("Session cleared! Good job!");
    }
};

// Load the next round
const loadRound = () => {
    const round = gameData.rounds[currentRound];
    document.getElementById("screenshot").src = round.image;
    document.getElementById("round-number").textContent = currentRound + 1;

    if (marker) {
        map.removeLayer(marker);
        marker = null;
    }
    document.getElementById("coordinates-display").textContent = "";
};

// Countdown timer
const startCountdown = () => {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            endGame("You ran out of time! Don't overthink it!");
            return;
        }
        timeRemaining--;
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        document.getElementById("time-remaining").textContent = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;
    }, 1000);
};

// End the game
const endGame = () => {
    clearInterval(countdownInterval);
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("game-over-screen").style.display = "block";
    document.getElementById("game-over-title").textContent = message;
    document.getElementById("final-score").textContent = gameData.score;
};

// Return to home
const returnHome = () => {
    clearInterval(countdownInterval);
    document.getElementById("game-over-screen").style.display = "none";
    document.getElementById("home-screen").style.display = "block";
};

// Utility: Shuffle an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

// Event Listeners
document.getElementById("start-game").addEventListener("click", startGame);
document.getElementById("confirm-guess").addEventListener("click", confirmGuess);
document.getElementById("home").addEventListener("click", returnHome);
