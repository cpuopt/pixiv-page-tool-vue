const add2Collect = () => {
    function addc(addButton) {
        return new Promise((resolve) => {
            setTimeout(() => {
                addButton.click();
                resolve();
            }, 200);
        });
    }
    async function run_add() {
        let uncollects = unLikedButtons()
        console.log(uncollects);
        for (const element of uncollects) {
            await addc(element);
        }

    }
    run_add();
};

export const getLikedIllusts = () => {
    const snapshot = document.evaluate(
        `//a[@data-gtm-user-id][translate(@data-gtm-user-id, '0123456789', '') = '']/following-sibling::*[1]//button/*[local-name()='svg']`,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    // 目前已经收藏的svg style 中 color: rgb(255, 64, 96)
    const collected = [];

    for (let i = 0; i < snapshot.snapshotLength; i++) {
        const svg = snapshot.snapshotItem(i);

        const color = getComputedStyle(svg).color;

        if (color === 'rgb(255, 64, 96)') {
            collected.push(svg.closest("li"));
        }
    }
    console.log(collected);

    return collected
};

export const unLikedButtons = () => {
    const snapshot = document.evaluate(
        `//a[@data-gtm-user-id][translate(@data-gtm-user-id, '0123456789', '') = '']/following-sibling::*[1]//button/*[local-name()='svg']`,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    // 目前未收藏的svg style 中 color: rgb(31,31,31)
    const uncollected = [];

    for (let i = 0; i < snapshot.snapshotLength; i++) {
        const svg = snapshot.snapshotItem(i);

        const color = getComputedStyle(svg).color;

        if (color === 'rgb(31, 31, 31)') {
            uncollected.push(svg.parentElement);
        }
    }
    return uncollected
}

export { add2Collect };
