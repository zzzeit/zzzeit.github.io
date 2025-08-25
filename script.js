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
let totalSPulls = getCookie("totalSPulls") || 0;
let wins = getCookie("wins") || 0;
let average_pity = getCookie("average_pity") || 0;
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
            updateCookies();
            continue;
        }

        a_guaranteed++;
        if (a_guaranteed >= 10) {
            console.log("A guaranteed");
            aWin();
            updateCookies();
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
        updateCookies();
    }
    updateStats();
}

function pullItem(rarity, type, win=true) {
    if (!data) {
        console.error("Data not loaded yet");
        return;
    }
    
    let item = null;
    let name = null;
    let key;
    
    if (win){
        key = `${rarity}_${type}_win`;
    } else if (!win) {
        key = `${rarity}_${type}_lose`;
    }
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
        pullItem("s", "characters", true);
        wins++;
    } else {
        console.log("S Loser");
        pullItem("s", "characters", false);
    }
    totalSPulls++;
}

function aWin() {
    console.log("A")
    pullItem("a", "characters", true);
    a_guaranteed = 0;
}

function bWin() {
    console.log("B")
    pullItem("b", "weapons", true);
}

function pityReset() {
    pity = 0;
    a_guaranteed = 0;
    s_guaranteed = 0;
}

function updateCookies() {
    document.cookie = `pity=${pity}; expires=${expiryDate.toUTCString()}`;
    document.cookie = `wins=${wins}; expires=${expiryDate.toUTCString()}`;
    document.cookie = `average_pity=${average_pity}; expires=${expiryDate.toUTCString()}`;
    document.cookie = `s_guaranteed=${s_guaranteed}; expires=${expiryDate.toUTCString()}`;
    document.cookie = `a_guaranteed=${a_guaranteed}; expires=${expiryDate.toUTCString()}`;
    document.cookie = `totalSPulls=${totalSPulls}; expires=${expiryDate.toUTCString()}`;
}

function updateStats() {
    document.getElementById("pity").innerText = `Pity: ${pity}`;
    const winPercent = totalSPulls > 0 ? ((wins / totalSPulls) * 100).toFixed(2) : "0.00";
    document.getElementById("wins").innerText = `Wins: ${winPercent}%`;
    document.getElementById("a_guaranteed").innerText = `Pulls until A guaranteed: ${10-a_guaranteed}`;
    document.getElementById("s_guaranteed").innerText = `Pulls until S guaranteed: ${90-s_guaranteed}`;
}




class Item {
    constructor(name, type) {
        this.type = type;
        this.name = name;
        this.formattedName = name.slice(2);
        this.formattedName = this.formattedName.replace(/_/g, " ");
        this.formattedName = this.formattedName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        this.rarity = name.charAt(0);
        this.pity = getCookie("pity")
    }

    appendToHistory() {
        const historyDiv = document.querySelector(".history");
        const itemDiv = document.createElement("div");
        itemDiv.style.margin = "10px";
        itemDiv.style.backgroundColor = "rgba(0, 24, 54, 0.178)";
        itemDiv.style.position = "relative";
        itemDiv.style.height = "100px";
        itemDiv.style.borderRadius = "13px";

        const img = document.createElement("img");
        if (this.type === "character") {
            img.src = `./resources/characters/${this.name}.png`;
        } else if (this.type === "weapon") {
            img.src = `./resources/weapons/${this.name}.png`;
        }
        img.alt = this.name;
        img.width = 100;
        img.style.position = "absolute";
        img.style.left = "0";

        const number = document.createElement("p");
        number.innerText = `#${++this.pity}: ${this.formattedName}`;
        number.style.position = "absolute";
        number.style.bottom = "0";
        number.style.left = "110px";
        number.style.color = "white";
        number.style.fontSize = "22px";

        itemDiv.appendChild(img);
        itemDiv.appendChild(number);
        historyDiv.appendChild(itemDiv);
    }
}

function reset() {
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Reset all variables to initial state
    pity = 0;
    totalSPulls = 0;
    wins = 0;
    pity_list = [];
    average_pity = 0;
    s_guaranteed = 0;
    a_guaranteed = 0;
    
    // Clear the history display
    clearHistory();
    
    // Update the stats display
    updateStats();
    
    console.log("Game reset - all cookies cleared and stats reset");
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

