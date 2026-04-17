/**
 *  LOCATION 路由路径枚举类
 */
const LocationTYPE = Object.freeze({
    Mainpage: '主页',
    Artworks: '作品页',
    Users: '用户主页',
    UsersAll: '用户主页查看全部',
    NewIllust: '已关注用户的作品 全部',
    NewIllustR18: '已关注用户的作品 R-18',
    CollectionRoot: '收藏 插画·漫画 全部 公开',
    CollectionRootHide: '收藏 插画·漫画 全部 不公开',
    CollectionTag: '收藏 插画·漫画 TAG 公开',
    CollectionTagHide: '收藏 插画·漫画 TAG 不公开',
    CollectionUnTaged: '收藏 插画·漫画 未分類 公开',
    CollectionUnTagedHide: '收藏 插画·漫画 未分類 不公开',
    tags: '搜索 标签 顶部',
    tags_artworks: '搜索 默认',
    illustrations: '搜索 插画'
});
const LocationUNIONTYPE = Object.freeze({
    NewIllust: [LocationTYPE.NewIllust, LocationTYPE.NewIllustR18],
    Collection: [
        LocationTYPE.CollectionRoot,
        LocationTYPE.CollectionRootHide,
        LocationTYPE.CollectionTag,
        LocationTYPE.CollectionTagHide,
        LocationTYPE.CollectionUnTaged,
        LocationTYPE.CollectionUnTagedHide
    ],
    CollectionTag: [LocationTYPE.CollectionTag, LocationTYPE.CollectionTagHide],
    CollectionUnHide: [LocationTYPE.CollectionRoot, LocationTYPE.CollectionTag, LocationTYPE.CollectionUnTaged],
    CollectionHide: [LocationTYPE.CollectionRootHide, LocationTYPE.CollectionTagHide, LocationTYPE.CollectionUnTagedHide],
    CollectionUnTaged: [LocationTYPE.CollectionUnTaged, LocationTYPE.CollectionUnTagedHide],
    CollectionTaged: [LocationTYPE.CollectionTag, LocationTYPE.CollectionTagHide],
    Search: [LocationTYPE.tags, LocationTYPE.tags_artworks, LocationTYPE.illustrations],
    Users: [LocationTYPE.Users, LocationTYPE.UsersAll]
});
/**
 *  LOCATION 路由路径枚举类与链接正则的映射
 */
const locationMap = {
    [LocationTYPE.NewIllust]: [/^\/bookmark_new_illust.php/],
    [LocationTYPE.NewIllustR18]: [/^\/bookmark_new_illust_r18.php/],
    [LocationTYPE.Mainpage]: [/^\/$/],
    [LocationTYPE.Artworks]: [/^\/artworks\/\d+$/],
    [LocationTYPE.Users]: [/^\/users\/\d+$/],
    [LocationTYPE.UsersAll]: [/^\/users\/\d+\/artworks$/],

    [LocationTYPE.CollectionRoot]: [/^\/users\/\d+\/bookmarks\/artworks(\?p=\d+?)?$/],
    [LocationTYPE.CollectionRootHide]: [/^\/users\/\d+\/bookmarks\/artworks\?(p=\d+\&)?(rest=hide)$/],
    [LocationTYPE.CollectionUnTaged]: [/^\/users\/\d+\/bookmarks\/artworks\/未分類(?:\?(?:p=\d+|rest=show&mode=all))?$/],
    [LocationTYPE.CollectionUnTagedHide]: [/^\/users\/\d+\/bookmarks\/artworks\/未分類\?(p=\d+\&)?(rest=hide)$/],
    [LocationTYPE.CollectionTag]: [
        /^\/users\/\d+\/bookmarks\/artworks\/(?!未分類(?:\?|$))[^\/\?]+(?:\?(?:p=\d+(?:&rest=show(?:&mode=all)?)?|rest=show(?:&mode=all)?))?$/
    ],
    [LocationTYPE.CollectionTagHide]: [/^\/users\/\d+\/bookmarks\/artworks\/[^\/(未分類)]+\?(p=\d+\&)?rest=hide$/],
    [LocationTYPE.tags]: [/^\/tags\/[^\/]+$/],
    [LocationTYPE.tags_artworks]: [/^\/tags\/[^\/]+\/artworks/],
    [LocationTYPE.illustrations]: [/^\/tags\/[^\/]+\/illustrations/]
};

