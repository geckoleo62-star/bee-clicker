/**
 * state.js
 * Gère l'état global du jeu (gameState) et les variables internes.
 */

export let gameState = {
    honey: 0,
    clickLevel: 1,
    beeCost: 50,
    clickCost: 150,
    maxHoneyReached: 0,
    highestHoneyEver: 0,
    totalHoneyProduced: 0,
    royalJelly: 0,
    prestigeBoostLevel: 0,
    prestigeBoostCost: 1500,
    
    masteryPoints: 0,
    totalMasteryEarned: 0,
    level: 1,
    exp: 0,
    expNextLevel: 100,

    masteryClickBonus: 0,
    masteryLuckBonus: 0,

    discoveredBees: { common: true, rare: false, legendary: false, mythic: false, divine: false, golden: false, hornet: false },

    beesCommon: 0,
    beesRare: 0,
    beesLegendary: 0,
    beesMythic: 0,
    beesDivine: 0,

    lavenderLvl: 0, lavenderCost: 600,
    sunflowerLvl: 0, sunflowerCost: 3000,
    roseLvl: 0, roseCost: 15000,
    daisyLvl: 0, daisyCost: 45000,
    orchidLvl: 0, orchidCost: 120000,
    lilyLvl: 0, lilyCost: 300000,
    tulipLvl: 0, tulipCost: 800000,
    poppyLvl: 0, poppyCost: 2500000,
    lotusLvl: 0, lotusCost: 12000000,
    hibiscusLvl: 0, hibiscusCost: 60000000,

    honeycombLvl: 0, honeycombCost: 1000,
    danceLvl: 0, danceCost: 2500,
    glovesLvl: 0, glovesCost: 4000,
    nectarLvl: 0, nectarCost: 7500,

    totalClicks: 0,
    totalClicksHistorical: 0,
    totalBeesBought: 0,
    flowersPlanted: 0,
    hornetsDefeated: 0,
    totalHornetsHistorical: 0,
    totalPlayTime: 0,
    totalArtifactsHistorical: 0,
    totalPotionsCraftedHistorical: 0,
    totalPotionsUsedHistorical: 0,
    totalGoldenBeesHistorical: 0,
    totalIngredientsCollectedHistorical: 0,
    missionsClaimed: {},
    weather: "Soleil",
    artifacts: [],
    pityCounter: 0,
    buyAmount: 1,
    lastSaveTime: Date.now(),
    filterLvl: 0, filterCost: 15000,
    isMuted: false,
    isDarkMode: false,
    isLargeMode: false,
    meadLvl: 0, meadCost: 30000,
    stingerLvl: 0, stingerCost: 75000,
    hivenetLvl: 0, hivenetCost: 180000,
    waxLvl: 0, waxCost: 450000,
    jellyLvl: 0, jellyCost: 1500000,

    forceRainLvl: 0, forceRainCost: 0, // Pour le coût dynamique de la pluie forcée

    ingredients: { water: 0, petals: 0, nectar: 0 },
    potions: { honey: 0, click: 0, luck: 0 },
    activePotions: { honey: 0, click: 0, luck: 0, frenzy: 0 },
    nextRainTime: 0,
    comboCount: 0,
    totalPotionsUsed: 0,
    donatorTier: 0,
    activatedCodes: [],
};

export const internalVars = {
    isResetting: false,
    lastTickTime: Date.now(),
    hornetClicksLeft: 5,
    hornetTimer: null,
    autoclickInterval: null,
    hornetSpawnInterval: null, // Pour gérer l'apparition des frelons
    comboTimeout: null,
    rainTimeout: null, // Timer pour la prochaine pluie
    saveTimeout: null,
    isInitialRender: true,
    lastManualClickTime: 0,
    lastClickDelta: 0,
};

export function updateState(newData) {
    Object.assign(gameState, newData);
}
