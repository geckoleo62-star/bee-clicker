/**
 * ui.js
 * Gère toutes les interactions avec l'interface utilisateur (DOM).
 */

import { gameState, internalVars } from './state.js'; // Import de l'état du jeu
import * as Constants from './constants.js';
import * as Utils from './utils.js';
import * as Formulas from './formulas.js';
import * as Storage from './storage.js';
import * as GameLogic from './gameLogic.js'; // Import GameLogic for missions

export const ui = {};
const missionCache = new Map();

export function cacheDOM() {
    const elementsToCache = [
        "honey", "total-honey", "hps", "hpc", "prestige-multi", "mastery-points",
        "mastery-click-total", "mastery-luck-total", "garden-common-bonus",
        "garden-rare-bonus", "garden-leg-bonus", "garden-mythic-bonus", "garden-divine-bonus",
        "shop-total-bonus", "shop-click-bonus", "shop-luck-bonus", "btn-wide-mode",
        "btn-dark-mode", "btn-mute", "btn-stats", "prestige-mastery-preview", "next-mastery-info",
        "player-level", "level-bonus-val", "exp-current", "exp-next", "mission-prod-bonus",
        "potion-count-honey", "potion-count-click", "potion-count-luck",
        "potion-timer-honey", "potion-timer-click", "potion-timer-luck", "royal-jelly",
        "ing-water", "ing-petals", "ing-nectar", "weather-type", "weather-desc",
        "artifacts-count", "cost-bees", "total-bees", "count-common", "count-rare",
        "count-legendary", "count-mythic", "count-divine", "prestige-cost-display", "btn-fullscreen", "weather-overlay",
        "prestige-btn", "current-law", "xp-bar-fill", "drop-rates-display", "rain-timer-label", "weather-display", "prestige-display",
        "btn-buy-click", "lvl-click", "cost-click", "celestial-upgrade-item", "btn-buy-prestige-boost",
        "item-honeycomb", "lvl-honeycomb", "cost-honeycomb", "btn-buy-honeycomb",
        "item-nectar", "lvl-nectar", "cost-nectar", "btn-buy-nectar",
        "item-dance", "lvl-dance", "cost-dance", "btn-buy-dance",
        "item-gloves", "lvl-gloves", "cost-gloves", "btn-buy-gloves",
        "item-filter", "lvl-filter", "cost-filter", "btn-buy-filter",
        "item-mead", "lvl-mead", "cost-mead", "btn-buy-mead",
        "item-stinger", "lvl-stinger", "cost-stinger", "btn-buy-stinger",
        "item-hivenet", "lvl-hivenet", "cost-hivenet", "btn-buy-hivenet",
        "item-wax", "lvl-wax", "cost-wax", "btn-buy-wax",
        "item-jelly", "lvl-jelly", "cost-jelly", "btn-buy-jelly",
        "flower-lavender", "lvl-lavender", "cost-lavender", "btn-buy-lavender",
        "flower-sunflower", "lvl-sunflower", "cost-sunflower", "btn-buy-sunflower",
        "flower-rose", "lvl-rose", "cost-rose", "btn-buy-rose",
        "flower-daisy", "lvl-daisy", "cost-daisy", "btn-buy-daisy",
        "flower-orchid", "lvl-orchid", "cost-orchid", "btn-buy-orchid",
        "flower-lily", "lvl-lily", "cost-lily", "btn-buy-lily",
        "flower-tulip", "lvl-tulip", "cost-tulip", "btn-buy-tulip",
        "flower-poppy", "lvl-poppy", "cost-poppy", "btn-buy-poppy",
        "flower-lotus", "lvl-lotus", "cost-lotus", "btn-buy-lotus",
        "flower-hibiscus", "lvl-hibiscus", "cost-hibiscus", "btn-buy-hibiscus",
        "missions-list", "missions-completed", "missions-total", "mission-prod-bonus",
        "log-container", "notification-container",
        "hornet", "hornet-clicks",
        "stats-modal", "close-stats", "stat-total-honey", "stat-total-clicks", "stat-total-bees", "stat-total-flowers", "stat-total-hornets",
        "stat-total-time", "stat-total-ascensions", "stat-total-artifacts", "stat-total-potions",
        "artifacts-list",
        "milestone-1", "milestone-2",
        "combo-display", "combo-count", "combo-bonus", "frenzy-timer-display", "frenzy-time",
        "tab-shop", "tab-garden", "tab-beedex", "tab-potions",
        "shop-view", "garden-view", "beedex-view", "potion-view"
    ];
    elementsToCache.forEach(id => {
        ui[id] = document.getElementById(id);
    });
    ui["buyAmountButtons"] = document.querySelectorAll(".buy-amount-btn");
}

/**
 * Met à jour les descriptions du magasin avec les taux réels des constantes.
 */
