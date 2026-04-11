class Noticias {
    constructor(
        title = "",
        description = "",
        url = "",
        urlToImage = "",
        publishedAt = null,
    ) {
        this.title = title;
        this.description = description;
        this.url = url;
        this.urlToImage = urlToImage;
        this.publishedAt = publishedAt;
    }
}