/**
 * formulas.js
 * Contient toutes les fonctions de calcul du jeu (production, clic, coûts, XP, etc.).
 */

import { gameState, internalVars } from './state.js';
import * as Constants from './constants.js';
import * as Utils from './utils.js';
import * as UI from './ui.js';
import * as Storage from './storage.js';
import * as GameLogic from './gameLogic.js';

export const MAX_LUCK_CAP = 50; // Augmentation du plafond pour laisser de la place à la progression

export function getCurrentWeather() {
    return Constants.WEATHER_TYPES.find(w => w.name === gameState.weather) || Constants.WEATHER_TYPES[0];
}

export function getHiveParadigm() {
    const rj = gameState.royalJelly;
    if (rj >= 5) return { id: "divine", name: "La Divinité", desc: "Production exponentielle par essaim" };
    if (rj >= 3) return { id: "mind", name: "La Conscience", desc: "Le Clic est indexé sur la Production" };
    if (rj >= 1) return { id: "swarm", name: "L'Essaim", desc: "Multiplicateurs de fleurs globaux" };
    return { id: "dawn", name: "L'Aube", desc: "Croissance linéaire standard" };
}

export function getTotalBees() {
    return gameState.beesCommon + gameState.beesRare + gameState.beesLegendary + gameState.beesMythic + gameState.beesDivine;
}

export function getArtifactCounts() {
    return gameState.artifacts.reduce((acc, art) => {
        acc[art] = (acc[art] || 0) + 1;
        return acc;
    }, {});
}

export function getTotalFlowers() {
    return gameState.lavenderLvl + gameState.sunflowerLvl + gameState.roseLvl + 
           gameState.daisyLvl + gameState.orchidLvl + gameState.lilyLvl + 
           gameState.tulipLvl + gameState.poppyLvl + gameState.lotusLvl + 
           gameState.hibiscusLvl;
}

export function getTotalMissionTiersClaimed() {
    let total = 0;
    for (let key in gameState.missionsClaimed) {
        total += gameState.missionsClaimed[key];
    }
    return total;
}

export function getPrestigeMultiplier() {
    return Math.pow(3, gameState.royalJelly);
}