export function refreshShopDescriptions() {
    const upgrades = [
        { id: 'honeycomb', type: 'Production', rateKey: 'honeycomb' },
        { id: 'dance', type: 'Production', rateKey: 'dance' },
        { id: 'filter', type: 'Production', rateKey: 'filter' },
        { id: 'mead', type: 'Production', rateKey: 'mead' },
        { id: 'hivenet', type: 'Production', rateKey: 'hivenet' },
        { id: 'wax', type: 'Production', rateKey: 'wax' },
        { id: 'jelly', type: 'Production', rateKey: 'jelly' },
        { id: 'prestige-boost', type: 'Global', rateKey: 'prestigeBoost', customId: 'celestial-upgrade-item' },
        { id: 'gloves', type: 'Clic', rateKey: 'gloves' },
        { id: 'stinger', type: 'Clic', rateKey: 'stinger' }
    ];

    upgrades.forEach(u => {
        const rate = Constants.UPGRADE_RATES[u.rateKey];
        const el = ui[u.customId || `item-${u.id}`];
        if (el) {
            const descEl = el.querySelector('small');
            if (descEl && descEl.childNodes.length > 0) {
                // On modifie seulement le premier nœud de texte pour préserver les spans (lvl/cost)
                descEl.childNodes[0].textContent = `${u.type} +${Math.round(rate * 100)}% | Nv `;
            }
        }
    });

    // Mise à jour des descriptions des fleurs
    const flowerTypes = [
        { id: 'lavender', type: 'Communes', rateKey: 'FLOWER_BONUS_PRIMARY' },
        { id: 'sunflower', type: 'Rares', rateKey: 'FLOWER_BONUS_PRIMARY' },
        { id: 'rose', type: 'Légend.', rateKey: 'FLOWER_BONUS_PRIMARY' },
        { id: 'daisy', type: 'Mythiques', rateKey: 'FLOWER_BONUS_PRIMARY' },
        { id: 'orchid', type: 'Divines', rateKey: 'FLOWER_BONUS_PRIMARY' },
        { id: 'lily', type: 'Communes', rateKey: 'FLOWER_BONUS_SECONDARY' },
        { id: 'tulip', type: 'Rares', rateKey: 'FLOWER_BONUS_SECONDARY' },
        { id: 'poppy', type: 'Légend.', rateKey: 'FLOWER_BONUS_SECONDARY' },
        { id: 'lotus', type: 'Mythiques', rateKey: 'FLOWER_BONUS_SECONDARY' },
        { id: 'hibiscus', type: 'Divines', rateKey: 'FLOWER_BONUS_SECONDARY' }
    ];

    flowerTypes.forEach(f => {
        const rate = Constants[f.rateKey];
        const el = ui[`flower-${f.id}`];
        if (el) {
            const descEl = el.querySelector('small');
            if (descEl && descEl.childNodes.length > 0) {
                // On modifie seulement le premier nœud de texte pour préserver les spans (lvl/cost)
                descEl.childNodes[0].textContent = `${f.type} +${Math.round(rate * 100)}% | Nv `;
            }
        }
    });
}

export function animateLevelUp() {
    const playerLevelEl = ui["player-level"];
    if (playerLevelEl) {
        playerLevelEl.classList.remove("level-up-animation"); // Réinitialise l'animation si elle est déjà active
        void playerLevelEl.offsetWidth; // Force le reflow pour redéclencher l'animation
        playerLevelEl.classList.add("level-up-animation");
    }
}

export const updateText = (id, val) => {
    const el = (typeof id === 'string') ? (ui[id] || document.getElementById(id)) : id;
    if (!el) return;
    const newVal = val.toString();
    if (el.textContent !== newVal) {
        el.textContent = newVal;
    } else {
        // Fallback pour les éléments hors cache si besoin
        const fallback = document.getElementById(id);
        if (fallback && fallback.innerText !== newVal) fallback.innerText = val;
    }
};

export const setTxt = (id, val) => updateText(id, val);

export const setBtn = (id, disabled) => {
    const el = (typeof id === 'string') ? (ui[id] || document.getElementById(id)) : id;
    if (el && el.disabled !== disabled) el.disabled = disabled;
};

export const toggleClass = (idOrEl, className, condition) => {
    const el = (typeof idOrEl === 'string') ? (ui[idOrEl] || document.getElementById(idOrEl)) : idOrEl;
    if (el && el.classList.contains(className) !== condition) {
        el.classList.toggle(className, condition);
    }
};

