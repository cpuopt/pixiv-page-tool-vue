const TIME_CLASS = 'pixiv-page-tool-upload-time';

// 保留图片路径中的时间，不做浏览器本地时区转换。
export function getIllustUploadTime(source) {
    let url;
    try {
        url = new URL(source);
    } catch {
        return null;
    }
    if (url.hostname !== 'i.pximg.net') return null;
    const match = url.pathname.match(/\/img\/(\d{4})\/(\d{2})\/(\d{2})\/(\d{2})\/(\d{2})\/(\d{2})\/(\d+)(?:_|\.)/);
    if (!match) return null;
    const [, year, month, day, hour, minute, second, artworkId] = match;
    const dateTime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    const date = new Date(`${dateTime}Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 19) !== dateTime) return null;
    return { artworkId, dateTime, text: dateTime.replace('T', ' ') };
}

export function removeIllustUploadTimes() {
    document.querySelectorAll(`.${TIME_CLASS}`).forEach((label) => label.remove());
}

export function updateIllustUploadTimes() {
    const updatedLabels = new Set();
    document.querySelectorAll('a[href*="/artworks/"] img').forEach((image) => {
        const link = image.closest('a');
        const artworkId = link.getAttribute('href').match(/\/artworks\/(\d+)(?:[/?#]|$)/)?.[1];
        const item = link.closest('li, div[data-ga4-label="thumbnail"]');
        // 精选作品使用单独的卡片布局，不属于插画网格。
        if (!artworkId || !item || image.closest('div[width="288"]') || item.classList.contains('featuredLI')) return;
        const time = [image.getAttribute('src'), image.currentSrc, image.getAttribute('data-src'), image.getAttribute('srcset')]
            .filter(Boolean)
            .flatMap((source) => source.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]))
            .map(getIllustUploadTime)
            .find((value) => value?.artworkId === artworkId);
        if (!time) return;
        let label = Array.from(item.children).find((child) => child.classList.contains(TIME_CLASS));
        if (!label) {
            label = document.createElement('time');
            label.className = TIME_CLASS;
            item.append(label);
        }
        if (label.textContent !== time.text) label.textContent = time.text;
        if (label.getAttribute('datetime') !== time.dateTime) label.setAttribute('datetime', time.dateTime);
        label.title = '投稿时间（图片链接中的时间）';
        updatedLabels.add(label);
    });
    // 网格节点被复用、图片被移除或链接不再有效时，清理旧时间。
    document.querySelectorAll(`.${TIME_CLASS}`).forEach((label) => {
        if (!updatedLabels.has(label)) label.remove();
    });
}
