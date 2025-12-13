import { debounce, throttle } from 'lodash';

enum PageName {
    /** 不支持的页面 */
    Unsupported = -1,
    /** 主页 */
    Home,
    /** 插画详情页面 */
    Artwork,
    /** 用户主页 */
    UserHome,
    // BookmarkLegacy 页面类型已经不存在了，但是必须保留它以避免兼容性问题
    // 因为有些设置是使用页面类型的数字编号作为键名的
    // 如果删除这个页面类型，会导致它后面所有页面类型的数字发生变化（例如 Bookmark 会从 4 变成 3）
    // 这会导致从设置项里取值时，会取到错误的值
    /** 旧版收藏页面，现已被 Bookmark 页面取代 */
    BookmarkLegacy,
    /** 收藏页面 */
    Bookmark,
    /** 插画搜索页面 */
    ArtworkSearch,
    /** 地区排行榜 */
    AreaRanking,
    /** 插画排行榜 */
    ArtworkRanking,
    Pixivision,
    /** 收藏后的详情页面，现在基本不会用到 */
    BookmarkDetail,
    /** 已关注用户的心作品 - 插画 */
    NewArtworkBookmark,
    /** 发现页面 */
    Discover,
    /** 大家的新作 - 插画 */
    NewArtwork,
    /** 小说详情页面 */
    Novel,
    /** 小说系列作品目录页 */
    NovelSeries,
    /** 小说搜索页面 */
    NovelSearch,
    /** 小说排行榜 */
    NovelRanking,
    /** 已关注用户的心作品 - 小说 */
    NewNovelBookmark,
    /** 大家的新作 - 小说 */
    NewNovel,
    /** 插画系列作品目录页 */
    ArtworkSeries,
    /** 关注的用户 */
    Following,
    /** 约稿 */
    Request,
    /** 不公开的作品 */
    Unlisted,
    /** 发现页面 - 推荐用户 */
    DiscoverUsers
}

function convertThumbURLTo540px(url: string) {
    const convertThumbURLReg = /img\/(.*)_.*1200/;
    // 'https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2021/10/26/00/00/08/93686259_p0_custom1200.jpg'
    // 'https://i.pximg.net/c/250x250_80_a2/img-master/img/2019/06/23/17/29/27/75369283_square1200.jpg'
    // 排行榜页面的图片 URL 如：
    // 'https://i.pximg.net/c/240x480/img-master/img/2022/08/01/17/59/39/100156836_p0_master1200.jpg'
    // 'https://i.pximg.net/c/480x960/img-master/img/2025/11/01/00/00/22/136937607_p0_master1200.jpg'
    const test = url.match(convertThumbURLReg);
    if (!test || !test[1]) {
        return url;
    }
    // '2021/10/26/00/00/08/93686259_p0'
    // '2019/06/23/17/29/27/75369283'
    const array = test[1].split('/');
    const id_index = array.pop();
    const datetime = array.join('/');
    return `https://i.pximg.net/c/540x540_70/img-master/img/${datetime}/${id_index}_master1200.jpg`;
}