export function getBaseCps() {
    const paradigm = getHiveParadigm();
    let boostCommon = 1 + (gameState.lavenderLvl * 0.05) + (gameState.lilyLvl * 0.08);
    let boostRare = 1 + (gameState.sunflowerLvl * 0.05) + (gameState.tulipLvl * 0.08);
    let boostLegendary = 1 + (gameState.roseLvl * 0.05) + (gameState.poppyLvl * 0.08);
    let boostMythic = 1 + (gameState.daisyLvl * 0.05) + (gameState.lotusLvl * 0.08);
    let boostDivine = 1 + (gameState.orchidLvl * 0.05) + (gameState.hibiscusLvl * 0.08);

    let globalFlowerMult = 1; 
    let base = 0;
    
    if (paradigm.id === "dawn") {
        base = (gameState.beesCommon * Constants.PROD_COMMON * boostCommon) +
               (gameState.beesRare * Constants.PROD_RARE * boostRare) +
               (gameState.beesLegendary * Constants.PROD_LEGENDARY * boostLegendary) +
               (gameState.beesMythic * Constants.PROD_MYTHIC * boostMythic) +
               (gameState.beesDivine * Constants.PROD_DIVINE * boostDivine);
    } else {
        let rawProd = (gameState.beesCommon * Constants.PROD_COMMON) + 
                      (gameState.beesRare * Constants.PROD_RARE) + 
                      (gameState.beesLegendary * Constants.PROD_LEGENDARY) +
                      (gameState.beesMythic * Constants.PROD_MYTHIC) +
                      (gameState.beesDivine * Constants.PROD_DIVINE);
        
        // Application d'un amortissement sur la synergie pour éviter l'explosion en late-game
        let flowerSynergy = boostCommon * boostRare * boostLegendary * boostMythic * boostDivine * globalFlowerMult;
        base = rawProd * Math.pow(flowerSynergy, 0.7);
        
        if (paradigm.id === "divine") {
            base *= Math.pow(1.002, getTotalBees()); // Passé à 0.2% composé pour plus de punch
        }
    }
    
    // On récupère les comptes d'artefacts et les multiplicateurs
    const artCounts = getArtifactCounts();
    const honeycombBonus = 1 + (gameState.honeycombLvl * 0.02);
    const celestialBonus = 1 + (gameState.prestigeBoostLevel * 0.05);
    const danceBonus = 1 + (gameState.danceLvl * 0.02);
    const filterBonus = 1 + (gameState.filterLvl * 0.02);
    const meadBonus = 1 + (gameState.meadLvl * 0.03);
    const hivenetBonus = 1 + (gameState.hivenetLvl * 0.03);
    const waxBonus = 1 + (gameState.waxLvl * 0.04);
    const jellyBonus = 1 + (gameState.jellyLvl * 0.05);
    
    const weatherData = getCurrentWeather();
    const artifactBonus = 1 + ((artCounts["Vieux Pot"] || 0) * 0.10);
    const missionBonus = 1 + (getTotalMissionTiersClaimed() * 0.02);
    
    // Point n°7 : Conversion de la chance excédentaire en production (+0.25% par point au-delà du cap)
    const totalLuck = getTotalLuck();
    const excessLuck = Math.max(0, totalLuck - MAX_LUCK_CAP);
    const luckConversionBonus = 1 + (excessLuck * 0.0025);

    const beedexBonus = getBeedexBonus();

    let potionBonus = gameState.activePotions.honey > 0 ? 2 : 1;
    let frenzyBonus = gameState.activePotions.frenzy > 0 ? 5 : 1;

    const levelMultiplier = 1 + (gameState.level - 1) * 0.01;
    const comboMultiplier = 1 + (Math.min(gameState.comboCount || 0, 25) * 0.01);

    return base * celestialBonus * levelMultiplier * comboMultiplier * honeycombBonus * danceBonus * filterBonus * meadBonus * hivenetBonus * waxBonus * jellyBonus * weatherData.prod * artifactBonus * missionBonus * luckConversionBonus * beedexBonus * potionBonus * frenzyBonus;
}

export function getBeedexBonus() {
    const discoveredCount = Object.values(gameState.discoveredBees).filter(v => v).length;
    return 1 + (discoveredCount * 0.01); // +1% par espèce découverte
}

export function getClickPower() {

    const artCounts = getArtifactCounts();
    const weatherData = getCurrentWeather();  
    const potionBonus = gameState.activePotions.click > 0 ? 3 : 1;
    const gloveBonus = 1 + (gameState.glovesLvl * 0.05);
    const stingerBonus = 1 + (gameState.stingerLvl * 0.06);
    const celestialBonus = 1 + (gameState.prestigeBoostLevel * 0.05);
    const artifactBonus = 1 + ((artCounts["Aiguillon"] || 0) * 0.05);
    const paradigm = getHiveParadigm();

    // Puissance de base pure (commence à 1 au niveau 1)
    let baseClick = (gameState.clickLevel + gameState.masteryClickBonus);
    
    if (paradigm.id === "mind" || paradigm.id === "divine") {
        baseClick += (getBaseCps() * 0.02);
    }

    const levelMultiplier = 1 + (gameState.level - 1) * 0.01;
    const comboMultiplier = 1 + (Math.min(gameState.comboCount || 0, 25) * 0.01);

    return baseClick * getPrestigeMultiplier() * levelMultiplier * comboMultiplier * gloveBonus * stingerBonus * weatherData.click * artifactBonus * potionBonus * celestialBonus;
}

