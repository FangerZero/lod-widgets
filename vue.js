const { createApp, ref } = Vue

const damage = ref(0);
const dDamage = ref(0);
const rlDisplay = ref(false);
const hide = () => {
    rlDisplay.value = false;
};
const show = () => {
    rlDisplay.value = true;
};

// Stats
const attack = ref(0);
const attackMagic = ref(0);
const defense = ref(0);
const defenseMagic = ref(0);
const elementWeapon = ref(0);
const elementField = ref(0);
const additionLevel = ref();
const additionHit = ref();
const enemy = ref();
// Gear
const weapon = ref();
const helm = ref();
const armor = ref();
const boots = ref();
const accessory = ref();

// Player Modifications
const playerPowerUp = ref(false);
const playerFearful = ref(false);

// Enemy Modifications
const enemyPowerDown = ref(false);
const enemyFearful = ref(false);

// Creating Enemy List
const enemyList = ref([]);
const currentEnemyInfo = ref({});
const enemyJSONFile = 'https://raw.githubusercontent.com/FangerZero/lod-2.0/main/testData/enemies.json';
fetch(enemyJSONFile)
  .then((response) => response.json())
  .then((json) => json.map(n => enemyList.value.push(n)));

// Selecting a player (Update Gear, Additions, Level)
const playerList = ref([]);
const currentPlayerInfo = ref({});
const playerJSONFile = 'https://raw.githubusercontent.com/FangerZero/lod-2.0/main/testData/characters2.json';
fetch(playerJSONFile)
  .then((response) => response.json())
  .then((json) => json.map(n => playerList.value.push(n)));

const currentLevel = ref(1);
const currentWeapon = ref({});
const weaponList = ref([]);
const currentHelm = ref({});
const helmList = ref([]);
const currentArmor = ref({});
const armorList = ref([]);
const currentBoots = ref({});
const bootsList = ref([]);
const currentAccessory = ref({});
const accessoryList = ref([]);
// Attack Type
const currentAddition = ref();
const additionList = ref([]);
const changePlayer = () => {
    // Create DropDowns
    weaponList.value = currentPlayerInfo.value.gear.weapon;
    helmList.value = currentPlayerInfo.value.gear.headgear;
    armorList.value = currentPlayerInfo.value.gear.torso;
    bootsList.value = currentPlayerInfo.value.gear.footgear;
    accessoryList.value = currentPlayerInfo.value.gear.accessory;
    additionList.value = currentPlayerInfo.value.additions;
    dragoonAttackList.value = currentPlayerInfo.value.dragoon[0].levels.filter(dLevel => dLevel.spell.length > 0);
    if (currentPlayerInfo.value.dragoon[1]) {
        dragoonAttackList.value = [...dragoonAttackList.value, ...currentPlayerInfo.value.dragoon[1].levels];
    }
};

const calculateStats = () => {
    // Attack (Base Stats + Weapon + Accessory)
    const tempLevelAtk = currentPlayerInfo.value.levels[currentLevel.value - 1].attack || 0; // Index Correction
    const tempWeaponAtk = currentWeapon?.value?.attack || 0;
    const tempAccessoryAtk = currentAccessory?.value?.attack || 0;
    attack.value = +tempLevelAtk + +tempWeaponAtk + +tempAccessoryAtk;

    // Attack Magic (Base Stats + Helm + Accessory)
    const tempLevelAtkMag = currentPlayerInfo.value.levels[currentLevel.value - 1].attackMagic || 0; // Index Correction
    const tempHelmAtkMag = currentHelm?.value?.attackMagic || 0;
    const tempAccessoryAtkMag = currentAccessory?.value?.attackMagic || 0;
    attackMagic.value = +tempLevelAtkMag + +tempHelmAtkMag + +tempAccessoryAtkMag;

    // Defense (Base Stats + Helm + Armor + Boots + Accessory)
    const tempLevelDef = currentPlayerInfo.value.levels[currentLevel.value - 1].defense || 0; // Index Correction
    const tempHelmDef = currentHelm?.value?.defense || 0;
    const tempArmorDef = currentArmor?.value?.defense || 0;
    const tempBootsDef = currentBoots?.value?.defense || 0;
    const tempAccessoryDef = currentAccessory?.value?.defense || 0;
    defense.value = +tempLevelDef + +tempHelmDef + +tempArmorDef + +tempBootsDef + +tempAccessoryDef;

    // Defense Magic (Base Stats + Helm + Armor + Boots + Accessory)
    const tempLevelDefMag = currentPlayerInfo.value.levels[currentLevel.value - 1].defenseMagic || 0; // Index Correction
    const tempHelmDefMag = currentHelm?.value?.defenseMagic || 0;
    const tempArmorDefMag = currentArmor?.value?.defenseMagic || 0;
    const tempBootsDefMag = currentBoots?.value?.defenseMagic || 0;
    const tempAccessoryDefMag = currentAccessory?.value?.defenseMagic || 0;
    defenseMagic.value = +tempLevelDefMag + +tempHelmDefMag + +tempArmorDefMag + +tempBootsDefMag + +tempAccessoryDefMag;
};