function getPageType(): PageName {
    const url = window.location.href;
    const pathname = window.location.pathname;

    if (window.location.hostname === 'www.pixiv.net' && ['/', '/en/', '/illustration', '/manga', '/novel'].includes(pathname)) {
        return PageName.Home;
    } else if ((pathname.startsWith('/artworks') || pathname.startsWith('/en/artworks')) && /\/artworks\/\d{1,10}/.test(url)) {
        return PageName.Artwork;
    } else if (/\/users\/\d+/.test(url) && !url.includes('/bookmarks')) {
        if (pathname.includes('/following') || pathname.includes('/mypixiv') || pathname.includes('/followers')) {
            return PageName.Following;
        } else {
            return PageName.UserHome;
        }
    } else if (pathname.includes('/bookmarks/')) {
        return PageName.Bookmark;
    } else if (url.includes('/tags/')) {
        return pathname.endsWith('/novels') ? PageName.NovelSearch : PageName.ArtworkSearch;
    } else if (pathname === '/ranking_area.php' && location.search !== '') {
        return PageName.AreaRanking;
    } else if (pathname === '/ranking.php') {
        return PageName.ArtworkRanking;
    } else if (url.includes('https://www.pixivision.net') && url.includes('/a/')) {
        return PageName.Pixivision;
    } else if ((url.includes('/bookmark_add.php?id=') || url.includes('/bookmark_detail.php?illust_id=')) && !pathname.includes('/novel')) {
        return PageName.BookmarkDetail;
    } else if (url.includes('/bookmark_new_illust.php') || url.includes('/bookmark_new_illust_r18.php') || url.includes('/mypixiv_new_illust.php')) {
        return PageName.NewArtworkBookmark;
    } else if (pathname === '/discovery' || pathname.startsWith('/novel/discovery')) {
        return PageName.Discover;
    } else if (pathname === '/discovery/users') {
        return PageName.DiscoverUsers;
    } else if (url.includes('/new_illust.php') || url.includes('/new_illust_r18.php')) {
        return PageName.NewArtwork;
    } else if (pathname === '/novel/show.php') {
        return PageName.Novel;
    } else if (pathname.startsWith('/novel/series/')) {
        return PageName.NovelSeries;
    } else if (pathname === '/novel/ranking.php') {
        return PageName.NovelRanking;
    } else if (pathname.startsWith('/novel/bookmark_new') || pathname.startsWith('/novel/mypixiv_new.php')) {
        return PageName.NewNovelBookmark;
    } else if (pathname.startsWith('/novel/new')) {
        return PageName.NewNovel;
    } else if (pathname.startsWith('/user/') && pathname.includes('/series/')) {
        return PageName.ArtworkSeries;
    } else if (pathname.startsWith('/request')) {
        return PageName.Request;
    } else if (pathname.includes('/unlisted')) {
        return PageName.Unlisted;
    } else {
        // 没有匹配到可用的页面类型
        return PageName.Unsupported;
    }
}