export function updateDisplay() {
    if (internalVars.isInitialRender) {
        refreshShopDescriptions(); // Met à jour les descriptions du magasin et du jardin
    }

    const multiplier = Formulas.getPrestigeMultiplier();
    const totalCps = Formulas.getBaseCps() * multiplier;
    const currentPrestigeCost = Formulas.getPrestigeCost();
    const earnedMasteryPoints = Formulas.getEarnedMasteryPoints();    
    const nextTotalPoints = gameState.totalMasteryEarned + earnedMasteryPoints + 1;
    const nextMasteryThreshold = 50000 * Math.pow(10, (nextTotalPoints - 1) / 5);
    const honeyUntilNextMastery = Math.max(0, nextMasteryThreshold - gameState.highestHoneyEver);

    ui["buyAmountButtons"]?.forEach(btn => {
        const id = btn.id;
        const shouldBeActive = (id === 'buy-max' && gameState.buyAmount === -1) || 
                               (id.startsWith('buy-x') && parseInt(id.replace('buy-x', '')) === gameState.buyAmount);
        
        toggleClass(btn.id, "active", shouldBeActive);
    });

    const buyAmount = gameState.buyAmount;
    const suffix = buyAmount === -1 ? " (MAX)" : (buyAmount > 1 ? ` (x${buyAmount})` : "");

    setTxt("honey", Utils.formatNumber(gameState.honey));
    setTxt("total-honey", Utils.formatNumber(gameState.totalHoneyProduced));
    setTxt("hps", Utils.formatNumber(totalCps));
    setTxt("hpc", Utils.formatNumber(Formulas.getClickPower()));
    setTxt("prestige-multi", multiplier.toFixed(0));
    setTxt("mastery-points", Utils.formatNumber(gameState.masteryPoints));
    setTxt("mastery-click-total", gameState.masteryClickBonus);
    setTxt("mastery-luck-total", gameState.masteryLuckBonus.toFixed(1));

    // Mise à jour du coût des abeilles (Bulk)
    const totalBeeCost = Formulas.getBulkCost('beeCost', 'totalBeesBought', Constants.BEE_COST_MULTIPLIER);
    setTxt("cost-bees", Utils.formatNumber(totalBeeCost) + suffix);
    setBtn("btn-buy-bee", gameState.honey < totalBeeCost);

    const commonBonus = Math.round((Formulas.getFlowerTierBonus(gameState.lavenderLvl, gameState.lilyLvl) - 1) * 100);
    const rareBonus = Math.round((Formulas.getFlowerTierBonus(gameState.sunflowerLvl, gameState.tulipLvl) - 1) * 100);
    const legendaryBonus = Math.round((Formulas.getFlowerTierBonus(gameState.roseLvl, gameState.poppyLvl) - 1) * 100);
    const mythicBonus = Math.round((Formulas.getFlowerTierBonus(gameState.daisyLvl, gameState.lotusLvl) - 1) * 100);
    const divineBonus = Math.round((Formulas.getFlowerTierBonus(gameState.orchidLvl, gameState.hibiscusLvl) - 1) * 100);

    setTxt("garden-common-bonus", commonBonus);
    setTxt("garden-rare-bonus", rareBonus);
    setTxt("garden-leg-bonus", legendaryBonus);
    setTxt("garden-mythic-bonus", mythicBonus);
    setTxt("garden-divine-bonus", divineBonus);

    const prodMult = Formulas.getGlobalItemProdMultiplier();
    const shopProdBonus = Math.round((prodMult - 1) * 100);

    const artCounts = Formulas.getArtifactCounts();
    const artifactClickMult = 1 + ((artCounts["Aiguillon"] || 0) * Constants.ARTIFACT_RATES["Aiguillon"]);
    // Multiplicateur basé sur la puissance de base 1
    const clickBaseMult = (gameState.clickLevel + gameState.masteryClickBonus); 
    const clickEquipMult = (1 + (gameState.glovesLvl * Constants.UPGRADE_RATES.gloves)) * (1 + (gameState.stingerLvl * Constants.UPGRADE_RATES.stinger)) * artifactClickMult;
    
    const shopClickBonus = Math.round((clickBaseMult * clickEquipMult - 1) * 100);

    const currentLuck = Formulas.getTotalLuck();
    const isLuckMaxed = currentLuck >= Formulas.MAX_LUCK_CAP;
    const shopLuckBonus = currentLuck.toFixed(1) + (isLuckMaxed ? " (MAX)" : "");

    setTxt("shop-total-bonus", shopProdBonus);
    setTxt("shop-click-bonus", shopClickBonus);
    setTxt("shop-luck-bonus", shopLuckBonus);

    toggleClass(document.body, "layout-wide", !!gameState.isLargeMode);
    setTxt("btn-wide-mode", gameState.isLargeMode ? "📏" : "📐");

    setTxt("btn-fullscreen", document.fullscreenElement ? "🤏" : "🖥️");

    toggleClass(document.body, "dark-mode", gameState.isDarkMode);
    setTxt("btn-dark-mode", gameState.isDarkMode ? "☀️" : "🌙");

    setTxt("btn-mute", gameState.isMuted ? "🔇" : "🔊");

    setTxt("prestige-mastery-preview", earnedMasteryPoints);
    setTxt("next-mastery-info", `Prochain point dans : ${Utils.formatNumber(honeyUntilNextMastery)} 🍯`);
    setTxt("player-level", gameState.level); // Animation gérée dans formulas.js
    setTxt("level-bonus-val", (gameState.level - 1));
    setTxt("exp-current", Utils.formatNumber(Math.floor(gameState.exp)));
    setTxt("exp-next", Utils.formatNumber(gameState.expNextLevel));
    updateXPUI();
    // Chaque palier de mission donne +2% de production
    setTxt("mission-prod-bonus", Formulas.getTotalMissionTiersClaimed() * 2);
    
    setTxt("potion-count-honey", gameState.potions.honey); // Utilise setTxt pour la vérification
    setTxt("potion-count-click", gameState.potions.click); // Utilise setTxt pour la vérification
    setTxt("potion-count-luck", gameState.potions.luck); // Utilise setTxt pour la vérification
    
    setTxt("potion-timer-honey", gameState.activePotions.honey > 0 ? `${Math.ceil(gameState.activePotions.honey)}s` : "");
    setTxt("potion-timer-click", gameState.activePotions.click > 0 ? `${Math.ceil(gameState.activePotions.click)}s` : "");
    setTxt("potion-timer-luck", gameState.activePotions.luck > 0 ? `${Math.ceil(gameState.activePotions.luck)}s` : "");

    const frenzyDisplay = ui["frenzy-timer-display"];
    if (frenzyDisplay) {
        const isFrenzyActive = gameState.activePotions.frenzy > 0;
        toggleClass("frenzy-timer-display", "hidden", !isFrenzyActive);
        if (isFrenzyActive) {
            setTxt("frenzy-time", Math.floor(gameState.activePotions.frenzy));
        }
    }

    const comboDisplay = ui["combo-display"];
    if (comboDisplay) {
        const isComboActive = gameState.comboCount > 0;
        toggleClass("combo-display", "hidden", !isComboActive);
        if (isComboActive) {
            setTxt("combo-count", gameState.comboCount);
            setTxt("combo-bonus", Math.min(gameState.comboCount, 25));
        }
    }

    // Animation du bouton principal si le combo est au maximum
    const clickBtn = ui["click-btn"];
    if (clickBtn) {
        if (gameState.comboCount >= 25) {
            clickBtn.classList.add("combo-max-pulse");
        } else {
            clickBtn.classList.remove("combo-max-pulse");
        }
    }

    // Effet visuel de frénésie sur le bouton BUTINER
    toggleClass("click-btn", "frenzy-active-btn", gameState.activePotions.frenzy > 0);

    const forceRainCost = Formulas.getForceRainCost(); // Utilise le coût réel calculé
    setTxt("cost-force-rain", Utils.formatNumber(forceRainCost));
    setBtn("btn-force-rain", gameState.honey < forceRainCost);


    setTxt("ing-water", gameState.ingredients.water);
    setTxt("ing-petals", gameState.ingredients.petals);
    setTxt("ing-nectar", gameState.ingredients.nectar);

    const now = Date.now();
    const rainDiff = gameState.nextRainTime - now;
    const rainStatusLabel = ui["rain-timer-label"];
    if (rainStatusLabel) {
        if (rainDiff > 0) {
            const mins = Math.floor(rainDiff / 60000);
            const secs = Math.floor((rainDiff % 60000) / 1000);
            rainStatusLabel.innerText = `Prochaine pluie : ${mins}:${secs < 10 ? '0' : ''}${secs}`;
            rainStatusLabel.parentElement?.classList.remove("active-rain");
        } else {
            rainStatusLabel.innerText = "Pluie magique en cours !";
            rainStatusLabel.parentElement?.classList.add("active-rain");
        }
    }

    setTxt("weather-type", gameState.weather);
    const weatherData = Formulas.getCurrentWeather();
    setTxt("weather-desc", weatherData ? weatherData.desc : "");

    const overlay = ui["weather-overlay"];
    if (overlay) {
        const weatherKey = Constants.WEATHER_MAP[gameState.weather] || "sun";
        const expectedClass = `weather-overlay-hidden weather-${weatherKey}-active`;
        if (overlay.className !== expectedClass) overlay.className = expectedClass;
    }

    setTxt("artifacts-count", gameState.artifacts.length);
    const weatherEl = ui["weather-display"];
    if(weatherEl) weatherEl.className = "weather-box " + gameState.weather?.toLowerCase();

    let btnClick = ui["btn-buy-click"];
    if (btnClick) {
        const isMax = gameState.clickLevel >= Constants.CLICK_MAX_LEVEL;
        const totalClickCost = Formulas.getBulkCost('clickCost', 'clickLevel', 1.35, Constants.CLICK_MAX_LEVEL);
        setTxt("lvl-click", isMax ? "MAX" : gameState.clickLevel); // Utilise setTxt
        setTxt("cost-click", isMax ? "---" : Utils.formatNumber(totalClickCost) + suffix); // Utilise setTxt
        setBtn("btn-buy-click", isMax || gameState.honey < totalClickCost); // Utilise setBtn
        setTxt("btn-buy-click", isMax ? "Maximum" : "Améliorer"); // Utilise setTxt
    }

    const evolutions = ['honeycomb', 'nectar', 'dance', 'gloves', 'filter', 'mead', 'stinger', 'hivenet', 'wax', 'jelly'];
    evolutions.forEach((id, index) => {
        toggleClass(`item-${id}`, "hidden", gameState.royalJelly < (index * 2));
    });

    Object.keys(Constants.FLOWER_MILESTONES).forEach((id) => {
        const el = ui[`flower-${id}`];
        const requiredLevel = Constants.FLOWER_MILESTONES[id];
        toggleClass(`flower-${id}`, "hidden", gameState.royalJelly < requiredLevel);
    });

    const upgradeConfigs = [
        ['honeycomb', 'honeycombCost', 'honeycombLvl', 1.35], ['nectar', 'nectarCost', 'nectarLvl', 1.35], ['dance', 'danceCost', 'danceLvl', 1.4], ['gloves', 'glovesCost', 'glovesLvl', 1.45], ['filter', 'filterCost', 'filterLvl', 1.4], ['mead', 'meadCost', 'meadLvl', 1.4], ['stinger', 'stingerCost', 'stingerLvl', 1.45], ['hivenet', 'hivenetCost', 'hivenetLvl', 1.5], ['wax', 'waxCost', 'waxLvl', 1.5], ['jelly', 'jellyCost', 'jellyLvl', 1.6],
        ['prestige-boost', 'prestigeBoostCost', 'prestigeBoostLevel', 1.4],
        ['lavender', 'lavenderCost', 'lavenderLvl', 1.3], ['sunflower', 'sunflowerCost', 'sunflowerLvl', 1.3], ['rose', 'roseCost', 'roseLvl', 1.3],
        ['daisy', 'daisyCost', 'daisyLvl', 1.3], ['orchid', 'orchidCost', 'orchidLvl', 1.3], ['lily', 'lilyCost', 'lilyLvl', 1.3], ['tulip', 'tulipCost', 'tulipLvl', 1.3],
        ['poppy', 'poppyCost', 'poppyLvl', 1.3], ['lotus', 'lotusCost', 'lotusLvl', 1.3], ['hibiscus', 'hibiscusCost', 'hibiscusLvl', 1.3]
    ];

    upgradeConfigs.forEach(([id, costKey, lvlKey, mult]) => {
        const cost = Formulas.getBulkCost(costKey, lvlKey, mult);
        setTxt(`lvl-${id}`, gameState[lvlKey]);
        setTxt(`cost-${id}`, Utils.formatNumber(cost) + suffix);
        setBtn(`btn-buy-${id}`, gameState.honey < cost);
    });

    document.querySelectorAll('.upgrade-item, .flower-item').forEach(item => {
        const btn = item.querySelector('button');
        if (btn) toggleClass(item.id, 'affordable', !btn.disabled);
    });

    const isCelestialUnlocked = gameState.royalJelly >= 2;
    toggleClass("celestial-upgrade-item", "hidden", !isCelestialUnlocked);

    setTxt("count-common", `${Utils.formatNumber(gameState.beesCommon)} (${Constants.PROD_COMMON}/s)`);
    setTxt("count-rare", `${Utils.formatNumber(gameState.beesRare)} (${Constants.PROD_RARE}/s)`);
    setTxt("count-legendary", `${Utils.formatNumber(gameState.beesLegendary)} (${Constants.PROD_LEGENDARY}/s)`);
    setTxt("count-mythic", `${Utils.formatNumber(gameState.beesMythic)} (${Constants.PROD_MYTHIC}/s)`);
    setTxt("count-divine", `${Utils.formatNumber(gameState.beesDivine)} (${Constants.PROD_DIVINE}/s)`);
    setTxt("total-bees", Formulas.getTotalBees());

    const updateMilestone = (id, threshold, text) => {
        const el = ui[id];
        if (!el) return;
        const unlocked = gameState.maxHoneyReached >= threshold;
        el.className = `milestone ${unlocked ? "unlocked" : "locked"}`;
        el.innerText = unlocked ? text : `🔒 ${Utils.formatNumber(threshold)} 🍯 : ${text.split('(')[0]}`;
    };

    updateMilestone("milestone-1", 100, "🐝 Reine active (Auto-clic)");
    updateMilestone("milestone-2", 1000, "👑 Gelée active (Super Auto-clic x5 ⚡)");

    if (gameState.royalJelly > 0) {
        toggleClass("prestige-display", "hidden", false);
        setTxt("royal-jelly", gameState.royalJelly);
        
        const paradigm = Formulas.getHiveParadigm();
        setTxt("current-law", paradigm.name);
        if (ui["current-law"]?.getAttribute("title") !== paradigm.desc) ui["current-law"]?.setAttribute("title", paradigm.desc); // Tooltip explicatif
    }

    setTxt("prestige-cost-display", Utils.formatNumber(currentPrestigeCost));
    let prestigeBtn = ui["prestige-btn"];
    if (prestigeBtn) {
        const canAfford = gameState.honey >= currentPrestigeCost;
        prestigeBtn.disabled = !canAfford;
        setTxt("prestige-btn", canAfford ? `S'élever ! (+${earnedMasteryPoints} ✨)` : "Miel insuffisant");
    }

    // UX: Message d'aide pour le premier déblocage
    if (gameState.maxHoneyReached < 100) {
        setTxt("milestone-1", `🔒 Objectif : ${Utils.formatNumber(100)} 🍯 pour l'auto-clic`);
    }

    renderDropRates();
    applyDonatorEffects();
    updateMissionsProgress(); // Met à jour uniquement la progression sans recréer le DOM
}

