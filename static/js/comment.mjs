// for Somnia/layouts/partials/comment/mastodon.html 不用可删
// 其他评论系统可以参考这个组件的写法 Hugo 相关目录覆盖该文件
export function mastodonCommentComponent() {
    return {
        info: "",
        url: "",
        status: {
            content: "",
            account: {
                display_name: "",
                url: "",
            },
            replies_count: 0,
            reblogs_count: 0,
            favourites_count: 0,
        },
        replies: [],
        async initMastodonCommentComponent(url, id) {
            this.url = url;
            const api = `https://${url.split("/")[2]}/api/v1/statuses/${url.split("/")[4]}`;
            this.fetchStatus(api);
        },
        async fetchStatus(url) {
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    this.status = data;
                    if (this.status.replies_count > 0) {
                        this.fetchReplies(url + "/context");
                    }
                })
                .catch((error) => this.info = error);
        },
        async fetchReplies(url) {
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    this.replies = data.descendants;
                })
                .catch((error) => this.info = error);
        },
        sanitizeHTML(html) {
            // 移除不安全的标签
            html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

            // 移除不安全的属性
            html = html.replace(/javascript:/gi, '');

            return html;
        }
    }
}