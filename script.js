import { gameState, internalVars } from './state.js';
import * as Constants from './constants.js';
import * as Utils from './utils.js';
import * as Formulas from './formulas.js';
import * as UI from './ui.js';
import * as Storage from './storage.js';
import * as GameLogic from './gameLogic.js';

// --- 1. INITIALISATION ---
function init() {
    console.log("%c 🍯 BEE CLICKER : Fichiers mis à jour chargés ! ", "background: #f1c40f; color: #000; font-weight: bold;");

    // Gestionnaire d'erreurs global pour la version publique
    window.onerror = (msg, url, line) => {
        // Ignorer les erreurs connues causées par les extensions Chrome
        if (typeof msg === 'string' && msg.includes("message channel closed")) return true;
        
        Utils.handleError(`${msg} at ${line}`);
        return false;
    };

    // Gestion des promesses rejetées (comme l'erreur que vous voyez)
    window.onunhandledrejection = (event) => {
        if (event.reason && event.reason.message && event.reason.message.includes("message channel closed")) {
            event.preventDefault(); // Empêche l'affichage dans la console
        }
    };

    UI.cacheDOM();
    Storage.loadGame();
    GameLogic.initGameLogicSystems(Formulas); // Initialise les systèmes de GameLogic en passant Formulas
    UI.updateDisplay(); // Premier affichage après chargement
    UI.renderMissions(); // Premier rendu des missions
    internalVars.isInitialRender = false;
    
    // --- 2. BOUCLE PRINCIPALE ---
    setInterval(() => {
        const now = Date.now();
        const delta = (now - internalVars.lastTickTime) / 1000;
        internalVars.lastTickTime = now;

        if (delta <= 0) return;
        gameState.totalPlayTime += delta;

        const hps = Formulas.getBaseCps() * Formulas.getPrestigeMultiplier();
        if (hps > 0) Formulas.addHoney(hps * delta);
        
        for (let key in gameState.activePotions) {
            if (gameState.activePotions[key] > 0) {
                gameState.activePotions[key] = Math.max(0, gameState.activePotions[key] - delta);
            }
        }
        UI.updateDisplay(); // Mise à jour de l'affichage à chaque tick
        
        // Vérifie si un frelon s'est échappé (géré par un setTimeout dans GameLogic)
        if (internalVars.pendingHornetResult) { // Correction: Utilise internalVars.pendingHornetResult
            const result = internalVars.pendingHornetResult;
            if (result.hornetEscaped) {
                if (result.stolenHoney > 0) Utils.showNotification("🚨 Frelon évité trop tard : -" + Utils.formatNumber(result.stolenHoney) + " 🍯");
                else Utils.showNotification("🍃 Le frelon est reparti sans butin.");
                Storage.queueSave();
            }
            internalVars.pendingHornetResult = null; // Réinitialise
        }
    }, 100);

    // --- 3. ÉCOUTEURS D'ÉVÉNEMENTS ---
    document.getElementById("click-btn")?.addEventListener("click", (e) => {
        const clickResult = Formulas.handleManualClick(e);
        UI.updateDisplay(); // Mise à jour immédiate au clic

        // Gère le résultat de l'XP
        if (clickResult.expResult.levelUp) {
            Utils.showNotification(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes niveau ${gameState.level}`);
            Utils.playSound('levelup');
            UI.animateLevelUp();
        }
        if (clickResult.expResult.masteryPoint) {
            Utils.showNotification("🎁 Récompense de palier : +1 Point de Maîtrise !", "divine");
        }

        // Création de la particule de clic
        const power = Formulas.getClickPower();
        const particle = document.createElement("div");
        particle.className = "click-particle";
        particle.innerText = "+" + Utils.formatNumber(power);
        particle.style.left = e.clientX + "px";
        particle.style.top = e.clientY + "px";
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    });


    document.getElementById("btn-buy-bee")?.addEventListener("click", () => {
        const result = Formulas.buyBee();
        if (result.success) {
            if (result.needsConfirmation) {
                if (confirm(result.confirmMsg)) {
                    const confirmResult = Formulas.confirmBuyBee(result.beesBought, result.totalCost, result.tempBeeCost, result.counts, result.summary);
                    Utils.playSound('buy');
                    Utils.showNotification(`🛒 Achat MAX réussi ! ${result.summary}`);
                    if (confirmResult.expResult.levelUp) {
                        Utils.showNotification(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes niveau ${gameState.level}`);
                        Utils.playSound('levelup');
                        UI.animateLevelUp();
                    }
                    if (confirmResult.expResult.masteryPoint) {
                        Utils.showNotification("🎁 Récompense de palier : +1 Point de Maîtrise !", "divine");
                    }
                }
            } else {
                Utils.playSound('buy');
                Utils.showNotification(`🛒 Abeilles achetées : ${result.summary}`);
                if (result.expResult.levelUp) {
                    Utils.showNotification(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes niveau ${gameState.level}`);
                    Utils.playSound('levelup');
                    UI.animateLevelUp();
                }
                if (result.expResult.masteryPoint) {
                    Utils.showNotification("🎁 Récompense de palier : +1 Point de Maîtrise !", "divine");
                }
            }
        } else {
            Utils.showNotification(result.message, "warning");
        }
        UI.updateDisplay();
        Storage.queueSave();
    });

    document.getElementById("hornet")?.addEventListener("click", () => {
        const result = GameLogic.handleHornetClick(Formulas);
        if (result.success) {
            Utils.playSound('click');
            if (result.hornetDefeated) {
                Utils.showNotification(`⚔️ Frelon chassé ! Récompense : 1 ${result.loot.icon} ${result.loot.name}`);
                Utils.addLog(`⚔️ Frelon repoussé ! Récompense : 1 <b>${result.loot.icon}</b>`, "success");
                // Gère le résultat de l'XP du frelon
                if (result.expResult.levelUp) {
                    Utils.showNotification(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes niveau ${gameState.level}`);
                    Utils.playSound('levelup');
                    UI.animateLevelUp();
                }
                if (result.expResult.masteryPoint) {
                    Utils.showNotification("🎁 Récompense de palier : +1 Point de Maîtrise !", "divine");
                }
                UI.updateDisplay();
                Storage.queueSave();
            }
        }
    });

    // Gestion des modes et options UI
    document.getElementById("btn-wide-mode")?.addEventListener("click", () => {
        gameState.isLargeMode = !gameState.isLargeMode;
        UI.updateDisplay();
        Storage.queueSave();
    });

    document.getElementById("btn-dark-mode")?.addEventListener("click", () => {
        gameState.isDarkMode = !gameState.isDarkMode;
        UI.updateDisplay();
        Storage.queueSave();
    });

    document.getElementById("btn-mute")?.addEventListener("click", () => {
        gameState.isMuted = !gameState.isMuted;
        UI.updateDisplay();
        Storage.queueSave();
    });

    document.getElementById("btn-fullscreen")?.addEventListener("click", () => {
        UI.toggleFullScreen();
        // toggleFullScreen appelle déjà updateDisplay en interne
        Storage.queueSave();
    });

    // Fermeture des modales
    document.getElementById("close-stats")?.addEventListener("click", () => {
        document.getElementById("stats-modal")?.classList.add("hidden");
    });

    document.getElementById("btn-stats")?.addEventListener("click", () => {
        UI.setTxt("stat-total-honey", Utils.formatNumber(gameState.totalHoneyProduced));
        UI.setTxt("stat-total-clicks", gameState.totalClicksHistorical);
        UI.setTxt("stat-total-bees", Formulas.getTotalBees());
        UI.setTxt("stat-total-flowers", Formulas.getTotalFlowers());
        UI.setTxt("stat-total-hornets", gameState.totalHornetsHistorical);
        UI.setTxt("stat-total-time", Utils.formatTime(gameState.totalPlayTime));
        UI.setTxt("stat-total-ascensions", gameState.royalJelly);
        UI.setTxt("stat-total-artifacts", gameState.totalArtifactsHistorical);
        UI.setTxt("stat-total-potions", gameState.totalPotionsCraftedHistorical);
        document.getElementById("stats-modal")?.classList.remove("hidden");
    });

    document.getElementById("btn-buy-click")?.addEventListener("click", () => {
        const result = Formulas.performBulkPurchase(
            'clickCost', 'clickLevel', 1.35, "🌸 Clic amélioré ! Puissance +1", 
            (bought) => Formulas.addExp(10 * bought),
            Constants.CLICK_MAX_LEVEL
        );
        if (result.success) {
            Utils.playSound('buy');
            if (typeof result.specificUpdates === 'function') {
                const expResult = result.specificUpdates(result.levelsBought);
                if (expResult && typeof expResult === 'object') {
                    if (expResult.levelUp) {
                        Utils.showNotification(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes niveau ${gameState.level}`);
                        Utils.playSound('levelup');
                        UI.animateLevelUp();
                    }
                    if (expResult.masteryPoint) {
                        Utils.showNotification("🎁 Récompense de palier : +1 Point de Maîtrise !", "divine");
                    }
                }
            }
            const totalPower = result.levelsBought;
            const msg = result.notificationMsg.replace(/\+1/g, `+${totalPower}`);
            Utils.showNotification(`${msg} (${result.levelsBought} fois)`);
        } else {
            Utils.showNotification(result.message);
        }
        UI.updateDisplay();
        Storage.queueSave();
    });

    Object.keys(Constants.FLOWER_MILESTONES).forEach(flowerId => { // Correction de la boucle pour les fleurs
        const btn = document.getElementById(`btn-buy-${flowerId}`);
        if (!btn) return;

        // Mise à jour du message de notification pour les fleurs
        const flowerName = flowerId.charAt(0).toUpperCase() + flowerId.slice(1);
        const bonusType = (flowerId === 'lavender' || flowerId === 'lily') ? 'Communes' :
                          (flowerId === 'sunflower' || flowerId === 'tulip') ? 'Rares' :
                          (flowerId === 'rose' || flowerId === 'poppy') ? 'Légend.' :
                          (flowerId === 'daisy' || flowerId === 'lotus') ? 'Mythiques' : 'Divines';
        const bonusRate = (flowerId === 'lavender' || flowerId === 'sunflower' || flowerId === 'rose' || flowerId === 'daisy' || flowerId === 'orchid') ? Constants.FLOWER_BONUS_PRIMARY * 100 : Constants.FLOWER_BONUS_SECONDARY * 100;

        document.getElementById(`btn-buy-${flowerId}`)?.addEventListener("click", () => {
            const result = Formulas.performBulkPurchase( // Correction: Passer la fonction specificUpdates
                `${flowerId}Cost`, `${flowerId}Lvl`, 1.3, `🪻 ${flowerId.charAt(0).toUpperCase() + flowerId.slice(1)} plantée !`,
                (bought) => gameState.flowersPlanted += bought
            );
            if (result.success) {
                Utils.playSound('buy');
                if (typeof result.specificUpdates === 'function') {
                    const expResult = result.specificUpdates(result.levelsBought);
                    if (expResult && typeof expResult === 'object') {
                        if (expResult.levelUp) {
                            Utils.showNotification(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes niveau ${gameState.level}`);
                            Utils.playSound('levelup');
                            UI.animateLevelUp();
                        }
                        if (expResult.masteryPoint) {
                            Utils.showNotification("🎁 Récompense de palier : +1 Point de Maîtrise !", "divine");
                        }
                    }
                }
                const totalBonus = Math.round(bonusRate * result.levelsBought);
                Utils.showNotification(`🪻 ${flowerName} plantée ! ${bonusType} +${totalBonus}% (${result.levelsBought} fois)`);
            } else {
                Utils.showNotification(result.message);
            }
            UI.updateDisplay();
            Storage.queueSave();
        });
    });

    document.querySelectorAll('[id^="btn-buy-pot-"]').forEach(btn => {
        btn.addEventListener("click", () => { // Ajout de la gestion des résultats
            const type = btn.id.replace('btn-buy-pot-', '');
            const result = Formulas.buyPotion(type);
            if (result.success) {
                Utils.playSound('buy');
                Utils.showNotification(`🧪 Potion de ${type} fabriquée !`);
            } else {
                Utils.showNotification(result.message || `Manque de ressources ! Requis: 💧${result.recipe.water}, 🌸${result.recipe.petals}, 🧪${result.recipe.nectar} et ${Utils.formatNumber(result.honeyCost)} 🍯`);
            }
            UI.updateDisplay();
            Storage.queueSave();
        });
    });
    document.querySelectorAll('[id^="btn-use-pot-"]').forEach(btn => {
        btn.addEventListener("click", () => { // Ajout de la gestion des résultats
            const type = btn.id.replace('btn-use-pot-', '');
            const result = Formulas.usePotion(type);
            if (result.success) {
                Utils.playSound('collect'); // Son différent pour l'utilisation
                Utils.showNotification(`✨ Potion activée !`);
            } else {
                Utils.showNotification(result.message);
            }
            UI.updateDisplay();
            Storage.queueSave();
        });
    });

    const simpleUpgrades = [
        { id: "honeycomb", cost: "honeycombCost", lvl: "honeycombLvl", mult: 1.35, msg: "🧱 Rayons renforcés ! Prod +2%" },
        { id: "dance", cost: "danceCost", lvl: "danceLvl", mult: 1.4, msg: "💃 Danse ! Prod +2%" },
        { id: "gloves", cost: "glovesCost", lvl: "glovesLvl", mult: 1.45, msg: "🧤 Gants ! Clic +5%" },
        { id: "nectar", cost: "nectarCost", lvl: "nectarLvl", mult: 1.35, msg: "🧪 Nectar ! Chance +0.1" },
        { id: "filter", cost: "filterCost", lvl: "filterLvl", mult: 1.4, msg: "🌪️ Filtre ! Prod +2%" },
        { id: "mead", cost: "meadCost", lvl: "meadLvl", mult: 1.4, msg: "🍷 Hydromel ! Prod +3%" },
        { id: "stinger", cost: "stingerCost", lvl: "stingerLvl", mult: 1.45, msg: "🗡️ Dard ! Clic +6%" },
        { id: "hivenet", cost: "hivenetCost", lvl: "hivenetLvl", mult: 1.5, msg: "🌐 Réseau ! Prod +3%" },
        { id: "wax", cost: "waxCost", lvl: "waxLvl", mult: 1.5, msg: "🕯️ Cire ! Prod +4%" },
        { id: "jelly", cost: "jellyCost", lvl: "jellyLvl", mult: 1.6, msg: "🧪 Gelée ! Prod +5%" }
    ];

    simpleUpgrades.forEach(upg => {
        // Mise à jour du message de notification pour les améliorations
        const rate = Constants.UPGRADE_RATES[upg.id] * 100;

        document.getElementById(`btn-buy-${upg.id}`)?.addEventListener("click", () => {
            const result = Formulas.performBulkPurchase(upg.cost, upg.lvl, upg.mult, upg.msg);
            if (result.success) {
                Utils.playSound('buy');
                if (typeof result.specificUpdates === 'function') {
                    const expResult = result.specificUpdates(result.levelsBought);
                    if (expResult && typeof expResult === 'object') {
                        if (expResult.levelUp) {
                            Utils.showNotification(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes niveau ${gameState.level}`);
                            Utils.playSound('levelup');
                            UI.animateLevelUp();
                        }
                        if (expResult.masteryPoint) {
                            Utils.showNotification("🎁 Récompense de palier : +1 Point de Maîtrise !", "divine");
                        }
                    }
                }
                
                // Calcul du bonus total (taux par niveau * nombre de niveaux achetés)
                const totalBonus = Math.round(rate * result.levelsBought);
                const msg = result.notificationMsg.replace(/\+\d+%/g, `+${totalBonus}%`);
                
                Utils.showNotification(`${msg} (${result.levelsBought} fois)`);
            } else {
                Utils.showNotification(result.message);
            }
            UI.updateDisplay();
            Storage.queueSave();
        });
    });
    
    // Réparation du bouton Phéromones (Prestige Boost)
    document.getElementById("btn-buy-prestige-boost")?.addEventListener("click", () => {
        const rate = Constants.UPGRADE_RATES.prestigeBoost;
        const result = Formulas.performBulkPurchase('prestigeBoostCost', 'prestigeBoostLevel', 1.4, "🧬 Phéromones ! Global +5%");
        
        if (result.success) {
            Utils.playSound('buy');
            if (typeof result.specificUpdates === 'function') {
                const expResult = result.specificUpdates(result.levelsBought);
                if (expResult && typeof expResult === 'object') {
                    if (expResult.levelUp) {
                        Utils.showNotification(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes niveau ${gameState.level}`);
                        Utils.playSound('levelup');
                        UI.animateLevelUp();
                    }
                    if (expResult.masteryPoint) {
                        Utils.showNotification("🎁 Récompense de palier : +1 Point de Maîtrise !", "divine");
                    }
                }
            }
            const totalBonus = Math.round(rate * 100 * result.levelsBought);
            const msg = result.notificationMsg.replace(/\+\d+%/g, `+${totalBonus}%`);
            Utils.showNotification(`${msg} (${result.levelsBought} fois)`);
        } else {
            Utils.showNotification(result.message, "warning");
        }
        UI.updateDisplay(); 
        Storage.queueSave();
    });

    document.getElementById("btn-force-rain")?.addEventListener("click", () => {
        const result = GameLogic.forceRain(Formulas); // Passe Formulas
        if (result.success) {
            Utils.playSound('rain');
            Utils.showNotification(`🌧️ Pluie forcée ! -${Utils.formatNumber(result.cost)} 🍯`);
        } else {
            Utils.showNotification(result.message);
        }
        UI.updateDisplay();
        Storage.queueSave();
    });


    document.getElementById("buy-mastery-click")?.addEventListener("click", () => {
        let amountToBuy = gameState.buyAmount === -1 ? gameState.masteryPoints : gameState.buyAmount;
        if (gameState.masteryPoints >= amountToBuy && amountToBuy > 0) {
            gameState.masteryPoints -= amountToBuy;
            gameState.masteryClickBonus += amountToBuy;
            Utils.showNotification(`⚡ Maîtrise Céleste : Clic de base +${amountToBuy} !`);
            Utils.playSound('levelup'); // Son pour l'achat de maîtrise
            UI.updateDisplay();
            Storage.queueSave();
        } else { Utils.showNotification("Points de maîtrise insuffisants."); }
    });

    document.getElementById("buy-mastery-luck")?.addEventListener("click", () => {
        if (Formulas.getTotalLuck() >= Formulas.MAX_LUCK_CAP) {
            Utils.showNotification("Chance déjà au maximum ! ✨", "warning");
            return;
        }

        let amountToBuy = gameState.buyAmount === -1 ? gameState.masteryPoints : gameState.buyAmount;
        if (gameState.masteryPoints >= amountToBuy && amountToBuy > 0) {
            gameState.masteryPoints -= amountToBuy;
            gameState.masteryLuckBonus += (amountToBuy * 0.1); // Réduit de 0.25 à 0.1
            Utils.showNotification(`✨ Maîtrise Céleste : Chance augmentée de +${(amountToBuy * 0.1).toFixed(1)} !`);
            Utils.playSound('levelup'); // Son pour l'achat de maîtrise
            UI.updateDisplay();
            Storage.queueSave();
        } else { Utils.showNotification("Points de maîtrise insuffisants."); }
    });

    const buyAmounts = [1, 10, 25, 50, 100];
    buyAmounts.forEach(amount => {
        document.getElementById(`buy-x${amount}`)?.addEventListener("click", () => {
            gameState.buyAmount = amount;
            UI.updateDisplay();
            Storage.queueSave();
        });
    });
    document.getElementById("buy-max")?.addEventListener("click", () => {
        gameState.buyAmount = -1;
        UI.updateDisplay();
        Storage.queueSave();
    });

    // Gestion des onglets
    UI.ui["tab-shop"]?.addEventListener("click", () => UI.switchTab(UI.ui["tab-shop"], UI.ui["shop-view"]));
    UI.ui["tab-garden"]?.addEventListener("click", () => UI.switchTab(UI.ui["tab-garden"], UI.ui["garden-view"]));
    UI.ui["tab-beedex"]?.addEventListener("click", () => UI.switchTab(UI.ui["tab-beedex"], UI.ui["beedex-view"]));
    UI.ui["tab-potions"]?.addEventListener("click", () => UI.switchTab(UI.ui["tab-potions"], UI.ui["potion-view"]));

    document.getElementById("prestige-btn")?.addEventListener("click", () => {
        const result = Formulas.prestige();
        if (result.success) {
            Utils.showNotification(`✨ Ascension ! Vous avez gagné ${result.earnedPoints} point(s) de Maîtrise !`);
            Utils.addLog(`🚀 <b>Ascension ${result.newRoyalJelly}</b> réussie ! Gain : +${result.earnedPoints} ✨`, "divine");
            Utils.playSound('levelup'); // Son pour l'ascension
            GameLogic.startAutoclickLoop(Formulas);
            UI.renderMissions();
            UI.updateDisplay();
            Storage.flushSave(); // Sauvegarde immédiate après ascension
        } else {
            Utils.showNotification(result.message);
        }
    });
    document.getElementById("reset-btn")?.addEventListener("click", () => { Formulas.resetGame(); }); // Pas besoin de UI/Storage ici, la page se recharge
    document.getElementById('btn-export')?.addEventListener('click', Storage.exportSave);
    document.getElementById('btn-import')?.addEventListener("click", Storage.importSave);
    
    // Correction de l'ID pour correspondre au HTML (btn-secret-code)
    document.getElementById('btn-secret-code')?.addEventListener("click", () => {
        const code = prompt("Entrez votre code mécène (ex: MECENE2024, ULTIMATE, etc.) :");
        if (!code) return;

        const result = Formulas.redeemCode(code);
        if (result.success) {
            Utils.showNotification(result.message, "success");
            Utils.addLog(`🎁 Code utilisé : <b>${result.code}</b>`, "success");
            UI.updateDisplay();
            Storage.queueSave();
        } else {
            Utils.showNotification(result.message, "warning");
        }
    });

    // --- 4. BOUCLES D'ÉVÉNEMENTS ALÉATOIRES ET SAUVEGARDE ---
    // La gestion des frelons est maintenant dans GameLogic.js et dépend de la météo
    setInterval(() => { if (Math.random() < 0.20) GameLogic.spawnGoldenBee(Formulas); }, 40000); // Passe Formulas
    setInterval(() => {
        const result = GameLogic.updateWeather(Formulas); // Passe Formulas
        if (result.isRainy) Utils.playSound('rain');
        Utils.addLog(`🌤️ Météo : <b>${result.weatherName}</b> (${result.weatherDesc})`, "weather");
        Utils.showNotification(`🌤️ La météo change : ${result.weatherName} (${result.weatherDesc})`);
        UI.updateDisplay();
    }, 120000);
    setInterval(Storage.saveGame, 10000);
    setInterval(() => {
        const result = GameLogic.handleDonatorAutoLoot();
        if (result.autoLooted && result.collectedCount > 0) {
            UI.updateDisplay(); // Mettre à jour l'UI si des ingrédients ont été auto-collectés
        }
    }, 1000);

    // Messages d'accueil
    setTimeout(() => Utils.addLog("ℹ️ Bee Clicker prêt !", "info"), 1000);
}

document.addEventListener('click', Utils.resumeAudioContext, { once: true });

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") Storage.flushSave();
});
window.addEventListener("beforeunload", Storage.flushSave);

window.onload = init;