export function getTotalLuck() {
    const artifactLuck = (getArtifactCounts()["Pollen d'Or"] || 0) * 0.5;
    return (gameState.nectarLvl * 0.1) + gameState.masteryLuckBonus + artifactLuck;
}

export function getRarityThresholds() {
    const luck = getTotalLuck();
    const hasPotion = gameState.activePotions.luck > 0;

    const total = getTotalBees();

    return {
        // Formules lissées : le bonus max est plus haut, mais s'atteint plus lentement
        // Exemple Divine : +1% max -> +2% max, atteint à 100 de Luck (ou 50 + potion)
        divine: (total >= 250) ? (0.1 + Math.min(luck * 0.02, 2.0) + (hasPotion ? 0.5 : 0)) : 0,
        mythic: (total >= 100) ? (1.5 + Math.min(luck * 0.1, 5.0) + (hasPotion ? 2.0 : 0)) : 0,
        legendary: (total >= 50) ? (8 + Math.min(luck * 0.2, 10.0) + (hasPotion ? 4.0 : 0)) : 0,
        rare: (total >= 20) ? (35 + Math.min(luck * 0.4, 20.0) + (hasPotion ? 10.0 : 0)) : 0
    };
}

export function getPrestigeCost() {
    let baseCost = 50000; 
    return baseCost * Math.pow(12.5, gameState.royalJelly);
}

export function getEarnedMasteryPoints() {
    if (gameState.highestHoneyEver < 50000) return 0;
    const logRatio = Math.log10(gameState.highestHoneyEver / 50000);
    const potential = Math.floor(5 * (logRatio + 1e-9)) + 1;
    let earned = Math.max(0, potential - (gameState.totalMasteryEarned || 0));
    
    // Si le joueur est en mesure de faire une ascension mais que son record ne rapporte
    // pas de point "naturel", on lui offre 1 point de pitié pour récompenser le prestige.
    if (earned === 0) earned = 1;

    if (gameState.totalMasteryEarned === 0 && gameState.highestHoneyEver >= 50000) {
        earned = Math.max(earned, 5);
    }
    return earned;
}

export function addHoney(amount) {
    gameState.honey = Math.max(0, gameState.honey + amount);
    gameState.totalHoneyProduced += amount;
    if (gameState.honey > gameState.maxHoneyReached) {
        gameState.maxHoneyReached = gameState.honey;
        const honeyDisplayDiv = UI.ui["honey"]?.parentElement; 
        if (honeyDisplayDiv) {
            honeyDisplayDiv.classList.remove("pulse-animation");
            void honeyDisplayDiv.offsetWidth;
            honeyDisplayDiv.classList.add("pulse-animation");
        }
    }
    if (gameState.honey > gameState.highestHoneyEver) {
        gameState.highestHoneyEver = gameState.honey;
    }
}

