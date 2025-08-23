const today = new Date();
const expiryDate = new Date();
expiryDate.setDate(today.getDate() + 30);

let data = null;

fetch('./resources/data.json')
    .then(response => response.json())
    .then(loadedData => {
        data = loadedData;
        console.log(data); // Use your JSON data here
    })
    .catch(error => console.error('Error loading JSON:', error));

const s_character = 0.006
const a_character = .072
const b_character = 1 - (s_character + a_character)

let pity = getCookie("pity") || 0;
let s_guaranteed = getCookie("s_guaranteed") || 0;
let a_guaranteed = getCookie("a_guaranteed") || 0;

function pull() {
    clearHistory();
    console.log("pulling");
    for (let i = 0; i < 10; i++) {
        pity++;
        s_guaranteed++;
        if (s_guaranteed >= 90) {
            console.log("S guaranteed");
            sWin();
            pityReset();
            continue;
        }

        a_guaranteed++;
        if (a_guaranteed >= 10) {
            console.log("A guaranteed");
            aWin();
            continue;
        }


        const rand = Math.random();
        if (rand < s_character) {
            sWin();
            pityReset();
        } else if (rand < s_character + a_character) {
            aWin();
        } else {
            bWin();
        }
    }
    document.cookie = `pity=${pity}; expires=${expiryDate.toUTCString()}`;
    document.cookie = `s_guaranteed=${s_guaranteed}; expires=${expiryDate.toUTCString()}`;
    document.cookie = `a_guaranteed=${a_guaranteed}; expires=${expiryDate.toUTCString()}`;
    updateStats();
}

function pullItem(rarity, type) {
    if (!data) {
        console.error("Data not loaded yet");
        return;
    }
    
    let item = null;
    let name = null;
    
    const key = `${rarity}_${type}`;
    if (data[key] && data[key].length > 0) {
        name = data[key][Math.floor(Math.random() * data[key].length)];
        item = new Item(name, type.slice(0, -1));
        item.appendToHistory();
    } else {
        console.error(`No items found for ${key}`);
    }
}

function clearHistory() {
    while(document.querySelector(".history").firstChild) {
        document.querySelector(".history").removeChild(document.querySelector(".history").firstChild);
    }
}

function sWin() {
    if (Math.random() < 0.5) {
        console.log("S winner");
        pullItem("s", "characters");
    } else {
        console.log("S Loser");
        pullItem("s", "characters");
    }
}

function aWin() {
    console.log("A")
    pullItem("a", "characters");
    a_guaranteed = 0;
}

function bWin() {
    console.log("B")
    pullItem("b", "weapons");
}

function pityReset() {
    pity = 0;
    a_guaranteed = 0;
    s_guaranteed = 0;
}

function updateStats() {
    document.getElementById("pity").innerText = `Pity: ${pity}`;
}


class Item {
    constructor(name, type) {
        this.type = type;
        this.name = name;
        this.rarity = name.charAt(0);
    }

    appendToHistory() {
        const historyDiv = document.querySelector(".history");
        const itemDiv = document.createElement("div");
        itemDiv.style.margin = "10px";
        itemDiv.style.backgroundColor = "rgba(0, 24, 54, 0.178)";
        const img = document.createElement("img");
        if (this.type === "character") {
            img.src = `./resources/characters/${this.name}.png`;
        } else if (this.type === "weapon") {
            img.src = `./resources/weapons/${this.name}.png`;
        }
        img.alt = this.name;
        img.width = 100;
        itemDiv.appendChild(img);
        historyDiv.appendChild(itemDiv);
    }
}

































function cookieExists(name) {
    return document.cookie.includes(`${name}=`);
}

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
    }
    return null;
}

function updateCookie(name, value) {
    if (cookieExists(name)) {
        document.cookie = `${name}=${value}; expires=${expiryDate.toUTCString()}`;
    } else {
        console.error(`Cookie with name ${name} does not exist.`);
    }
}


console.log(getCookie("pity"));
updateStats();