/** 在某些页面里超找一些特定容器，为其添加自定义的 className **/
function findSpecialEl() {
    const pageType = getPageType();

    // 首页
    if (pageType === PageName.Home) {
        {
            // 在插画首页，查找作品板块的父元素
            const sectionList = document.querySelectorAll('div>section');
            sectionList.forEach((section) => {
                // 第一个选择器判断排行榜下方的多个作品列表区域，第二个下载器判断排行榜区域
                if (section.querySelector('ul li[size="1"] div[width]') || section.querySelector('ul div a.gtm-toppage-thumbnail-illustration-ranking-daily')) {
                    section.parentElement!.classList.add('homeWorksSectionParent');
                }
            });
        }

        const sectionList = document.querySelectorAll('section');
        if (sectionList.length === 0) {
            return;
        }

        if (sectionList[1]) {
            // 查找 精选新作 和 已关注用户的作品 的 section 父元素
            if (sectionList[1].querySelector('ul div')) {
                sectionList[1].classList.add('homeFriendsNewWorks');
                sectionList[1].parentElement!.classList.add('homeFriendsNewWorksParent');
            }
        }

        // 在漫画页面里，查找 推荐作品
        if (window.location.pathname.includes('/manga')) {
            const allLi = sectionList[2]?.querySelectorAll('ul li');
            if (allLi.length > 1) {
                sectionList[2].classList.add('homeRecommendedWorks');
                sectionList[2].parentElement!.classList.add('homeRecommendedWorksParent');

                const ul = sectionList[2].querySelector('ul')!;
                ul.classList.add('homeRecommendedWorksUL');
                // 宽度为 1224px 的容器
                ul.parentElement!.classList.add('homeRecommendedWorksULWrapper');
            }
        }

        // 查找“正在举办的比赛”
        const testA = document.querySelector('section li a[href*="/contest"]');
        if (testA) {
            // 查找这个章节，然后查找显示的几张图片的 UL 元素
            const wrapper = testA.closest('section');
            const ul = wrapper?.querySelector('ul');
            ul?.classList.add('contestWorksUL');
        }

        // 在新版首页里，额外查找 推荐作品
        if (sectionList[2] && ['/', '/en/', '/illustration'].includes(window.location.pathname)) {
            const allLi = sectionList[2].querySelectorAll('ul li');
            if (allLi.length > 1) {
                sectionList[2].classList.add('homeRecommendedWorks');
                sectionList[2].parentElement!.classList.add('homeRecommendedWorksParent');

                // 并且需要查找里面的小说作品，然后找到其 li 元素。
                // 这样可以给小说的 li 添加 width:100%，否则小说的宽度就是原本的样子，和大图片的视觉效果不一致
                allLi.forEach((li) => {
                    if (li.querySelector('a[href^="/novel"]')) {
                        li.classList.add('novelLI');
                    }
                });

                // 推荐作品里，最前面两个 li 元素可能是空的，也可能有个含有 iframe 的元素。
                // 当下载器把 ul 设置为 display: flex; 之后，需要移除这些元素，否则它们会占据一些宽度
                allLi.forEach((li) => {
                    if (li.childElementCount === 0) {
                        li.remove();
                    }
                    const iframe = li.querySelector('iframe');
                    if (iframe) {
                        iframe.remove();
                    }
                });
            }
        }
    }

    // artwork 页面
    if (pageType === PageName.Artwork) {
        // 查找底部的 相关作品 或 推荐作品（有些作品的底部是相关作品，有的是推荐作品，我不清楚是什么规律）
        const ul = document.querySelectorAll('aside ul');
        if (ul.length > 0) {
            const useUL = ul[ul.length - 1];
            const div = useUL.closest('div');
            if (div) {
                div.classList.add('width92vw');
            }
        }
    }

    // 画师主页
    if (pageType === PageName.UserHome) {
        // 查找“插画·漫画”的父级 div（宽度为 1224px 的那个）
        const li = document.querySelector('li[size="1"]');
        if (li) {
            const target = li.parentElement!.parentElement!;
            if (target.nodeName === 'DIV') {
                // 这是 ul 元素的父元素
                target.classList.add('userHomeULParent');
                // 这是作品列表和其上“插画·漫画”横幅的共同父元素
                const parent = target.parentElement!.parentElement!;
                parent.classList.add('userHomeWrapper');
            }
        }

        // 查找精选作品
        const allFeatured = document.querySelectorAll('div[width="288"]');
        for (const div of allFeatured) {
            // 每个精选作品的内容分为左右两部分，左侧是缩略图，右侧是作品信息
            // 区分左右，并查找其父元素 li
            div.parentElement!.classList.add('featuredLeft');
            div.parentElement!.nextElementSibling!.classList.add('featuredRight');
            const li = div.closest('li');
            if (li) {
                li.classList.add('featuredLI');
                // 查找有很大 padding 的父元素
                li.closest('div')!.classList.add('featuredPadding');
            }
        }

        // 查找作品列表上方的 tag 列表
        const a = document.querySelector('a[status="normal"]');
        if (a) {
            a.parentElement!.parentElement!.parentElement!.classList.add('userHomeTagList');
        }
    }

    //  收藏页面
    if (pageType === PageName.Bookmark) {
        // 查找每个作品列表区域的共同父元素
        // 也就是 div>section 的 div，然后给它添加自定义 className
        const sectionList = document.querySelectorAll('div>section');
        if (sectionList.length > 0) {
            sectionList[0].parentElement!.classList.add('sectionParentDiv');
        }

        // 查找宽度为 1224px 的父元素
        // 首先查找 li[size="1"]，并且需要判断里面的链接是 illust，而非 novel
        const li = document.querySelector('li[size="1"]');
        if (li) {
            const illustLink = li.querySelector('a[href^="/artworks/"]');
            if (!illustLink) {
                return;
            }

            li.parentElement!.classList.add('worksUL');
            li.parentElement!.parentElement!.classList.add('worksWrapper');
        }

        // 查找“主页、插画、漫画、收藏”一栏的导航栏
        const nav = document.querySelector('nav');
        nav?.parentElement!.classList.add('navBar');
    }

    //  搜索页面、Tag 页面
    if (pageType === PageName.ArtworkSearch) {
        // 查找每个作品列表区域的共同父元素
        // 也就是 div>section 的 div，然后给它添加自定义 className
        const sectionList = document.querySelectorAll('div>section');
        if (sectionList.length > 0) {
            sectionList[0].parentElement!.classList.add('sectionParentDiv');
        }

        // 查找作品列表的 UL 元素，将其从 grid 布局改为 flex 布局
        // 在 tag 首页，可能有两个作品缩略图区域，第一个是“热门作品”，第二个才是普通的作品列表
        const ulList = document.querySelectorAll('section ul');
        for (const ul of ulList) {
            if (ul.querySelector('div[width="184"]')) {
                ul.classList.add('worksUL');
                ul.parentElement!.classList.add('worksULParent');
            }
        }
    }

    // 已关注用户的新作品
    if (pageType === PageName.NewArtworkBookmark) {
        if (window.location.pathname.includes('/novel') === false) {
            // 查找每个作品列表区域的共同父元素
            // 也就是 div>section 的 div，然后给它添加自定义 className
            const sectionList = document.querySelectorAll('div>section');
            if (sectionList.length > 0) {
                sectionList[0].parentElement!.classList.add('sectionParentDiv');
            }

            // 查找 UL 的父级 div（宽度为 1224px 的那个）
            const li = document.querySelector('li[size="1"]');
            if (li) {
                li.parentElement!.classList.add('worksUL');

                const target = li.parentElement!.parentElement!;
                if (target.nodeName === 'DIV') {
                    target.classList.add('worksWrapper');
                }
            }
        }
    }

    //  发现页面
    if (pageType === PageName.Discover) {
        // 查找作品列表的 UL 元素
        // 因为会有多个板块，所以需要多次查找
        const ulList = document.querySelectorAll('ul');
        for (const ul of ulList) {
            if (ul.querySelector('div[type="illust"]')) {
                ul.classList.add('worksUL');
                ul.parentElement!.classList.add('worksWrapper');
            }
        }

        // 收藏作品后出现的“相关作品”区域
        // 寻找作品列表 ul 元素的上、下 div 元素，左侧是占位符，右侧是遮罩
        const els = document.querySelectorAll('ul + div');
        els.forEach((div) => {
            div.parentElement!.classList.add('ul-father');
        });
    }

    //  发现用户页面
    if (pageType === PageName.DiscoverUsers) {
        // 查找宽度为 1224px 的容器的父元素，解除它的所有直接子元素的宽度限制
        const els = document.querySelectorAll('.bg-background1');
        const name = 'wrapperwrapper';
        // 先把所有符合条件的都移除目标 className，再对最后一个添加目标 className
        els.forEach((el) => el.classList.remove(name));
        els[els.length - 1].classList.add(name);

        // 查找作品列表的 UL 元素
        // 因为会有多个板块，所以需要多次查找
        const ulList = document.querySelectorAll('ul');
        for (const ul of ulList) {
            const work = ul.querySelector('div[type="illust"]');
            if (work) {
                const ul = work.closest('ul');
                ul?.classList.add('worksUL');
            }
        }
    }

    // 关注页面
    if (pageType === PageName.Following) {
        // 查找每个作品列表区域的共同父元素
        // 也就是 div>section 的 div，然后给它添加自定义 className
        const sectionList = document.querySelectorAll('div>section');
        if (sectionList.length > 0) {
            sectionList[0].parentElement!.classList.add('sectionParentDiv');
        }
    }

    // 约稿页面，分为数种子页面
    if (pageType === PageName.Request) {
        // 正在接稿中用户的作品
        // https://www.pixiv.net/request/creators/works/illust
        // 已完成的约稿页面
        // https://www.pixiv.net/request/complete/illust
        if (window.location.pathname.includes('/request/complete') || window.location.pathname.includes('/request/creators')) {
            // 首先查找作品列表的 UL 元素
            const illustLink = document.querySelector('ul li a[href^="/artworks/"]');
            if (!illustLink) {
                return;
            }

            const ul = illustLink.closest('ul')!;
            ul.classList.add('worksUL');

            // 查找容器元素
            // ul 的祖父元素是个 div，这个 div 里面的 3 个div 都是容器元素
            const grandfather = ul.parentElement!.parentElement!;
            grandfather.childNodes.forEach((div: any) => {
                div.classList.add('worksWrapper');
                div.parentElement!.classList.add('width92vw');
            });
        } else {
            // 约稿页面
            // 为作品容器添加自定义 className
            const allSection = document.querySelectorAll('section');
            for (const section of allSection) {
                if (section.parentElement?.nodeName == 'DIV') {
                    section.parentElement.classList.add('requestContainer');
                }
            }
        }
    }

    // 图像作品的排行榜页面
    // https://www.pixiv.net/ranking.php?mode=daily&content=illust
    if (pageType === PageName.ArtworkRanking) {
        // 查找作品列表，li id="1" 这样的元素就是作品缩略图，其 id 就是排名
        const thumbList = document.querySelectorAll('ol li[id]');
        if (thumbList.length > 0) {
            thumbList[0].parentElement!.classList.add('worksUL', 'width92vw');
            thumbList[0].parentElement!.parentElement!.classList.add('width92vw');
        }

        // 查找以 adsdk 开头的广告元素，隐藏它以及父元素
        const ads = document.querySelectorAll('div[id^="adsdk"]') as NodeListOf<HTMLElement>;
        ads.forEach((ad) => {
            ad.style.display = 'none';
            ad.parentElement!.style.display = 'none';
        });
    }
}

