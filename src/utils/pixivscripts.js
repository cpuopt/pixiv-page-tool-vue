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
        let uncollects = document.evaluate(`//button[@class='sc-kgq5hw-0 fgVkZi']/*[name()="svg"][@class='sc-j89e3c-1 fYcrPo']`, document.body, null, 7, null);
        for (let i = 0; i < uncollects.snapshotLength; i++) {
            await addc(uncollects.snapshotItem(i).parentElement);
        }
    }
    run_add();
};


export { add2Collect };