// Attacking
const currentDragoonLevel = ref("");
const currentDragoonAttack = ref("");
const dragoonAttackList = ref([]);


const currentAdditionLevel = ref(0);
const additionLevelList = ref([]);
const updateAdditionLevelList = () => {
    currentAdditionLevel.value = 0;
    additionLevelList.value = currentAddition.value.levels;
}

const currentDAdditionHits = ref("")
const currentAdditionHits = ref("");
const additionHitsList = ref([]);
const updateAdditionHitsList = () => {
    additionHitsList.value = currentAddition?.value?.hits.length || "";
}

const elements = ref(['None', 'Dark', 'Earth', 'Fire', 'Light', 'Thunder', 'Water', 'Wind']);
const currentFieldElement = ref("");

////////////////////////////////////////////////////
// All data necessary to calculate
const hasAllData = () => {
    if (!currentLevel?.value) return false;
    if (!currentEnemyInfo?.value?.name) return false;
    if (!currentAddition?.value && !currentDragoonAttack?.value) return false;
    if (!currentAdditionLevel?.value && !currentDragoonLevel?.value) return false;
    if (!currentWeapon?.value) return false;
    return true;
}

////////////////////////////////////////////////////
// Damage Formula
const calculateDamage = () => {
    if(!hasAllData()) {
        return;
    }
    
    const opposingElements = {
        "fire": "water",
        "water": "fire",
        "light": "dark",
        "dark": "light",
        "earth": "wind",
        "wind": "earth",
        "none": "",
        "thunder": "",
    };

    // Determine Enemy Information
    const enemyElement = currentEnemyInfo.value.element;

    // Modifications
    const ppu = playerPowerUp.value ? 50 : 0;
    const epd = enemyPowerDown.value ? 50 : 0;
    
    if (currentAddition?.value && currentAdditionLevel?.value) {
        // Spell/Weapon Element
        const attackElement = currentWeapon.value.element === "None" ? "None" : elements.value.filter(element => currentWeapon.value.element === element);
        let weaponElementBonus = 0;
        if (opposingElements[currentEnemyInfo.value.element] === attackElement) {
            weaponElementBonus = 100;
        } else if (enemyElement === attackElement) {
            weaponElementBonus = -50;
        }

        // Field Bonus
        let dragoonFieldBonus = 0;
        if (!currentFieldElement.value && opposingElements[currentFieldElement.value] === attackElement) {
            dragoonFieldBonus = -50;
        } else if (currentFieldElement.value === attackElement) {
            dragoonFieldBonus = 50
        }

        // Is Transformed Modifier
        const dragoonModifierBonus = 100;
        const hits = currentAddition.value.hits.filter((index, key) => key < currentAdditionHits.value);

        // Addition Completion Calculation
        const dmgMultiplier = [1, 1.25, 1.5, 1.75, 2][currentAdditionLevel.value.level - 1]; // Array is same for all Additions
        const maxHitPercent = hits.length ? (hits.reduce((a, b) => a + b) * dmgMultiplier) : currentAdditionLevel.value.damage;
        
        damage.value = formula(maxHitPercent, dragoonModifierBonus, attack.value, currentLevel.value, currentEnemyInfo.value.defense, weaponElementBonus, ppu, epd, dragoonFieldBonus);
    }

    if (currentDragoonAttack?.value && currentDragoonLevel?.value) {
        // Determine Physical Attack vs Magical Attack 
        const dAttack = currentDragoonAttack.value === "physical" ? attack.value : attackMagic.value;
        const enemyDef = currentDragoonAttack.value === "physical" ? currentEnemyInfo.value.defense : currentEnemyInfo.value['magical-defense'];
        
        const dLevelInfo = currentDragoonAttack?.value?.element?.search(/divine/i) ? currentPlayerInfo.value.dragoon[1].levels[currentDragoonLevel.value - 1] : currentPlayerInfo.value.dragoon[0].levels[currentDragoonLevel.value - 1];
        //const dLevelInfo = currentPlayerInfo.value.dragoon[0].levels[currentDragoonLevel.value - 1];
        // Spell/Weapon Element
        const dAttackElement = currentDragoonAttack.value === "physical" ? "None" : dLevelInfo.element;
        let dWeaponElementBonus = 0;
        if (opposingElements[currentEnemyInfo.value.element] === dAttackElement) {
            dWeaponElementBonus = 100;
        } else if (enemyElement === dAttackElement) {
            dWeaponElementBonus = -50;
        }

        // Dragoon Field Bonus
        let dDragoonFieldBonus = 0;
        if (currentFieldElement.value.length > 0  && opposingElements[currentFieldElement.value] === dAttackElement) {
            dDragoonFieldBonus = -50;
        } else if (currentFieldElement.value === dAttackElement) {
            dDragoonFieldBonus = 50
        }
        
        const dDragoonModifierBonus = currentDragoonAttack.value === "physical" ? dLevelInfo.attack : dLevelInfo.attackMagic;
        const dMaxHitPercent = currentDAdditionHits.value === "" ? 200 : [100, 110, 130, 160, 200][currentDAdditionHits.value - 1]; // Dragoon Default 200
       
        dDamage.value = formula(dMaxHitPercent, dDragoonModifierBonus, dAttack, currentLevel.value, enemyDef, dWeaponElementBonus, ppu, epd, dDragoonFieldBonus);
    }
};