export function updateXPUI() {
    const fill = ui["xp-bar-fill"];
    if (fill) {
        const percent = (gameState.exp / gameState.expNextLevel) * 100;
        fill.style.width = percent + "%";
    }
}

export function renderDropRates() {
    const thresholds = Formulas.getRarityThresholds();

    const countCommon = gameState.beesCommon;
    const countRarePlus = countCommon + gameState.beesRare;
    const countLegendaryPlus = countRarePlus + gameState.beesLegendary;
    const countMythicPlus = countLegendaryPlus + gameState.beesMythic;

    const divineTxt = countMythicPlus >= 250 ? `${thresholds.divine.toFixed(2)}%` : "🔒";
    const mythicTxt = countLegendaryPlus >= 100 ? `${(thresholds.mythic - thresholds.divine).toFixed(1)}%` : "🔒";
    const legendaryTxt = countRarePlus >= 50 ? `${(thresholds.legendary - thresholds.mythic).toFixed(1)}%` : "🔒";
    const rareTxt = countCommon >= 20 ? `${(thresholds.rare - thresholds.legendary).toFixed(1)}%` : "🔒";
    const commonTxt = `${(100 - (countCommon >= 20 ? thresholds.rare : 0)).toFixed(1)}%`;

    setTxt("drop-rates-display", `🟣 ${divineTxt} | 🔴 ${mythicTxt} | 🟠 ${legendaryTxt} | 🔵 ${rareTxt} | 🟤 ${commonTxt}`);
}

