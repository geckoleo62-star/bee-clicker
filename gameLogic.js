/**
 * gameLogic.js
 * Gère les événements dynamiques du jeu (météo, frelons, abeille d'or, pluie, auto-clic).
 */

import { gameState, internalVars } from './state.js';
import * as Constants from './constants.js';
import * as Utils from './utils.js';
import * as UI from './ui.js';
import * as Storage from './storage.js';

export const MISSIONS = [
    {
        id: "honey_master",
        title: "Maître du Miel (Record de miel)",
        getProgress: (gs) => gs.maxHoneyReached,
        tiers: [
            { target: 5000, rewardText: "+1 Maîtrise", reward: { type: 'mastery', amount: 1 } },
            { target: 500000, rewardText: "+1 Abeille Légendaire", reward: { type: 'bees', rarity: 'legendary', count: 1 } },
            { target: 5000000, rewardText: "+1 Abeille Mythique", reward: { type: 'bees', rarity: 'mythic', count: 1 } },
            { target: 50000000, rewardText: "+4 Maîtrise", reward: { type: 'mastery', amount: 4 } },
            { target: 5000000000, rewardText: "+1 Abeille Mythique", reward: { type: 'bees', rarity: 'mythic', count: 1 } },
            { target: 50000000000, rewardText: "+2 Abeilles Mythiques", reward: { type: 'bees', rarity: 'mythic', count: 2 } },
            { target: 500000000000, rewardText: "+3 Abeilles Mythiques", reward: { type: 'bees', rarity: 'mythic', count: 3 } },
            { target: 5000000000000, rewardText: "+4 Abeilles Mythiques", reward: { type: 'bees', rarity: 'mythic', count: 4 } },
            { target: 50000000000000, rewardText: "+5 Abeilles Mythiques", reward: { type: 'bees', rarity: 'mythic', count: 5 } },
            { target: 500000000000000, rewardText: "+3 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 3 } },
            { target: 5000000000000000, rewardText: "+4 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 4 } },
            { target: 50000000000000000, rewardText: "+5 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 5 } }
         ]
    },
    {
        id: "hornet_hunter",
        title: "Protecteur de la Ruche (Frelons chassés)",
        getProgress: (gs) => gs.hornetsDefeated,
        tiers: [
            { target: 5, rewardText: "+2 Maîtrise", reward: { type: 'mastery', amount: 2 } },
            { target: 10, rewardText: "+1 Abeille Légendaire", reward: { type: 'bees', rarity: 'legendary', count: 1 } },
            { target: 15, rewardText: "+2 Abeilles Légendaires", reward: { type: 'bees', rarity: 'legendary', count: 2 } },
            { target: 20, rewardText: "+3 Abeilles Légendaires", reward: { type: 'bees', rarity: 'legendary', count: 3 } },
            { target: 25, rewardText: "+4 Abeilles Légendaires", reward: { type: 'bees', rarity: 'legendary', count: 4 } },
            { target: 30, rewardText: "+5 Abeilles Légendaires", reward: { type: 'bees', rarity: 'legendary', count: 5 } },
            { target: 35, rewardText: "+3 Abeille Mythique", reward: { type: 'bees', rarity: 'mythic', count: 3 } },
            { target: 40, rewardText: "+4 Abeille Mythique", reward: { type: 'bees', rarity: 'mythic', count: 4 } },
            { target: 45, rewardText: "+5 Abeille Mythique", reward: { type: 'bees', rarity: 'mythic', count: 5 } },
            { target: 50, rewardText: "+3 Abeille Divine", reward: { type: 'bees', rarity: 'divine', count: 3 } },
            { target: 60, rewardText: "+4 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 4 } },
            { target: 75, rewardText: "+5 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 5 } },
            { target: 100, rewardText: "+6 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 6 } },
            { target: 150, rewardText: "+10 Maîtrise & +5 Abeilles Divines", reward: [{ type: 'mastery', amount: 10 }, { type: 'bees', rarity: 'divine', count: 5 }] },
            { target: 200, rewardText: "+20 Maîtrise & +10 Abeilles Divines", reward: [{ type: 'mastery', amount: 20 }, { type: 'bees', rarity: 'divine', count: 10 }] },
            { target: 300, rewardText: "+50 Maîtrise & +20 Abeilles Divines", reward: [{ type: 'mastery', amount: 50 }, { type: 'bees', rarity: 'divine', count: 20 }] }
        ]
    },
   {
        id: "golden_seeker",
        title: "Chasseur d'Or (Abeilles d'Or)",
        getProgress: (gs) => gs.totalGoldenBeesHistorical,
        tiers: [
            { target: 5, rewardText: "+2 Maîtrise", reward: { type: 'mastery', amount: 2 } },
            { target: 25, rewardText: "+5 Maîtrise & +1 Mythique", reward: [{ type: 'mastery', amount: 5 }, { type: 'bees', rarity: 'mythic', count: 1 }] },
            { target: 100, rewardText: "+15 Maîtrise & +1 Divine", reward: [{ type: 'mastery', amount: 15 }, { type: 'bees', rarity: 'divine', count: 1 }] },
            { target: 250, rewardText: "+30 Maîtrise & +3 Divines", reward: [{ type: 'mastery', amount: 30 }, { type: 'bees', rarity: 'divine', count: 3 }] },
            { target: 500, rewardText: "+60 Maîtrise & +10 Divines", reward: [{ type: 'mastery', amount: 60 }, { type: 'bees', rarity: 'divine', count: 10 }] }
        ]
    },
    {
        id: "bee_collector",
        title: "Grand Essaim (Abeilles totales)",
        getProgress: (gs, formulas) => formulas.getTotalBees(),
        tiers: [
            { target: 10, rewardText: "+2 Maîtrise", reward: { type: 'mastery', amount: 2 } },
            { target: 50, rewardText: "+1 Abeille Légendaire", reward: { type: 'bees', rarity: 'legendary', count: 1 } },
            { target: 100, rewardText: "+2 Abeilles Légendaires", reward: { type: 'bees', rarity: 'legendary', count: 2 } },
            { target: 250, rewardText: "+1 Abeille Mythique", reward: { type: 'bees', rarity: 'mythic', count: 1 } },
            { target: 500, rewardText: "+2 Abeilles Mythiques & +3 Maîtrise", reward: [{ type: 'bees', rarity: 'mythic', count: 2 }, { type: 'mastery', amount: 3 }] }, // Ajout de maîtrise
            { target: 750, rewardText: "+1 Abeille Divine", reward: { type: 'bees', rarity: 'divine', count: 1 } },
            { target: 1000, rewardText: "+2 Abeilles Divines & +5 Maîtrise", reward: [{ type: 'bees', rarity: 'divine', count: 2 }, { type: 'mastery', amount: 5 }] }, // Ajout de maîtrise
            { target: 1500, rewardText: "+3 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 3 } },            
            { target: 2000, rewardText: "+5 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 5 } }             
        ]
    },
    {
        id: "click_pro",
        title: "Butineur Fou (Clics effectués)",
        getProgress: (gs) => gs.totalClicksHistorical, // Utilise le cumul historique pour ne pas décourager le clic manuel
        tiers: [
            { target: 100, rewardText: "+1 Maîtrise", reward: { type: 'mastery', amount: 1 } },
            { target: 250, rewardText: "+2 Maîtrise", reward: { type: 'mastery', amount: 2 } },
            { target: 500, rewardText: "+1 Abeille Légendaire & +3 Maîtrise", reward: [{ type: 'bees', rarity: 'legendary', count: 1 }, { type: 'mastery', amount: 3 }] },
            { target: 1000, rewardText: "+1 Abeille Mythique & +5 Maîtrise", reward: [{ type: 'bees', rarity: 'mythic', count: 1 }, { type: 'mastery', amount: 5 }] },
            { target: 2500, rewardText: "+10 Maîtrise", reward: { type: 'mastery', amount: 10 } },
            { target: 5000, rewardText: "+20 Maîtrise", reward: { type: 'mastery', amount: 20 } },
            { target: 10000, rewardText: "+2 Abeilles Divines & +30 Maîtrise", reward: [{ type: 'bees', rarity: 'divine', count: 2 }, { type: 'mastery', amount: 30 }] },
            { target: 15000, rewardText: "+40 Maîtrise & +5 Abeilles Divines", reward: [{ type: 'mastery', amount: 40 }, { type: 'bees', rarity: 'divine', count: 5 }] },
            { target: 30000, rewardText: "+50 Maîtrise & +10 Abeilles Divines", reward: [{ type: 'mastery', amount: 50 }, { type: 'bees', rarity: 'divine', count: 10 }] },
            { target: 50000, rewardText: "+75 Maîtrise & +20 Abeilles Divines", reward: [{ type: 'mastery', amount: 75 }, { type: 'bees', rarity: 'divine', count: 20 }] },
            { target: 100000, rewardText: "+150 Maîtrise & +40 Abeilles Divines", reward: [{ type: 'mastery', amount: 150 }, { type: 'bees', rarity: 'divine', count: 40 }] }
        ]
    },
    {
        id: "botanist",
        title: "Botaniste Royal (Fleurs plantées)",
        getProgress: (gs, formulas) => formulas.getTotalFlowers(),
        tiers: [
            { target: 10, rewardText: "+1 Maîtrise", reward: { type: 'mastery', amount: 1 } },
            { target: 25, rewardText: "+2 Maîtrise", reward: { type: 'mastery', amount: 2 } },
            { target: 50, rewardText: "+5 Maîtrise", reward: { type: 'mastery', amount: 5 } },           
            { target: 100, rewardText: "+7 Maîtrise", reward: { type: 'mastery', amount: 7 } },
            { target: 200, rewardText: "+10 Maîtrise", reward: { type: 'mastery', amount: 10 } },
            { target: 300, rewardText: "+10 Maîtrise", reward: { type: 'mastery', amount: 10 } },
            { target: 400, rewardText: "+10 Maîtrise", reward: { type: 'mastery', amount: 10 } },
            { target: 500, rewardText: "+15 Maîtrise", reward: { type: 'mastery', amount: 15 } },
            { target: 600, rewardText: "+15 Maîtrise", reward: { type: 'mastery', amount: 15 } },
            { target: 700, rewardText: "+15 Maîtrise", reward: { type: 'mastery', amount: 15 } },
            { target: 800, rewardText: "+15 Maîtrise", reward: { type: 'mastery', amount: 15 } },
            { target: 900, rewardText: "+20 Maîtrise", reward: { type: 'mastery', amount: 20 } },
            { target: 1000, rewardText: "+20 Maîtrise", reward: { type: 'mastery', amount: 20 } },
            { target: 1500, rewardText: "+20 Maîtrise", reward: { type: 'mastery', amount: 20 } }       
      ]
    },
    {
        id: "ingredient_gatherer",
        title: "Cueilleur Alchimique (Ingrédients)",
        getProgress: (gs) => gs.totalIngredientsCollectedHistorical,
        tiers: [
            { target: 50, rewardText: "+2 Maîtrise", reward: { type: 'mastery', amount: 2 } },
            { target: 250, rewardText: "+5 Maîtrise", reward: { type: 'mastery', amount: 5 } },
            { target: 1000, rewardText: "+15 Maîtrise & +2 Mythiques", reward: [{ type: 'mastery', amount: 15 }, { type: 'bees', rarity: 'mythic', count: 2 }] },
            { target: 2500, rewardText: "+30 Maîtrise & +1 Divine", reward: [{ type: 'mastery', amount: 30 }, { type: 'bees', rarity: 'divine', count: 1 }] },
            { target: 5000, rewardText: "+50 Maîtrise & +5 Divines", reward: [{ type: 'mastery', amount: 50 }, { type: 'bees', rarity: 'divine', count: 5 }] }
        ]
    },
    {
        id: "alchemist",
        title: "Maître Alchimiste (Potions bues)",
        getProgress: (gs) => gs.totalPotionsUsedHistorical || 0,
        tiers: [
            { target: 1, rewardText: "+2 Maîtrise", reward: { type: 'mastery', amount: 2 } },
            { target: 5, rewardText: "+5 Maîtrise", reward: { type: 'mastery', amount: 5 } },
            { target: 10, rewardText: "+10 Maîtrise", reward: { type: 'mastery', amount: 10 } },
            { target: 20, rewardText: "+15 Maîtrise & +1 Abeille Divine", reward: [{ type: 'mastery', amount: 15 }, { type: 'bees', rarity: 'divine', count: 1 }] },
            { target: 30, rewardText: "+20 Maîtrise & +2 Abeilles Divines", reward: [{ type: 'mastery', amount: 20 }, { type: 'bees', rarity: 'divine', count: 2 }] },
            { target: 40, rewardText: "+25 Maîtrise & +3 Abeilles Divines", reward: [{ type: 'mastery', amount: 25 }, { type: 'bees', rarity: 'divine', count: 3 }] },
            { target: 50, rewardText: "+30 Maîtrise & +4 Abeilles Divines", reward: [{ type: 'mastery', amount: 30 }, { type: 'bees', rarity: 'divine', count: 4 }] },
            { target: 60, rewardText: "+35 Maîtrise & +5 Abeilles Divines", reward: [{ type: 'mastery', amount: 35 }, { type: 'bees', rarity: 'divine', count: 5 }] },
            { target: 70, rewardText: "+40 Maîtrise & +6 Abeilles Divines", reward: [{ type: 'mastery', amount: 40 }, { type: 'bees', rarity: 'divine', count: 6 }] },
            { target: 80, rewardText: "+45 Maîtrise & +7 Abeilles Divines", reward: [{ type: 'mastery', amount: 45 }, { type: 'bees', rarity: 'divine', count: 7 }] },
            { target: 90, rewardText: "+50 Maîtrise & +8 Abeilles Divines", reward: [{ type: 'mastery', amount: 50 }, { type: 'bees', rarity: 'divine', count: 8 }] },
            { target: 100, rewardText: "+100 Maîtrise & +10 Abeilles Divines", reward: [{ type: 'mastery', amount: 100 }, { type: 'bees', rarity: 'divine', count: 10 }] }
        ]
    }        
];

export function getAutoclickSpeedDelay() {
    let baseDelay = 1000; 
    let speedFactor = Math.pow(0.85, gameState.royalJelly); 
    let finalDelay = baseDelay * speedFactor;
    return Math.max(100, finalDelay); 
}

export function startAutoclickLoop(formulas) {
    // Sécurité pour éviter les boucles multiples
    if (internalVars.autoclickInterval) {
        clearInterval(internalVars.autoclickInterval);
    }
    let delay = getAutoclickSpeedDelay();
    internalVars.autoclickInterval = setInterval(() => {
        let currentClickPower = formulas.getClickPower();
        let autoGain = 0;

        if (gameState.maxHoneyReached >= 100) autoGain += currentClickPower * 1; 
        if (gameState.maxHoneyReached >= 1000) autoGain += currentClickPower * 5;
        if (autoGain > 0) formulas.addHoney(autoGain);
    }, delay);
}

export function startHornetSpawning(isStorm = false, formulas) {
    // Arrête l'intervalle précédent s'il existe
    if (internalVars.hornetSpawnInterval) {
        clearInterval(internalVars.hornetSpawnInterval);
        internalVars.hornetSpawnInterval = null;
    }

    if (isStorm) {
        // Pendant un orage : un frelon garanti toutes les 10 secondes
        internalVars.hornetSpawnInterval = setInterval(() => {
            spawnHornet(formulas);
        }, 10000);
        Utils.addLog("🚨 L'orage attire les frelons ! Soyez vigilant !", "warning");
    } else {
        // Apparition normale : 30% de chance toutes les 20 secondes
        internalVars.hornetSpawnInterval = setInterval(() => {
            if (Math.random() < 0.30) {
                spawnHornet(formulas);
            }
        }, 20000);
    }
}

export function stopHornetSpawning() {
    if (internalVars.hornetSpawnInterval) {
        clearInterval(internalVars.hornetSpawnInterval);
        internalVars.hornetSpawnInterval = null;
    }
}

export function updateWeather(formulas) {
    const totalWeight = Constants.WEATHER_TYPES.reduce((acc, curr) => acc + curr.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedWeather = Constants.WEATHER_TYPES[0];

    for (const w of Constants.WEATHER_TYPES) {
        if (random < w.weight) {
            selectedWeather = w;
            break;
        }
        random -= w.weight;
    }

    gameState.weather = selectedWeather.name;

    // Ajuste l'apparition des frelons en fonction de la météo
    if (gameState.weather === "Orage") {
        startHornetSpawning(true, formulas);
    } else {
        startHornetSpawning(false, formulas); // Revert to regular spawning
    }

    return { weatherName: selectedWeather.name, weatherDesc: selectedWeather.desc, isRainy: (selectedWeather.name === "Pluie" || selectedWeather.name === "Orage") };
}

export function spawnHornet(formulas) {
    const hornetElement = document.getElementById("hornet");
    if (!hornetElement || !hornetElement.classList.contains("hidden")) return;
    const hornetClicksDisplay = document.getElementById("hornet-clicks");
    internalVars.hornetClicksLeft = 5;
    if(hornetClicksDisplay) hornetClicksDisplay.innerText = internalVars.hornetClicksLeft;

    const randomX = 100 + Math.random() * (window.innerWidth - 250);
    const randomY = 100 + Math.random() * (window.innerHeight - 250);
    hornetElement.style.left = randomX + "px";
    hornetElement.style.top = randomY + "px";
    hornetElement.classList.remove("hidden");
    
    const dashboard = document.querySelector(".game-dashboard");
    dashboard?.classList.add("screen-shake");
    setTimeout(() => dashboard?.classList.remove("screen-shake"), 500);

    Utils.showNotification("🚨 Un frelon approche ! Chassez-le vite !");
    Utils.playSound('hornet');

    internalVars.hornetTimer = setTimeout(() => {
        hornetElement.classList.add("hidden");
        let stolenHoney = Math.min(250, Math.floor(gameState.honey * 0.02));
        const result = { hornetEscaped: true, stolenHoney: 0 };
        if (stolenHoney > 0) {
            formulas.addHoney(-stolenHoney);
            result.stolenHoney = stolenHoney;
        }
        // Stockage du résultat pour le traitement dans la boucle de script.js
        internalVars.pendingHornetResult = result;
    }, 6000);
    return { hornetSpawned: true };
}

export function handleHornetClick(formulas) {
    const hornetElement = document.getElementById("hornet");
    if (!hornetElement || hornetElement.classList.contains("hidden")) return { success: false };
    const hornetClicksDisplay = document.getElementById("hornet-clicks");
    internalVars.hornetClicksLeft--;
    if(hornetClicksDisplay) hornetClicksDisplay.innerText = internalVars.hornetClicksLeft;

    if (internalVars.hornetClicksLeft <= 0) {
        clearTimeout(internalVars.hornetTimer); 
        hornetElement.classList.add("hidden");
        gameState.hornetsDefeated++;
        gameState.discoveredBees.hornet = true;
        gameState.totalHornetsHistorical++;

        const ingredientTypes = [
            { key: 'water', name: 'Eau', icon: '💧' },
            { key: 'petals', name: 'Pétales', icon: '🌸' },
            { key: 'nectar', name: 'Nectar', icon: '🧪' }
        ];
        const lootIng = ingredientTypes[Math.floor(Math.random() * ingredientTypes.length)];
        gameState.ingredients[lootIng.key]++;

        const expResult = formulas.addExp(50);
        return { success: true, hornetDefeated: true, loot: lootIng, expResult };
    }
    return { success: true, hornetDefeated: false };
}

export function spawnGoldenBee(formulas) {
    const bee = document.createElement("div");
    bee.className = "golden-bee";
    bee.innerText = "🐝";
    bee.style.top = (Math.random() * 60 + 20) + "vh";
    document.body.appendChild(bee);
    Utils.playSound('golden');

    bee.onclick = () => {
        Utils.playSound('golden');
        const nacreBonus = 1 + ((formulas.getArtifactCounts()["Aile de Nacre"] || 0) * 0.05);

        const reward = formulas.getBaseCps() * formulas.getPrestigeMultiplier() * Constants.GOLDEN_BEE_REWARD_SECONDS * nacreBonus; 
        gameState.discoveredBees.golden = true;
        gameState.totalGoldenBeesHistorical++;
        formulas.addHoney(reward);
        gameState.activePotions.frenzy = Constants.GOLDEN_BEE_FRENZY_DURATION;
        
        Utils.showNotification(`⚡ ABEILLE D'OR ! +${Utils.formatNumber(reward)} 🍯 et FRÉNÉSIE x5 (10s) !`, "frenzy");

        // Effet visuel : Pluie de pollen pour l'Abeille d'Or
        // On génère 50 particules qui tombent du ciel
        for (let i = 0; i < 50; i++) {
            const p = document.createElement("div");
            p.className = "pollen-rain-particle";
            p.style.left = Math.random() * 100 + "vw";
            p.style.top = (Math.random() * -25) + "vh";
            p.style.animationDuration = (1.2 + Math.random() * 2) + "s";
            p.style.animationDelay = (Math.random() * 0.8) + "s";
            p.style.background = "#ffcc00"; // Un jaune miel un peu plus saturé
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 4000);
        }

        bee.remove();
        UI.updateDisplay();
        Storage.queueSave();

        return { goldenBeeCollected: true, reward, frenzyDuration: Constants.GOLDEN_BEE_FRENZY_DURATION };
    };

    setTimeout(() => { if(bee.parentNode) bee.remove(); }, 15000);
    return { goldenBeeSpawned: true };
}

export function spawnArtifactDiamond(formulas) {
    const diamond = document.createElement("div");
    diamond.className = "artifact-diamond";
    diamond.innerText = "💎"; 
    diamond.style.top = (Math.random() * 50 + 25) + "vh";
    document.body.appendChild(diamond);

    diamond.onclick = () => {
        diamond.onclick = null; // Désactive le clic pour éviter les doubles clics
        const items = ["Aiguillon", "Vieux Pot", "Pollen d'Or", "Aile de Nacre"];
        const availableItems = items.filter(art => 
            gameState.artifacts.filter(a => a === art).length < 2
        );

        let result = {};

        if (availableItems.length > 0) {
            const loot = availableItems[Math.floor(Math.random() * availableItems.length)];
            gameState.artifacts.push(loot);
            gameState.totalArtifactsHistorical++;

            Utils.playSound('collect');
            UI.renderArtifacts(); // Déclenche le rendu des artefacts
            Utils.showNotification("💎 ARTEFACT TROUVÉ : " + loot + " !");
            Utils.addLog(`💎 Diamant de Cristal récupéré ! Artefact obtenu : <b>${loot}</b>`, "artifact");

            result = { artifactFound: true, loot };
        } else {
            const reward = formulas.getBaseCps() * formulas.getPrestigeMultiplier() * 60;
            formulas.addHoney(reward);
            Utils.playSound('collect');
            Utils.showNotification("✨ Collection complète ! Bonus : +" + Utils.formatNumber(reward) + " 🍯");
            
            // Effet visuel : Pluie de pollen intense
            for (let i = 0; i < 70; i++) {
                const p = document.createElement("div");
                p.className = "pollen-rain-particle";
                p.style.left = Math.random() * 100 + "vw";
                p.style.top = (Math.random() * -30) + "vh";
                p.style.animationDuration = (1.5 + Math.random() * 2.5) + "s";
                p.style.animationDelay = (Math.random() * 1.5) + "s";
                p.style.opacity = (0.5 + Math.random() * 0.5);
                document.body.appendChild(p);
                setTimeout(() => p.remove(), 4500);
            }

            result = { artifactFound: false, collectionComplete: true, reward };
        }

        diamond.remove(); // Supprime le diamant après le clic
        // Assurez-vous que l'UI est mise à jour après la récompense
        UI.updateDisplay();
        Storage.queueSave();

        return result;
    };

    setTimeout(() => { if(diamond.parentNode) diamond.remove(); }, 12000);
    return { diamondSpawned: true };
}

export function scheduleNextRain(formulas, isInitial = false, isForced = false) {
    const now = Date.now();

    // Annule tout futur déclenchement de pluie déjà programmé
    if (internalVars.rainTimeout) clearTimeout(internalVars.rainTimeout);
    
    if (isInitial && gameState.nextRainTime > now) {
        internalVars.rainTimeout = setTimeout(() => startIngredientRain(formulas), gameState.nextRainTime - now);
        return { scheduled: true };
    }

    let delay = (10 + Math.random() * 5) * 60 * 1000; // 10-15 minutes
    if (isForced) {
        delay = (20 + Math.random() * 10) * 60 * 1000; // Si forcée, la prochaine pluie naturelle est plus tard (20-30 min)
    }

    gameState.nextRainTime = now + delay;
    internalVars.rainTimeout = setTimeout(() => startIngredientRain(formulas), delay);
    return { scheduled: true, nextRainTime: gameState.nextRainTime };
}

export function startIngredientRain(formulas) {
    Utils.playSound('rain');
    Utils.showNotification("☁️ Des nuages magiques approchent... Une pluie d'ingrédients arrive !", "info");

    const dashboard = document.querySelector('.game-dashboard');
    if (dashboard) dashboard.classList.add('rain-active-ui');

    spawnArtifactDiamond(formulas);
    
    let endTime = Date.now() + 30000;
    let spawnInterval = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(spawnInterval);
            if (dashboard) dashboard.classList.remove('rain-active-ui');
            scheduleNextRain(formulas);
            Utils.showNotification("☀️ Le ciel se dégage. La pluie est terminée.", "info");
            return;
        }
        spawnIngredient();
    }, 800);
    return { rainStarted: true };
}

export function spawnIngredient() {
    const types = [
        { key: 'water', icon: '💧' },
        { key: 'petals', icon: '🌸' },
        { key: 'nectar', icon: '🧪' }
    ];

    const roll = Math.random();
    let type;
    if (roll < 0.65) type = types[0];
    else if (roll < 0.92) type = types[1];
    else type = types[2];
    
    const el = document.createElement("div");
    el.className = "falling-ingredient";
    el.innerHTML = type.icon;
    el.style.left = (Math.random() * 80 + 10) + "vw";
    el.style.top = "-50px";
    el.style.position = "fixed";
    el.style.zIndex = "1000";
    el.style.fontSize = "4rem";
    el.style.cursor = "pointer";
    el.style.transition = "transform 2.5s linear, opacity 1s";
    document.body.appendChild(el);

    setTimeout(() => {
        el.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`;
    }, 50);

    el.onclick = () => {
        gameState.ingredients[type.key]++;
        gameState.totalIngredientsCollectedHistorical++;
        el.remove();
        return { ingredientCollected: true, type };
    };

    setTimeout(() => { if(el.parentNode) el.remove(); }, 5000);
    return { ingredientSpawned: true };
}

export function handleDonatorAutoLoot() {
    if ((gameState.donatorTier || 0) < 4) return { autoLooted: false };
    
    const items = document.querySelectorAll(".falling-ingredient");
    let collectedCount = 0;
    items.forEach(item => {
        const clickResult = item.onclick(); // Simule le clic
        if (clickResult && clickResult.ingredientCollected) collectedCount++;
    });
    return { autoLooted: true, collectedCount };
}

export function forceRain(formulas) {
    const cost = formulas.getForceRainCost();
    if (gameState.honey >= cost) {
        if (confirm(`Voulez-vous dépenser ${Utils.formatNumber(cost)} 🍯 pour déclencher une pluie d'ingrédients maintenant ?`)) {
            gameState.honey -= cost;
            startIngredientRain(formulas); // Passe formulas
            scheduleNextRain(formulas, false, true);
            return { success: true, cost };
        }
    } else {
        return { success: false, message: "Miel insuffisant pour forcer une pluie." };
    }
    return { success: false, message: "Action annulée." };
}

export function initGameLogicSystems(formulas) {
    startAutoclickLoop(formulas);
    startHornetSpawning(false, formulas); // Démarre l'apparition normale des frelons au début du jeu
    scheduleNextRain(formulas, true); // Passe formulas et active le mode initial
}

export function getMissionProgress(mission, formulas) {
    return Math.max(0, mission.getProgress(gameState, formulas));
}

export function claimMission(missionId, formulas) {
    const mission = MISSIONS.find((item) => item.id === missionId);
    if (!mission) return { success: false, message: "Mission introuvable." };
    
    const currentTierIdx = gameState.missionsClaimed[missionId] || 0;
    const isMaxed = currentTierIdx >= mission.tiers.length;
    if (isMaxed) return { success: false, message: "Mission déjà complétée." };

    const currentTier = mission.tiers[currentTierIdx];

    if (getMissionProgress(mission, formulas) >= currentTier.target) {
        gameState.missionsClaimed[missionId] = currentTierIdx + 1;
        
        const rewards = Array.isArray(currentTier.reward) ? currentTier.reward : [currentTier.reward];
        let notificationMessages = [];
        let expGained = 0;

        rewards.forEach(reward => {
            if (!reward) return;
            switch (reward.type) {
                case 'exp': 
                    expGained += reward.amount;
                    notificationMessages.push(`+${reward.amount} XP`);
                    break;
                case 'bees': 
                    gameState[`bees${reward.rarity.charAt(0).toUpperCase() + reward.rarity.slice(1)}`] += reward.count; 
                    gameState.discoveredBees[reward.rarity] = true; 
                    notificationMessages.push(`+${reward.count} Abeille(s) ${reward.rarity.charAt(0).toUpperCase() + reward.rarity.slice(1)}`);
                    break;
                case 'mastery': 
                    gameState.masteryPoints += reward.amount; 
                    notificationMessages.push(`+${reward.amount} Point(s) de Maîtrise`);
                    break;
            }
        });

        expGained += 100; // Bonus XP fixe pour chaque mission
        const expResult = formulas.addExp(expGained);

        return { success: true, rewardText: currentTier.rewardText, notificationMessages, expResult };
    }
    return { success: false, message: "Objectif non atteint." };
}