export const _debounce_findSpecialEl = debounce(findSpecialEl, 500);
export const _throttle_findSpecialEl = throttle(findSpecialEl, 500);

function replace(img: HTMLImageElement) {
    if (!img.src || img.dataset.index) {
        return;
    }
    const src = img.src;
    // 排除不需要替换的图片
    if (!src.endsWith('square1200.jpg') && !src.endsWith('custom1200.jpg')) {
        // 排行榜页面里的图片 URL 后缀不一样，需要特别处理
        if (getPageType() === PageName.ArtworkRanking) {
            // 旧版排行榜页面的图片 URL 如下：
            // 'https://i.pximg.net/c/240x480/img-master/img/2022/08/01/17/59/39/100156836_p0_master1200.jpg'
            // 新版排行榜页面的图片 URL 如下，最大尺寸是 480 px：
            // https://i.pximg.net/c/480x960/img-master/img/2025/11/01/00/00/22/136937607_p0_master1200.jpg
            if (!src.includes('240x480') && !src.includes('480x960')) {
                return;
            }
        } else {
            return;
        }
    }

    // 替换 src
    img.src = convertThumbURLTo540px(src);
    img.style.objectFit = 'contain';
}

export function replaceAllImage() {
    const allImage = document.body.querySelectorAll('img');
    allImage.forEach((img) => replace(img));
}

export const _debounce_replaceAllImage = debounce(replaceAllImage, 500);
export const _throttle_replaceAllImage = throttle(replaceAllImage, 500);