export function addExp(amount) {
    if (isNaN(amount) || amount <= 0) return;
    gameState.exp += amount;
    
    let levelsGained = 0;
    while (gameState.exp >= gameState.expNextLevel && levelsGained < 100) {
        if (gameState.expNextLevel < 1) gameState.expNextLevel = 1;

        gameState.exp -= gameState.expNextLevel;
        gameState.level++;
        gameState.expNextLevel = Math.max(1, Math.floor(100 * Math.pow(1.3, gameState.level - 1)));
        Utils.showNotification(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes niveau ${gameState.level}`);
        Utils.addLog(`✨ Niveau Supérieur ! Vous êtes maintenant niveau <b>${gameState.level}</b>.`, "level");
        Utils.playSound('levelup'); // Joue le son de passage de niveau

        // Déclenche l'animation visuelle sur le numéro de niveau
        const playerLevelEl = document.getElementById("player-level");
        if (playerLevelEl) {
            playerLevelEl.classList.remove("level-up-animation"); // Réinitialise l'animation si elle est déjà active
            void playerLevelEl.offsetWidth; // Force le reflow pour redéclencher l'animation
            playerLevelEl.classList.add("level-up-animation");
        }
        
        addHoney(gameState.level * 100 * getPrestigeMultiplier());

        if (gameState.level % 10 === 0) {
            gameState.masteryPoints++;
            Utils.showNotification("🎁 Récompense de palier : +1 Point de Maîtrise !", "divine");
            Storage.flushSave(); // Sécurité : sauvegarde immédiate du point de maîtrise
        }
        levelsGained++;
    }
    UI.updateXPUI();
}

export function getBulkCost(costKey, lvlKey, multiplier, maxLvl = Infinity) {
    let amount = gameState.buyAmount;
    if (amount === -1) {
        const { totalCost } = calculateBulkPurchase(gameState[costKey], gameState[lvlKey], -1, multiplier, maxLvl);
        return totalCost > 0 ? totalCost : gameState[costKey];
    }
    
    let total = 0;
    let tempCost = gameState[costKey];
    for (let i = 0; i < amount && (gameState[lvlKey] + i) < maxLvl; i++) {
        total += tempCost;
        tempCost *= multiplier;
    }
    return total;
}

export function calculateBulkPurchase(currentCost, currentLvl, buyAmount, multiplier, maxLvl = Infinity) {
    let totalCost = 0;
    let tempCost = currentCost;
    let levelsBought = 0;
    
    // Sécurité : limite à 1000 niveaux max pour éviter de geler le navigateur en cas de coût nul
    let limit = (buyAmount === -1) ? 1000 : buyAmount;

    while (levelsBought < limit && (currentLvl + levelsBought) < maxLvl) {
        if (gameState.honey >= totalCost + tempCost) {
            totalCost += tempCost;
            tempCost *= multiplier;
            levelsBought++;
        } else {
            // Si on demande une quantité fixe (x10, x25) mais qu'on n'a pas assez, on renvoie 0.
            if (buyAmount !== -1) return { totalCost: 0, newCost: currentCost, levelsBought: 0 };
            break; 
        }
    }
    return { totalCost, newCost: tempCost, levelsBought };
}

export function performBulkPurchase(costKey, lvlKey, multiplier, notificationMsg, specificUpdates = null, maxLvl = Infinity) {
    const buyAmount = gameState.buyAmount;
    const currentCost = gameState[costKey];
    const currentLvl = gameState[lvlKey];

    const { totalCost, newCost, levelsBought } = calculateBulkPurchase(currentCost, currentLvl, buyAmount, multiplier, maxLvl);

    if (levelsBought === 0) {
        Utils.showNotification("Niveau maximum atteint ou impossible d'acheter.");
        return;
    }

    if (gameState.honey >= totalCost) {
        gameState.honey -= totalCost;
        gameState[lvlKey] += levelsBought;
        gameState[costKey] = newCost;
        if (specificUpdates) specificUpdates(levelsBought);
        Utils.showNotification(`${notificationMsg} (${levelsBought} fois)`);
        UI.updateDisplay(); Storage.queueSave();
    } else {
        Utils.showNotification("Miel insuffisant pour cet achat.");
    }
}

export function buyPotion(type) {
    const recipe = Constants.POTION_RECIPES[type];
    const currentHPS = getBaseCps() * getPrestigeMultiplier();
    const honeyCost = Math.max(recipe.hpsMultiplier * currentHPS, 100000); // Coût minimum de 100k pour le début de jeu

    if (gameState.ingredients.water >= recipe.water && 
        gameState.ingredients.petals >= recipe.petals && 
        gameState.ingredients.nectar >= recipe.nectar &&
        gameState.honey >= honeyCost) {
        
        gameState.honey -= honeyCost;
        gameState.ingredients.water -= recipe.water;
        gameState.ingredients.petals -= recipe.petals;
        gameState.ingredients.nectar -= recipe.nectar;
        Utils.playSound('buy');
        gameState.totalPotionsCraftedHistorical++;

        gameState.potions[type]++;
        Utils.showNotification(`🧪 Potion de ${type} fabriquée !`);
        UI.updateDisplay(); Storage.queueSave();
    } else {
        Utils.showNotification(`Manque de ressources ! Requis: 💧${recipe.water}, 🌸${recipe.petals}, 🧪${recipe.nectar} et ${Utils.formatNumber(honeyCost)} 🍯`);
    }
}

export function usePotion(type) {
    if (gameState.potions[type] > 0) {
        if (gameState.activePotions[type] > 0) {
            Utils.showNotification("Une potion de ce type est déjà active !");
            return;
        }
        gameState.potions[type]--;
        gameState.totalPotionsUsed = (gameState.totalPotionsUsed || 0) + 1;
        gameState.activePotions[type] = type === 'click' ? 30 : 60;
        Utils.showNotification(`✨ Potion activée !`);
        UI.updateDisplay(); Storage.queueSave();
    }
}

export function handleManualClick(e) {
    const btn = document.getElementById("click-btn");
    if (btn) {
        btn.classList.add("active-click");
        setTimeout(() => btn.classList.remove("active-click"), 100);
    }

    gameState.totalClicks++;
    gameState.totalClicksHistorical++;
    
    const power = getClickPower();
    const particle = document.createElement("div");
    particle.className = "click-particle";
    particle.innerText = "+" + Utils.formatNumber(power);
    particle.style.left = e.clientX + "px";
    particle.style.top = e.clientY + "px";
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), 800);

    if (e.isTrusted) {
        gameState.comboCount++;
        if (internalVars.comboTimeout) clearTimeout(internalVars.comboTimeout);
        
        internalVars.comboTimeout = setTimeout(() => {
            gameState.comboCount = 0;
            UI.updateDisplay();
        }, 2000);
    }

    addHoney(getClickPower());
    addExp(1);
    UI.updateDisplay();
    Storage.queueSave();
}

export function buyBee() {
    const buyAmount = gameState.buyAmount;
    let totalCost = 0;
    let tempBeeCost = gameState.beeCost;
    let beesBought = 0;
    const counts = { common: 0, rare: 0, legendary: 0, mythic: 0, divine: 0 };
    
    // Sécurité : limite l'achat à 1000 abeilles max par clic pour éviter de geler le navigateur
    let limit = (gameState.buyAmount === -1) ? 1000 : gameState.buyAmount;

    for (let i = 0; i < limit; i++) {
        if (gameState.honey < totalCost + tempBeeCost) break;
        totalCost += tempBeeCost;
        beesBought++;
        
        let roll = Math.random() * 100;
        let rarityThresholds = getRarityThresholds();
        gameState.pityCounter++;

        if (gameState.pityCounter === 50) {
            Utils.showNotification("🍀 Le compteur de pitié est actif ! Vos chances d'obtenir une abeille rare sont doublées !", "luck");
        }

        if (gameState.pityCounter >= 50) {
            roll /= 2;
        }
        if (roll < rarityThresholds.divine) { 
            gameState.beesDivine++; 
            gameState.discoveredBees.divine = true;
            counts.divine++;
            gameState.pityCounter = 0;
            Utils.showNotification("✨ INCROYABLE : Une Abeille Divine !", "divine");
            Storage.flushSave(); // CRITIQUE : Sauvegarde immédiate pour une Divine
        }
        else if (roll < rarityThresholds.mythic) {
            gameState.beesMythic++; 
            gameState.discoveredBees.mythic = true;
            counts.mythic++;
            gameState.pityCounter = Math.max(0, gameState.pityCounter - 25); // Une mythique réduit la pitié sans la supprimer
            if (limit < 10) Utils.showNotification("🚩 Rare : Une Abeille Mythique !", "mythic");
            Storage.flushSave(); // CRITIQUE : Sauvegarde immédiate pour une Mythique
        }
        else if (roll < rarityThresholds.legendary) { 
            gameState.beesLegendary++; 
            gameState.discoveredBees.legendary = true; 
            counts.legendary++;
        }
        else if (roll < rarityThresholds.rare) { 
            gameState.beesRare++; 
            gameState.discoveredBees.rare = true; 
            counts.rare++;
        }
        else { 
            gameState.beesCommon++; 
            gameState.discoveredBees.common = true; 
            counts.common++;
        }

        gameState.totalBeesBought++;
        tempBeeCost *= 1.15;
    }

    if (beesBought > 0) {
        // Point n°15 : Confirmation pour les achats d'abeilles en mode MAX
        if (buyAmount === -1) {
            const confirmMsg = `Voulez-vous acheter ${beesBought} abeille(s) pour ${Utils.formatNumber(totalCost)} 🍯 en mode MAX ?`;
            if (!confirm(confirmMsg)) {
                Utils.showNotification("Achat MAX annulé.", "info");
                return;
            }
        }
        gameState.honey -= totalCost;
        gameState.beeCost = tempBeeCost;
        addExp(15 * beesBought);
        Utils.playSound('buy');
        
        const summary = Object.entries(counts)
            .filter(([_, count]) => count > 0)
            .reverse() // Pour afficher Divine en premier
            .map(([rarity, count]) => `${Constants.BEE_INFO[rarity].name} x${count}`)
            .join(', ');

        Utils.showNotification(`Acheté ${beesBought} abeille(s) : ${summary}`);
        UI.updateDisplay(); Storage.queueSave();
    } else {
        Utils.showNotification("Miel insuffisant pour acheter des abeilles.");
    }
}

export function prestige() {
    let currentCost = getPrestigeCost();
    if (gameState.honey >= currentCost) {
        if (confirm("Lancer l'Ascension ? Vos abeilles et votre jardin rejoignent le plan céleste. Vos prix de base augmentent mais vous gagnez en puissance !")) {
            
            let earnedPoints = getEarnedMasteryPoints();
            gameState.masteryPoints += earnedPoints;
            gameState.totalMasteryEarned += earnedPoints;

            Utils.showNotification(`✨ Ascension ! Vous avez gagné ${earnedPoints} point(s) de Maîtrise !`);
            Utils.addLog(`🚀 <b>Ascension ${gameState.royalJelly + 1}</b> réussie ! Gain : +${earnedPoints} ✨`, "divine");

            gameState.royalJelly += 1;
            gameState.honey = 100;
            gameState.beesCommon = 0;
            gameState.beesRare = 0;
            gameState.beesLegendary = 0;
            gameState.beesMythic = 0;
            gameState.beesDivine = 0;
            gameState.level = 1;
            gameState.exp = 0;
            gameState.expNextLevel = 100;
            gameState.clickLevel = 1;
            
            gameState.totalBeesBought = 0;
            gameState.flowersPlanted = 0;
            gameState.totalClicks = 0;
            gameState.hornetsDefeated = 0;
            gameState.pityCounter = 0;
            gameState.maxHoneyReached = gameState.honey;
            
            const currentBotanistTier = gameState.missionsClaimed["botanist"];
            gameState.missionsClaimed = {};
            if (currentBotanistTier) gameState.missionsClaimed["botanist"] = currentBotanistTier;
            
            gameState.totalPotionsUsed = 0;
            
            gameState.honeycombLvl = 0;
            gameState.danceLvl = 0;
            gameState.glovesLvl = 0;
            gameState.nectarLvl = 0;
            gameState.filterLvl = 0;
            gameState.meadLvl = 0;
            gameState.stingerLvl = 0;
            gameState.hivenetLvl = 0;
            gameState.waxLvl = 0;
            gameState.jellyLvl = 0;
            gameState.prestigeBoostLevel = 0;

            let inflation = Math.pow(2.0, gameState.royalJelly);
            gameState.beeCost = 50 * inflation;
            gameState.clickCost = 150 * inflation;
            
            gameState.honeycombCost = 1000 * inflation;
            gameState.danceCost = 2500 * inflation;
            gameState.glovesCost = 4000 * inflation;
            gameState.nectarCost = 7500 * inflation;
            gameState.filterCost = 15000 * inflation;
            gameState.meadCost = 30000 * inflation;
            gameState.stingerCost = 75000 * inflation;
            gameState.hivenetCost = 180000 * inflation;
            gameState.waxCost = 450000 * inflation;
            gameState.jellyCost = 1500000 * inflation;
            gameState.prestigeBoostCost = 1500 * inflation;

            Storage.flushSave();
            GameLogic.startAutoclickLoop(); // Redémarre la boucle d'autoclick de la Reine
            UI.renderMissions();
            UI.updateDisplay();
        }
    }
}

export function resetGame() {
    const confirmInput = prompt("⚠️ ATTENTION : Cela effacera TOUTE votre progression définitivement.\n\nTapez 'EFFACER' pour confirmer :");
    
    // Si l'utilisateur annule le prompt
    if (confirmInput === null) return;

    // On nettoie l'entrée (trim) et on accepte majuscules ou minuscules
    if (confirmInput.trim().toUpperCase() === "EFFACER") {
        internalVars.isResetting = true;
        localStorage.removeItem("beeClickerSave");
        localStorage.removeItem("bee_clicker_save");
        if (document.getElementById("donator-badge-container")) {
            document.getElementById("donator-badge-container").classList.add("hidden");
        }
        location.reload();
    } else {
        Utils.showNotification("Mot de confirmation incorrect. Action annulée.", "warning");
    }
}

export function getForceRainCost() {
    const currentHPS = getBaseCps() * getPrestigeMultiplier();
    return Math.max(currentHPS * 600, 500000); // Coût : 10 minutes de HPS, min 500k
}

export function forceRain() {
    const cost = getForceRainCost();

    if (gameState.honey >= cost) {
        if (confirm(`Voulez-vous dépenser ${Utils.formatNumber(cost)} 🍯 pour déclencher une pluie d'ingrédients maintenant ?`)) {
            gameState.honey -= cost;
            GameLogic.startIngredientRain();
            GameLogic.scheduleNextRain(false, true); // Planifie la prochaine pluie après celle-ci
            Utils.showNotification(`🌧️ Pluie forcée ! -${Utils.formatNumber(cost)} 🍯`);
            UI.updateDisplay(); Storage.queueSave();
        }
    } else {
        Utils.showNotification(`Miel insuffisant pour forcer une pluie. Requis : ${Utils.formatNumber(cost)} 🍯`, "warning");
    }
}

/**
 * Gère l'activation des codes mécènes.
 */
export function redeemCode() {
    console.log("Tentative d'activation de code...");
    const code = prompt("Entrez votre code mécène (ex: BEE-FREE, DIVINE-BEE, etc.) :");
    if (!code) return;

    const upperCode = code.toUpperCase().trim();

    // Vérifie si le code a déjà été utilisé
    if (gameState.activatedCodes && gameState.activatedCodes.includes(upperCode)) {
        Utils.showNotification("Ce code a déjà été utilisé.", "warning");
        return;
    }

    const codeData = Constants.DONATOR_CODES[upperCode];

    if (!codeData) {
        Utils.showNotification("Code invalide.", "warning");
        return;
    }

    gameState.donatorTier = Math.max(gameState.donatorTier || 0, codeData.tier);
    if (!gameState.activatedCodes) gameState.activatedCodes = [];
    gameState.activatedCodes.push(upperCode);

    Utils.showNotification(codeData.message, "success");
    Utils.addLog(`🎁 Code utilisé : <b>${upperCode}</b>`, "success");
    
    UI.updateDisplay();
    Storage.queueSave();
}