const check = (path) => {
    for (const [key, value] of Object.entries(locationMap)) {
        for (const element of value) {
            if (element.test(path)) {
                return key;
            }
        }
    }
};

function test() {
    const test_data = {
        [LocationTYPE.NewIllust]: ['/bookmark_new_illust.php', '/bookmark_new_illust.php?p=2', '/bookmark_new_illust.php?p=10'],
        [LocationTYPE.NewIllustR18]: ['/bookmark_new_illust_r18.php', '/bookmark_new_illust_r18.php?p=2', '/bookmark_new_illust_r18.php?p=10'],
        [LocationTYPE.Mainpage]: ['/'],
        [LocationTYPE.Artworks]: ['/artworks/118646537'],
        [LocationTYPE.Users]: ['/users/69600480'],
        [LocationTYPE.UsersAll]: ['/users/87595559/artworks'],
        [LocationTYPE.CollectionRoot]: ['/users/57540329/bookmarks/artworks', '/users/57540329/bookmarks/artworks?p=2', '/users/57540329/bookmarks/artworks?p=10'],
        [LocationTYPE.CollectionRootHide]: ['/users/57540329/bookmarks/artworks?rest=hide', '/users/57540329/bookmarks/artworks?p=2&rest=hide', '/users/57540329/bookmarks/artworks?p=10&rest=hide'],
        [LocationTYPE.CollectionTag]: ['/users/57540329/bookmarks/artworks/123123',
            '/users/57540329/bookmarks/artworks/123123?p=2',
            '/users/57540329/bookmarks/artworks/123123?p=10',
            '/users/57540329/bookmarks/artworks/20260412?p=2&rest=show',
            '/users/57540329/bookmarks/artworks/20260412?rest=show&mode=all'
        ],
        [LocationTYPE.CollectionTagHide]: [
            '/users/57540329/bookmarks/artworks/2023ood?rest=hide',
            '/users/57540329/bookmarks/artworks/2023ood?p=3&rest=hide',
            '/users/57540329/bookmarks/artworks/2023ood?p=10&rest=hide'
        ],
        [LocationTYPE.CollectionUnTaged]: ['/users/65540505/bookmarks/artworks/未分類',
            '/users/65540505/bookmarks/artworks/未分類?p=2', '/users/65540505/bookmarks/artworks/未分類?rest=show&mode=all'],
        [LocationTYPE.CollectionUnTagedHide]: ['/users/65540505/bookmarks/artworks/未分類?rest=hide', '/users/65540505/bookmarks/artworks/未分類?p=2&rest=hide'],
        [LocationTYPE.CollectionTag]: [],
        [LocationTYPE.CollectionTagHide]: [],
        [LocationTYPE.tags]: ['/tags/ブリジット(ギルティギア)', '/tags/ギルティギアストライヴ'],
        [LocationTYPE.tags_artworks]: ['/tags/極上の女体/artworks', '/tags/極上の女体/artworks?order=popular_d&p=6', '/tags/極上の女体/artworks?order=popular_d&p=10'],
        [LocationTYPE.illustrations]: [
            '/tags/原神/illustrations',
            '/tags/原神/illustrations?order=date',
            '/tags/原神/illustrations?order=date&mode=r18&p=6',
            '/tags/原神/illustrations?order=popular_d&mode=safe&p=20'
        ]
    };
    for (const [key, value] of Object.entries(test_data)) {
        for (const item of value) {
            if (check(item) != key) {
                console.log(key, item, '未通过', check(item));
            }
        }
    }
    console.log('URL匹配测试完成');
}
test();
export { LocationTYPE, LocationUNIONTYPE, locationMap, check };