export function renderArtifacts() {
    const list = ui["artifacts-list"];
    if (!list) return;
    list.innerHTML = "";

    const counts = {};
    gameState.artifacts.forEach(art => { counts[art] = (counts[art] || 0) + 1; });

    Object.keys(counts).forEach(art => {
        const item = document.createElement("div");
        item.className = "artifact-item";
        
        let icon = "❓";
        let desc = "";
        
        if (art === "Aiguillon") { icon = "🗡️"; desc = `Aiguillon : +5% Puissance de clic (x${counts[art]})`; }
        else if (art === "Vieux Pot") { icon = "🏺"; desc = `Vieux Pot : +10% Production Miel (x${counts[art]})`; }
        else if (art === "Pollen d'Or") { icon = "✨"; desc = `Pollen d'Or : +0.5 Chance ✨ (x${counts[art]})`; }
        else if (art === "Aile de Nacre") { icon = "💸"; desc = `Aile de Nacre : +5% Gains Abeille d'Or (x${counts[art]})`; }

        item.setAttribute("data-tooltip", desc);
        
        item.innerHTML = `
            <span>${icon}</span>
            <span style="font-size: 10px; position: absolute; bottom: 1px; right: 2px; font-weight: bold; background: rgba(0,0,0,0.5); color: white; padding: 0 3px; border-radius: 4px;">
                x${counts[art]}
            </span>
        `;
        list.appendChild(item);
    });
}

