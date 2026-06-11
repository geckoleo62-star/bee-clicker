/**
 * gameLogic.js
 * Gère les événements dynamiques du jeu (météo, frelons, abeille d'or, pluie, auto-clic).
 */

import { gameState, internalVars } from './state.js';
import * as Constants from './constants.js';
import * as Utils from './utils.js';
import * as Formulas from './formulas.js';
import * as UI from './ui.js';
import * as Storage from './storage.js';

export const MISSIONS = [
    {
        id: "honey_master",
        title: "Maître du Miel (Record de miel)",
        getProgress: () => gameState.maxHoneyReached,
        tiers: [
            { target: 5000, rewardText: "+1 Maîtrise", reward: { type: 'mastery', amount: 1 } },
            { target: 500000, rewardText: "+1 Abeille Légendaire", reward: { type: 'bees', rarity: 'legendary', count: 1 } },
            { target: 5000000, rewardText: "+1 Abeille Mythique", reward: { type: 'bees', rarity: 'mythic', count: 1 } },
            { target: 50000000, rewardText: "+4 Maîtrise", reward: { type: 'mastery', amount: 4 } },
            { target: 5000000000, rewardText: "+1 Abeille Mythique", reward: { type: 'bees', rarity: 'mythic', count: 1 } },
            { target: 50000000000, rewardText: "+2 Abeille Mythiques", reward: { type: 'bees', rarity: 'mythic', count: 2 } },
            { target: 500000000000, rewardText: "+3 Abeille Mythiques", reward: { type: 'bees', rarity: 'mythic', count: 3 } }
         ]
    },
    {
        id: "hornet_hunter",
        title: "Protecteur de la Ruche (Frelons chassés)",
        getProgress: () => gameState.hornetsDefeated,
        tiers: [
            { target: 5, rewardText: "+2 Maîtrise", reward: { type: 'mastery', amount: 2 } },
            { target: 20, rewardText: "+1 Abeille Légendaire", reward: { type: 'bees', rarity: 'legendary', count: 1 } },
            { target: 50, rewardText: "+2 Abeilles Légendaires", reward: { type: 'bees', rarity: 'legendary', count: 2 } },
            { target: 75, rewardText: "+2 Abeilles Mythiques", reward: { type: 'bees', rarity: 'mythic', count: 2 } },
            { target: 100, rewardText: "+5 Maîtrise", reward: { type: 'mastery', amount: 5 } },
            { target: 200, rewardText: "+4 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 4 } }
        ]
    },
    {
        id: "bee_collector",
        title: "Grand Essaim (Abeilles totales)",
        getProgress: () => Formulas.getTotalBees(),
        tiers: [
            { target: 10, rewardText: "+1 Maîtrise", reward: { type: 'mastery', amount: 1 } },
            { target: 50, rewardText: "+1 Abeilles Légendaire", reward: { type: 'bees', rarity: 'legendary', count: 1 } },
            { target: 100, rewardText: "+2 Abeilles Légendaires", reward: { type: 'bees', rarity: 'legendary', count: 2 } },
            { target: 250, rewardText: "+1 Abeilles Mythique", reward: { type: 'bees', rarity: 'mythic', count: 1 } },
            { target: 500, rewardText: "+2 Abeilles Mythiques", reward: { type: 'bees', rarity: 'mythic', count: 2 } },
            { target: 750, rewardText: "+1 Abeille Divine", reward: { type: 'bees', rarity: 'divine', count: 1 } },
            { target: 1000, rewardText: "+2 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 2 } },            
            { target: 1500, rewardText: "+3 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 3 } },            
            { target: 2000, rewardText: "+4 Abeilles Divines", reward: { type: 'bees', rarity: 'divine', count: 4 } }             
        ]
    },
    {
        id: "click_pro",
        title: "Butineur Fou (Clics effectués)",
        getProgress: () => gameState.totalClicks,
        tiers: [
            { target: 500, rewardText: "+1 Maîtrise", reward: { type: 'mastery', amount: 1 } },
            { target: 5000, rewardText: "+1 Abeille Légendaire", reward: { type: 'bees', rarity: 'legendary', count: 1 } },
            { target: 20000, rewardText: "+1 Abeille Mythique", reward: { type: 'bees', rarity: 'mythic', count: 1 } },
            { target: 150000, rewardText: "+4 Maîtrise", reward: { type: 'mastery', amount: 5 } },
            { target: 1000000, rewardText: "+1 Abeille Divine", reward: { type: 'bees', rarity: 'divine', count: 1 } }
        ]
    },
    {
        id: "botanist",
        title: "Botaniste Royal (Fleurs plantées)",
        getProgress: () => Formulas.getTotalFlowers(),
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
        id: "alchemist",
        title: "Maître Alchimiste (Potions bues)",
        getProgress: () => gameState.totalPotionsUsed || 0,
        tiers: [
            { target: 1, rewardText: "+2 Maîtrise", reward: { type: 'mastery', amount: 2 } },
            { target: 5, rewardText: "+5 Maîtrise", reward: { type: 'mastery', amount: 5 } },
            { target: 10, rewardText: "+10 Maîtrise", reward: { type: 'mastery', amount: 10 } },
            { target: 25, rewardText: "+1 Abeille Divine", reward: { type: 'bees', rarity: 'divine', count: 1 } }
        ]
    }
];

export function getAutoclickSpeedDelay() {
    let baseDelay = 1000; 
    let speedFactor = Math.pow(0.85, gameState.royalJelly); 
    let finalDelay = baseDelay * speedFactor;
    return Math.max(100, finalDelay); 
}

export function startAutoclickLoop() {
    // Sécurité pour éviter les boucles multiples
    if (internalVars.autoclickInterval) {
        clearInterval(internalVars.autoclickInterval);
    }
    let delay = getAutoclickSpeedDelay();
    internalVars.autoclickInterval = setInterval(() => {
        let currentClickPower = Formulas.getClickPower();
        let autoGain = 0;

        if (gameState.maxHoneyReached >= 100) autoGain += currentClickPower * 1; 
        if (gameState.maxHoneyReached >= 1000) autoGain += currentClickPower * 5;
        if (autoGain > 0) Formulas.addHoney(autoGain);
        UI.updateDisplay();
    }, delay);
}

export function startHornetSpawning(isStorm = false) {
    // Arrête l'intervalle précédent s'il existe
    if (internalVars.hornetSpawnInterval) {
        clearInterval(internalVars.hornetSpawnInterval);
        internalVars.hornetSpawnInterval = null;
    }

    if (isStorm) {
        // Pendant un orage : un frelon garanti toutes les 10 secondes
        internalVars.hornetSpawnInterval = setInterval(() => {
            spawnHornet();
        }, 10000);
        Utils.addLog("🚨 L'orage attire les frelons ! Soyez vigilant !", "warning");
    } else {
        // Apparition normale : 30% de chance toutes les 20 secondes
        internalVars.hornetSpawnInterval = setInterval(() => {
            if (Math.random() < 0.30) {
                spawnHornet();
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

export function updateWeather() {
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

    if (gameState.weather === "Pluie" || gameState.weather === "Orage") {
        Utils.playSound('rain');
    }

    // Ajuste l'apparition des frelons en fonction de la météo
    if (gameState.weather === "Orage") {
        startHornetSpawning(true);
    } else {
        startHornetSpawning(false); // Revert to regular spawning
    }

    Utils.addLog(`🌤️ Météo : <b>${selectedWeather.name}</b> (${selectedWeather.desc})`, "weather");
    Utils.showNotification(`🌤️ La météo change : ${selectedWeather.name} (${selectedWeather.desc})`);
    
    UI.updateDisplay();
}

export function spawnHornet() {
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
    
    Utils.showNotification("🚨 Un frelon approche ! Chassez-le vite !");

    const dashboard = document.querySelector(".game-dashboard");
    dashboard?.classList.add("screen-shake");
    setTimeout(() => dashboard?.classList.remove("screen-shake"), 500);

    Utils.playSound('hornet');

    internalVars.hornetTimer = setTimeout(() => {
        let stolenHoney = Math.min(250, Math.floor(gameState.honey * 0.02));
        if (stolenHoney > 0) {
            gameState.honey -= stolenHoney;
            if (gameState.honey < 0) gameState.honey = 0;
            Utils.showNotification("🚨 Frelon évité trop tard : -" + stolenHoney + " 🍯");
            Utils.addLog(`🚨 Un frelon a volé <b>${Utils.formatNumber(stolenHoney)}</b> 🍯 !`, "warning");
        } else {
            Utils.showNotification("🍃 Le frelon est reparti sans butin.");
        }
        hornetElement.classList.add("hidden");
        UI.updateDisplay();
        Storage.queueSave();
    }, 6000); 
}

export function handleHornetClick() {
    const hornetElement = document.getElementById("hornet");
    if (!hornetElement || hornetElement.classList.contains("hidden")) return;
    const hornetClicksDisplay = document.getElementById("hornet-clicks");
    internalVars.hornetClicksLeft--;
    if(hornetClicksDisplay) hornetClicksDisplay.innerText = internalVars.hornetClicksLeft;

    Utils.playSound('click');

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

        Formulas.addExp(50);

        Utils.showNotification(`⚔️ Frelon chassé ! Récompense : 1 ${lootIng.icon} ${lootIng.name}`);
        Utils.addLog(`⚔️ Frelon repoussé ! Récompense : 1 <b>${lootIng.icon}</b>`, "success");
        UI.updateDisplay();
        Storage.queueSave();
    }
}

export function spawnGoldenBee() {
    const bee = document.createElement("div");
    bee.className = "golden-bee";
    bee.innerText = "🐝";
    bee.style.top = (Math.random() * 60 + 20) + "vh";
    document.body.appendChild(bee);
    Utils.playSound('golden');

    Utils.showNotification("✨ Une Abeille d'Or survole la ruche !");

    bee.onclick = () => {
        Utils.playSound('golden');
        const nacreBonus = 1 + ((Formulas.getArtifactCounts()["Aile de Nacre"] || 0) * 0.20);

        const reward = Formulas.getBaseCps() * Formulas.getPrestigeMultiplier() * 10 * nacreBonus; 
        gameState.discoveredBees.golden = true;
        Formulas.addHoney(reward);
        gameState.activePotions.frenzy = 12;
        Utils.showNotification(`⚡ ABEILLE D'OR ! +${Utils.formatNumber(reward)} 🍯 et FRÉNÉSIE x5 (12s) !`, "frenzy");
        bee.remove();
        UI.updateDisplay();
    };

    setTimeout(() => { if(bee.parentNode) bee.remove(); }, 15000);
}

export function spawnArtifactDiamond() {
    const diamond = document.createElement("div");
    diamond.className = "artifact-diamond";
    diamond.innerText = "💎"; 
    diamond.style.top = (Math.random() * 50 + 25) + "vh";
    document.body.appendChild(diamond);
    Utils.playSound('collect');

    Utils.showNotification("💎 Un Diamant de Cristal est apparu !");

    diamond.onclick = () => {
        const items = ["Aiguillon", "Vieux Pot", "Pollen d'Or", "Aile de Nacre"];
        const availableItems = items.filter(art => 
            gameState.artifacts.filter(a => a === art).length < 2
        );

        if (availableItems.length > 0) {
            const loot = availableItems[Math.floor(Math.random() * availableItems.length)];
            gameState.artifacts.push(loot);
            gameState.totalArtifactsHistorical++;
            UI.renderArtifacts();
            Utils.showNotification("💎 ARTEFACT TROUVÉ : " + loot + " !");
            Utils.addLog(`💎 Diamant de Cristal récupéré ! Artefact obtenu : <b>${loot}</b>`, "artifact");
            Storage.flushSave(); // Sécurité : sauvegarde immédiate de l'artefact
        } else {
            const reward = Formulas.getBaseCps() * Formulas.getPrestigeMultiplier() * 60;
            Formulas.addHoney(reward);
            Utils.showNotification("✨ Collection complète ! Bonus : +" + Utils.formatNumber(reward) + " 🍯");
            Utils.addLog("✨ Collection d'artefacts complète ! Le diamant explose en miel.", "success");
        }

        Utils.playSound('collect');
        diamond.remove();
        UI.updateDisplay();
    };

    setTimeout(() => { if(diamond.parentNode) diamond.remove(); }, 12000);
}

export function scheduleNextRain(isInitial = false, isForced = false) {
    const now = Date.now();

    // Annule tout futur déclenchement de pluie déjà programmé
    if (internalVars.rainTimeout) clearTimeout(internalVars.rainTimeout);
    
    if (isInitial && gameState.nextRainTime > now) {
        internalVars.rainTimeout = setTimeout(startIngredientRain, gameState.nextRainTime - now);
        return;
    }

    let delay = (10 + Math.random() * 5) * 60 * 1000; // 10-15 minutes
    if (isForced) {
        delay = (20 + Math.random() * 10) * 60 * 1000; // Si forcée, la prochaine pluie naturelle est plus tard (20-30 min)
    }

    gameState.nextRainTime = now + delay;
    internalVars.rainTimeout = setTimeout(startIngredientRain, delay);
    Storage.queueSave();
}

export function startIngredientRain() {
    Utils.playSound('rain');
    Utils.showNotification("☁️ Des nuages magiques approchent... Une pluie d'ingrédients arrive !", "info");
    
    const dashboard = document.querySelector('.game-dashboard');
    if (dashboard) dashboard.classList.add('rain-active-ui');

    spawnArtifactDiamond();
    
    let endTime = Date.now() + 30000;
    let spawnInterval = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(spawnInterval);
            if (dashboard) dashboard.classList.remove('rain-active-ui');
            Utils.showNotification("☀️ Le ciel se dégage. La pluie est terminée.", "info");
            scheduleNextRain();
            return;
        }
        spawnIngredient();
    }, 800);
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
        Utils.playSound('collect');
        el.remove();
        UI.updateDisplay();
    };

    setTimeout(() => { if(el.parentNode) el.remove(); }, 5000);
}

export function handleDonatorAutoLoot() {
    if ((gameState.donatorTier || 0) < 4) return;
    
    const items = document.querySelectorAll(".falling-ingredient");
    items.forEach(item => {
        item.click();
    });
}

export function initGameLogicSystems() {
    startAutoclickLoop();
    startHornetSpawning(false); // Démarre l'apparition normale des frelons au début du jeu
    scheduleNextRain();
}

export function getMissionProgress(mission) {
    return Math.max(0, mission.getProgress(gameState, Formulas));
}

export function claimMission(missionId) {
    const mission = MISSIONS.find((item) => item.id === missionId);
    if (!mission) return;
    
    const currentTierIdx = gameState.missionsClaimed[missionId] || 0;
    const isMaxed = currentTierIdx >= mission.tiers.length;
    if (isMaxed) return;

    const currentTier = mission.tiers[currentTierIdx];

    if (getMissionProgress(mission) >= currentTier.target) {
        gameState.missionsClaimed[missionId] = currentTierIdx + 1;
        
        const reward = currentTier.reward;
        if (reward) {
            switch (reward.type) {
                case 'exp': Formulas.addExp(reward.amount); break;
                case 'bees': gameState[`bees${reward.rarity.charAt(0).toUpperCase() + reward.rarity.slice(1)}`] += reward.count; gameState.discoveredBees[reward.rarity] = true; Utils.showNotification(`🎁 Cadeau : ${reward.count} Abeille(s) ${reward.rarity.charAt(0).toUpperCase() + reward.rarity.slice(1)} !`); break;
                case 'mastery': gameState.masteryPoints += reward.amount; break;
            }
        }

        Formulas.addExp(100);
        Utils.showNotification(`🎯 Palier atteint : ${currentTier.rewardText}`);
        UI.renderMissions();
        UI.updateDisplay(); 
        Storage.flushSave(); // Sécurité : sauvegarde immédiate du gain de mission
    }
}
