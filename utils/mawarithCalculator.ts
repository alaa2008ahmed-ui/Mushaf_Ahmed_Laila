export interface HeirResult {
    name: string;
    share: number;
    amount: number;
    type: 'فرض' | 'تعصيب' | 'رد' | 'عول';
}

export interface MawarithInput {
    estateValue: string;
    spouseType: 'none' | 'husband' | 'wife';
    wivesCount: number;
    hasFather: boolean;
    hasMother: boolean;
    sonsCount: number;
    daughtersCount: number;
    grandsonsCount: number;
    granddaughtersCount: number;
    hasPaternalGrandfather: boolean;
    hasMaternalGrandmother: boolean;
    hasPaternalGrandmother: boolean;
    fullBrothersCount: number;
    fullSistersCount: number;
    paternalBrothersCount: number;
    paternalSistersCount: number;
    maternalSiblingsCount: number;
    fullNephewsCount: number;
    paternalNephewsCount: number;
    fullUnclesCount: number;
    paternalUnclesCount: number;
    fullCousinsCount: number;
    paternalCousinsCount: number;
}

export const calculateMawarith = (input: MawarithInput): HeirResult[] => {
    const total = parseFloat(input.estateValue) || 0;
    if (total <= 0) return [];

    let remaining = total;
    const results: HeirResult[] = [];

    // --- Hajb (Blocking) Logic ---
    const hasSons = input.sonsCount > 0;
    const hasDaughters = input.daughtersCount > 0;
    const hasGrandsons = input.grandsonsCount > 0 && !hasSons;
    const hasGranddaughters = input.granddaughtersCount > 0 && !hasSons;
    
    const isMaleDescendant = hasSons || hasGrandsons;
    const isFemaleDescendant = hasDaughters || hasGranddaughters;
    const isChildrenPresent = isMaleDescendant || isFemaleDescendant;

    const isFather = input.hasFather;
    const isMother = input.hasMother;
    const isPaternalGrandfather = input.hasPaternalGrandfather && !isFather;
    const isMaternalGrandmother = input.hasMaternalGrandmother && !isMother;
    const isPaternalGrandmother = input.hasPaternalGrandmother && !isMother && !isFather;

    const isMaleAscendant = isFather || isPaternalGrandfather;

    // Siblings blocking
    const blockMaternalSiblings = isChildrenPresent || isMaleAscendant;
    const blockFullSiblings = isMaleDescendant || isFather || isPaternalGrandfather;
    const blockPaternalSiblings = blockFullSiblings || input.fullBrothersCount > 0 || (input.fullSistersCount > 0 && isFemaleDescendant); // Full sister with daughter becomes Asabah and blocks paternal brother

    const hasFullBrothers = input.fullBrothersCount > 0 && !blockFullSiblings;
    const hasFullSisters = input.fullSistersCount > 0 && !blockFullSiblings;
    const hasPaternalBrothers = input.paternalBrothersCount > 0 && !blockPaternalSiblings;
    const hasPaternalSisters = input.paternalSistersCount > 0 && !blockPaternalSiblings;
    const hasMaternalSiblings = input.maternalSiblingsCount > 0 && !blockMaternalSiblings;

    // Extended family blocking
    const blockNephews = blockPaternalSiblings || hasFullBrothers || hasPaternalBrothers;
    const hasFullNephews = input.fullNephewsCount > 0 && !blockNephews;
    const hasPaternalNephews = input.paternalNephewsCount > 0 && !blockNephews && !hasFullNephews;

    const blockUncles = blockNephews || hasFullNephews || hasPaternalNephews;
    const hasFullUncles = input.fullUnclesCount > 0 && !blockUncles;
    const hasPaternalUncles = input.paternalUnclesCount > 0 && !blockUncles && !hasFullUncles;

    const blockCousins = blockUncles || hasFullUncles || hasPaternalUncles;
    const hasFullCousins = input.fullCousinsCount > 0 && !blockCousins;
    const hasPaternalCousins = input.paternalCousinsCount > 0 && !blockCousins && !hasFullCousins;

    // --- Furood (Fixed Shares) ---
    let totalShares = 0;
    const furood: { name: string, share: number }[] = [];

    // 1. Husband / Wife
    if (input.spouseType === 'husband') {
        furood.push({ name: 'الزوج', share: isChildrenPresent ? 1/4 : 1/2 });
    } else if (input.spouseType === 'wife' && input.wivesCount > 0) {
        furood.push({ name: input.wivesCount > 1 ? `الزوجات (${input.wivesCount})` : 'الزوجة', share: isChildrenPresent ? 1/8 : 1/4 });
    }

    // 2. Mother
    const siblingsCount = (hasFullBrothers ? input.fullBrothersCount : 0) + 
                          (hasFullSisters ? input.fullSistersCount : 0) + 
                          (hasPaternalBrothers ? input.paternalBrothersCount : 0) + 
                          (hasPaternalSisters ? input.paternalSistersCount : 0) + 
                          (hasMaternalSiblings ? input.maternalSiblingsCount : 0);
    
    if (isMother) {
        furood.push({ name: 'الأم', share: (isChildrenPresent || siblingsCount >= 2) ? 1/6 : 1/3 });
    }

    // 3. Father / Grandfather (Fixed part)
    if (isFather && isChildrenPresent) {
        furood.push({ name: 'الأب (فرض)', share: 1/6 });
    } else if (isPaternalGrandfather && isChildrenPresent) {
        furood.push({ name: 'الجد لأب (فرض)', share: 1/6 });
    }

    // 4. Grandmothers
    if (isMaternalGrandmother && isPaternalGrandmother) {
        furood.push({ name: 'الجدتان (لأم ولأب)', share: 1/6 });
    } else if (isMaternalGrandmother) {
        furood.push({ name: 'الجدة لأم', share: 1/6 });
    } else if (isPaternalGrandmother) {
        furood.push({ name: 'الجدة لأب', share: 1/6 });
    }

    // 5. Daughters
    if (hasDaughters && !hasSons) {
        furood.push({ name: input.daughtersCount === 1 ? 'البنت' : `البنات (${input.daughtersCount})`, share: input.daughtersCount === 1 ? 1/2 : 2/3 });
    }

    // 6. Granddaughters (if no sons, no grandsons, and < 2 daughters)
    if (hasGranddaughters && !hasSons && !hasGrandsons) {
        if (input.daughtersCount === 0) {
            furood.push({ name: input.granddaughtersCount === 1 ? 'بنت الابن' : `بنات الابن (${input.granddaughtersCount})`, share: input.granddaughtersCount === 1 ? 1/2 : 2/3 });
        } else if (input.daughtersCount === 1) {
            furood.push({ name: input.granddaughtersCount === 1 ? 'بنت الابن' : `بنات الابن (${input.granddaughtersCount})`, share: 1/6 }); // تكملة الثلثين
        }
    }

    // 7. Maternal Siblings
    if (hasMaternalSiblings) {
        furood.push({ name: input.maternalSiblingsCount === 1 ? 'الأخ/الأخت لأم' : `الإخوة لأم (${input.maternalSiblingsCount})`, share: input.maternalSiblingsCount === 1 ? 1/6 : 1/3 });
    }

    // 8. Full Sisters (if no full brothers, no male ascendants/descendants, no female descendants)
    if (hasFullSisters && !hasFullBrothers && !isFemaleDescendant) {
        furood.push({ name: input.fullSistersCount === 1 ? 'الأخت الشقيقة' : `الأخوات الشقيقات (${input.fullSistersCount})`, share: input.fullSistersCount === 1 ? 1/2 : 2/3 });
    }

    // 9. Paternal Sisters (if no paternal brothers, no full siblings, no descendants/ascendants)
    if (hasPaternalSisters && !hasPaternalBrothers && !hasFullBrothers && !isFemaleDescendant) {
        if (input.fullSistersCount === 0) {
            furood.push({ name: input.paternalSistersCount === 1 ? 'الأخت لأب' : `الأخوات لأب (${input.paternalSistersCount})`, share: input.paternalSistersCount === 1 ? 1/2 : 2/3 });
        } else if (input.fullSistersCount === 1) {
            furood.push({ name: input.paternalSistersCount === 1 ? 'الأخت لأب' : `الأخوات لأب (${input.paternalSistersCount})`, share: 1/6 }); // تكملة الثلثين
        }
    }

    // --- Calculate Furood ---
    totalShares = furood.reduce((sum, f) => sum + f.share, 0);
    
    // Awl (العول) - if shares exceed 1
    let awlFactor = 1;
    if (totalShares > 1) {
        awlFactor = totalShares;
    }

    furood.forEach(f => {
        const actualShare = f.share / awlFactor;
        const amount = total * actualShare;
        results.push({ name: f.name, share: actualShare, amount, type: totalShares > 1 ? 'عول' : 'فرض' });
        remaining -= amount;
    });

    // Prevent floating point issues
    if (remaining < 0.01) remaining = 0;

    // --- Ta'seeb (Residuary) ---
    if (remaining > 0) {
        const addAsabah = (name: string, count: number, maleWeight: number, femaleCount: number = 0) => {
            const totalParts = (count * maleWeight) + femaleCount;
            const partValue = remaining / totalParts;
            if (count > 0) {
                results.push({ name: count === 1 ? name : `${name} (${count})`, share: (partValue * count * maleWeight) / total, amount: partValue * count * maleWeight, type: 'تعصيب' });
            }
            if (femaleCount > 0) {
                const femaleName = name.replace('الابن', 'البنت').replace('الأخ', 'الأخت').replace('الأبناء', 'البنات').replace('الإخوة', 'الأخوات');
                results.push({ name: femaleCount === 1 ? femaleName : `${femaleName} (${femaleCount})`, share: (partValue * femaleCount) / total, amount: partValue * femaleCount, type: 'تعصيب' });
            }
            remaining = 0;
        };

        if (hasSons) {
            addAsabah('الابن', input.sonsCount, 2, input.daughtersCount);
        } else if (hasGrandsons) {
            addAsabah('ابن الابن', input.grandsonsCount, 2, input.granddaughtersCount);
        } else if (isFather) {
            results.push({ name: 'الأب (تعصيباً)', share: remaining / total, amount: remaining, type: 'تعصيب' });
            remaining = 0;
        } else if (isPaternalGrandfather) {
            results.push({ name: 'الجد لأب (تعصيباً)', share: remaining / total, amount: remaining, type: 'تعصيب' });
            remaining = 0;
        } else if (hasFullBrothers) {
            addAsabah('الأخ الشقيق', input.fullBrothersCount, 2, input.fullSistersCount);
        } else if (hasFullSisters && isFemaleDescendant) {
            // Full sister becomes Asabah with daughters
            results.push({ name: input.fullSistersCount === 1 ? 'الأخت الشقيقة (عصبة مع الغير)' : `الأخوات الشقيقات (${input.fullSistersCount} - عصبة مع الغير)`, share: remaining / total, amount: remaining, type: 'تعصيب' });
            remaining = 0;
        } else if (hasPaternalBrothers) {
            addAsabah('الأخ لأب', input.paternalBrothersCount, 2, input.paternalSistersCount);
        } else if (hasPaternalSisters && isFemaleDescendant) {
            results.push({ name: input.paternalSistersCount === 1 ? 'الأخت لأب (عصبة مع الغير)' : `الأخوات لأب (${input.paternalSistersCount} - عصبة مع الغير)`, share: remaining / total, amount: remaining, type: 'تعصيب' });
            remaining = 0;
        } else if (hasFullNephews) {
            addAsabah('ابن الأخ الشقيق', input.fullNephewsCount, 1);
        } else if (hasPaternalNephews) {
            addAsabah('ابن الأخ لأب', input.paternalNephewsCount, 1);
        } else if (hasFullUncles) {
            addAsabah('العم الشقيق', input.fullUnclesCount, 1);
        } else if (hasPaternalUncles) {
            addAsabah('العم لأب', input.paternalUnclesCount, 1);
        } else if (hasFullCousins) {
            addAsabah('ابن العم الشقيق', input.fullCousinsCount, 1);
        } else if (hasPaternalCousins) {
            addAsabah('ابن العم لأب', input.paternalCousinsCount, 1);
        }
    }

    // --- Radd (Return) ---
    if (remaining > 0.01 && totalShares < 1) {
        // Radd usually doesn't apply to spouses. Filter them out.
        const eligibleForRadd = results.filter(r => r.type === 'فرض' && !r.name.includes('الزوج'));
        
        if (eligibleForRadd.length > 0) {
            const raddTotalShares = eligibleForRadd.reduce((sum, r) => sum + r.share, 0);
            eligibleForRadd.forEach(heir => {
                const additionalAmount = (heir.share / raddTotalShares) * remaining;
                heir.amount += additionalAmount;
                heir.share += additionalAmount / total;
                heir.type = 'رد';
            });
            remaining = 0;
        } else if (results.length > 0) {
            // If only spouse is there, in modern law it often returns to them if no treasury (Bait al-Mal)
            const spouse = results[0];
            spouse.amount += remaining;
            spouse.share += remaining / total;
            spouse.type = 'رد';
            remaining = 0;
        }
    }

    return results;
};