export function renderMissions() {
    const list = ui["missions-list"];
    const completedDisplay = ui["missions-completed"];
    const totalDisplay = ui["missions-total"];
    if (!list || !completedDisplay || !totalDisplay) return;

    missionCache.clear();
    let completed = 0;

    list.innerHTML = "";
    const fragment = document.createDocumentFragment();

    // Définir les IDs des missions permanentes (celles qui sont conservées au prestige)
    const permanentMissionIds = ["botanist", "click_pro", "golden_seeker", "ingredient_gatherer", "alchemist"];

    const seasonalMissions = [];
    const permanentMissions = [];

    GameLogic.MISSIONS.forEach(mission => {
        if (permanentMissionIds.includes(mission.id)) {
            permanentMissions.push(mission);
        } else {
            seasonalMissions.push(mission);
        }
    });

    const renderMissionCard = (mission) => {
        const progress = GameLogic.getMissionProgress(mission, Formulas);
        const currentTierIdx = gameState.missionsClaimed[mission.id] || 0;
        const isMaxed = currentTierIdx >= mission.tiers.length;
        
        if (isMaxed) completed++;
        
        const currentTier = isMaxed ? mission.tiers[mission.tiers.length - 1] : mission.tiers[currentTierIdx];
        const ready = !isMaxed && progress >= currentTier.target;
        
        const progressText = `${Utils.formatNumber(Math.min(Math.floor(progress), currentTier.target))}/${Utils.formatNumber(currentTier.target)}`;
        
        const card = document.createElement("div");
        let cardClass = "mission-card";
        if (isMaxed) cardClass += " claimed";
        else if (ready) cardClass += " ready";
        const isPermanent = permanentMissionIds.includes(mission.id);
        if (isPermanent) cardClass += " permanent";
        card.className = cardClass;
        card.innerHTML = `
            <div class="mission-top">
                <div class="mission-info">
                    <strong>${isPermanent ? '📌' : '⏳'} ${mission.title}</strong>
                    <small>${(isMaxed ? "Complété" : `Palier ${currentTierIdx + 1}`) + " • " + progressText + " • " + currentTier.rewardText}</small>
                </div>
                <button ${isMaxed || !ready ? 'disabled' : ''}>${isMaxed ? "Terminé" : ready ? "Réclamer" : "En cours"}</button>
            </div>
            <div class="mission-progress"><span style="width: ${Math.min(100, Math.floor((progress / currentTier.target) * 100))}%"></span></div>
        `;

        // Mise en cache des éléments pour updateMissionsProgress
        missionCache.set(mission.id, {
            card,
            detail: card.querySelector("small"),
            button: card.querySelector("button"),
            fill: card.querySelector(".mission-progress span")
        });

        card.querySelector("button").addEventListener("click", () => {
            const result = GameLogic.claimMission(mission.id, Formulas);
            if (result.success) {
                Utils.playSound('collect');
                Utils.showNotification(`🎯 Palier atteint : ${result.rewardText}`);
                result.notificationMessages.forEach(msg => Utils.showNotification(msg));
                if (result.expResult.levelUp) {
                    Utils.showNotification(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes niveau ${gameState.level}`);
                    Utils.playSound('levelup');
                    animateLevelUp();
                }
                if (result.expResult.masteryPoint) {
                    Utils.showNotification("🎁 Récompense de palier : +1 Point de Maîtrise !", "divine");
                }
                renderMissions();
                updateDisplay();
                Storage.flushSave();
            } else {
                Utils.showNotification(result.message, "warning");
            }
        });
        return card;
    };

    // Rendre les titres et les missions saisonnières en premier
    const sTitle = document.createElement("div");
    sTitle.className = "mission-section-title";
    sTitle.innerText = "Missions de l'Ascension (Reset)";
    fragment.appendChild(sTitle);

    seasonalMissions.forEach(mission => {
        fragment.appendChild(renderMissionCard(mission));
    });

    // Rendre les missions permanentes ensuite
    if (permanentMissions.length > 0) {
        // Ajout de la ligne séparatrice jaune
        const separator = document.createElement("hr");
        separator.style.margin = "15px 0 10px 0";
        separator.style.borderColor = "#f1c40f";
        separator.style.opacity = "0.4";
        fragment.appendChild(separator);

        const pTitle = document.createElement("div");
        pTitle.className = "mission-section-title permanent-title";
        pTitle.innerText = "Objectifs Permanents (Carrière)";
        fragment.appendChild(pTitle);

        permanentMissions.forEach(mission => {
            fragment.appendChild(renderMissionCard(mission));
        });
    }

    list.appendChild(fragment);
    completedDisplay.textContent = completed;
    totalDisplay.textContent = GameLogic.MISSIONS.length.toString();
}

/** 
 * Met à jour uniquement les textes et barres de progression des missions
 * sans vider le innerHTML pour optimiser les performances (appelé 10x/sec).
 */
export function updateMissionsProgress() {
    const list = ui["missions-list"];
    // On vérifie seulement si la liste existe et si le cache est prêt
    if (!list || missionCache.size === 0) return;

    const permanentMissionIds = ["botanist", "click_pro", "golden_seeker", "ingredient_gatherer", "alchemist"];

    GameLogic.MISSIONS.forEach((mission) => {
        const cached = missionCache.get(mission.id);
        if (!cached) return;

        const progress = GameLogic.getMissionProgress(mission, Formulas);
        const currentTierIdx = gameState.missionsClaimed[mission.id] || 0;
        const isMaxed = currentTierIdx >= mission.tiers.length;
        const currentTier = isMaxed ? mission.tiers[mission.tiers.length - 1] : mission.tiers[currentTierIdx];
        const ready = !isMaxed && progress >= currentTier.target;

        let expectedClass = "mission-card" + (isMaxed ? " claimed" : ready ? " ready" : "");
        if (permanentMissionIds.includes(mission.id)) expectedClass += " permanent";
        
        if (cached.card.className !== expectedClass) cached.card.className = expectedClass;

        const progressText = `${Utils.formatNumber(Math.min(Math.floor(progress), currentTier.target))}/${Utils.formatNumber(currentTier.target)}`;
        const newText = (isMaxed ? "Complété" : `Palier ${currentTierIdx + 1}`) + " • " + progressText + " • " + currentTier.rewardText;
        if (cached.detail.textContent !== newText) cached.detail.textContent = newText;

        cached.button.disabled = isMaxed || !ready;
        cached.button.textContent = isMaxed ? "Terminé" : ready ? "Réclamer" : "En cours";
        cached.fill.style.width = Math.min(100, Math.floor((progress / currentTier.target) * 100)) + "%";
    });
}

export function renderBeedex() {
    const list = document.getElementById("beedex-list");
    if (!list) return;
    list.innerHTML = "";

    // Affichage du bonus de collection en haut de la liste
    const bonusHeader = document.createElement("div");
    bonusHeader.style.gridColumn = "1 / -1";
    bonusHeader.style.textAlign = "center";
    bonusHeader.style.padding = "10px";
    bonusHeader.style.color = "#27ae60";
    bonusHeader.style.fontWeight = "bold";
    bonusHeader.style.fontSize = "13px";
    const bonusPercent = Math.round((Formulas.getBeedexBonus() - 1) * 100);
    bonusHeader.innerHTML = `✨ Collection : +${bonusPercent}% de production globale`;
    list.appendChild(bonusHeader);

    Object.keys(Constants.BEE_INFO).forEach(key => {
        const info = Constants.BEE_INFO[key];
        const isDiscovered = gameState.discoveredBees[key];
        
        const card = document.createElement("div");
        card.className = `bee-card ${isDiscovered ? key : 'locked'}`;
        
        card.innerHTML = `
            <div class="bee-icon" style="${isDiscovered ? '' : 'filter: grayscale(1) opacity(0.3);'}">
                ${info.icon}
            </div>
            <strong>${isDiscovered ? info.name : "???"}</strong>
            <small>${isDiscovered ? info.desc : "Continuez à acheter des abeilles pour découvrir cette espèce."}</small>
            ${isDiscovered && info.prod ? `<small style="margin-top:5px; color:#f1c40f">Prod: ${info.prod}🍯/s</small>` : ""}
        `;
        list.appendChild(card);
    });
}

export function applyDonatorEffects() {
    const tier = gameState.donatorTier || 0;
    const body = document.body;

    const badgeContainer = document.getElementById("donator-badge-container");
    const badgeText = document.getElementById("donator-badge");

    if (tier >= 1 && badgeContainer && badgeText) {
        badgeContainer.classList.remove("hidden");
        
        if (tier === 1) {
            badgeText.innerHTML = "👑 MÉCÈNE DE LA RUCHE";
            badgeText.style.background = "#f1c40f";
            badgeText.style.color = "#2c3e50";
        } else if (tier === 2) {
            badgeText.innerHTML = "✨ MÉCÈNE DIVIN";
            badgeText.style.background = "#9b59b6";
            badgeText.style.color = "#fff";
        } else if (tier === 3) {
            badgeText.innerHTML = "🎨 SOUVERAIN DE LA RUCHE";
            badgeText.style.background = "#e74c3c";
            badgeText.style.color = "#fff";
        } else if (tier >= 4) {
            badgeText.innerHTML = "⚡ BIENFAITEUR SUPRÊME 🧲";
            badgeText.style.background = "linear-gradient(45deg, #f1c40f, #9b59b6)";
            badgeText.style.color = "#fff";
        }
    } else if (badgeContainer) {
        badgeContainer.classList.add("hidden");
    }

    if (tier >= 2 && body.classList.contains("dark-mode")) {
        body.classList.add("divine-mode");
    } else {
        body.classList.remove("divine-mode");
    }

    if (tier >= 3) {
        body.classList.add("divine-cursor");
        const mainBee = document.getElementById("click-btn");
        if (mainBee) mainBee.style.filter = "drop-shadow(0 0 12px #f1c40f) hue-rotate(45deg)";
    }
}

export function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            Utils.showNotification("Le plein écran n'a pas pu être activé.");
        });
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
    updateDisplay();
}

export const switchTab = (activeTab, activeView) => {
    [ui["tab-shop"], ui["tab-garden"], ui["tab-beedex"], ui["tab-potions"]].forEach(t => t?.classList.remove("active"));
    [ui["shop-view"], ui["garden-view"], ui["beedex-view"], ui["potion-view"]].forEach(v => v?.classList.remove("active"));
    activeTab?.classList.add("active");
    activeView?.classList.add("active");
    if (activeTab === ui["tab-beedex"]) renderBeedex();
    if (activeTab === ui["tab-garden"]) updateDisplay();
    if (activeTab === ui["tab-potions"]) updateDisplay();
    if (activeTab === ui["tab-shop"]) updateDisplay();
};