const formula = (maxHitPercent, dModifierBonus, atk, lv, def, elementBonus, ppu, epd, fieldBonus) => {
    console.log('Formula - atk: ', atk);
    // Actual Calculation 
    const FIRST = Math.floor(Number(maxHitPercent) * Number(dModifierBonus) / 100);
     console.log('FIRST', FIRST);
    const SECOND = Math.floor((FIRST * atk) / 100);
     console.log('SECOND', SECOND);
    const THIRD = Math.round((SECOND * (+lv + 5) * 5) / def);
     console.log('THIRD', THIRD);
    const FOURTH = Math.floor((THIRD * (100 + +elementBonus)) / 100);
     console.log('FOURTH', FOURTH);
    const FIFTH = Math.floor((FOURTH * (100 + +ppu + +epd)) / 100);
     console.log('FIFTH', FIFTH);
    const SIXTH = Math.floor((FIFTH * (100 + +fieldBonus)) / 100);
     console.log('SIXTH', SIXTH);
    const SEVENTH = playerFearful.value ? Math.floor(SIXTH / 2) : SIXTH;
     console.log('SEVENTH', SEVENTH);
    const EIGHTH = enemyFearful.value ? Math.floor(SEVENTH * 2) : SEVENTH;
     console.log('EIGHTH', EIGHTH);
    return EIGHTH || 0;
}

createApp({
    setup() {
        return {
        damage,
        dDamage,
        playerList,
        currentPlayerInfo,
        currentLevel,
        attack,
        attackMagic,
        defense,
        defenseMagic,
        changePlayer,
        calculateStats,
        currentWeapon,
        weaponList,
        currentHelm,
        helmList,
        currentArmor,
        armorList,
        currentBoots,
        bootsList,
        currentAccessory,
        accessoryList,
        currentAddition,
        additionList,
        currentAdditionLevel,
        additionLevelList,
        currentDragoonLevel,
        currentDragoonAttack,
        dragoonAttackList,
        updateAdditionLevelList,
        updateAdditionHitsList,
        currentAdditionHits,
        additionHitsList,
        currentDAdditionHits,
        playerPowerUp,
        playerFearful,
        enemyPowerDown,
        enemyFearful,
        enemyList,
        currentEnemyInfo,
        elements,
        currentFieldElement,
        hasAllData,
        calculateDamage,
        rlDisplay,
        hide,
        show
        }
    }
}).mount('#app')