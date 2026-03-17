class ApiNoticias{
    constructor(url = "https://newsapi.org/v2/top-headlines?language=en&pageSize=10"){ //Organice la url de tal manera que sacara las noticias de Colombia y solo mande 5
        this.url = url;
    }
    getNoticias(){
        return {
            articles:[
    {
        "source": {
            "id": "the-washington-post",
            "name": "The Washington Post"
        },
        "author": "Rachel Chason, Heba Farouk Mahfouz",
        "title": "Drone hits Dubai airport as Iran targets commerce; Israel says war will go on - The Washington Post",
        "description": "As Tehran continued strikes on targets across the Gulf region, Israel said it would hit Iran for “as long as needed” and expanded ground operations in Lebanon.",
        "url": "https://www.washingtonpost.com/world/2026/03/16/dubai-airport-drone-strike-iran/",
        "urlToImage": "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://cloudfront-us-east-1.images.arcpublishing.com/wapo/RRJNUSJUZKFGEMQULZW2X5IGOQ.JPG&w=1440",
        "publishedAt": "2026-03-16T12:41:40Z",
        "content": "DUBAI An Iranian drone attack ignited a fuel tank at Dubai International Airport early Monday, authorities said, as Tehran continued to strike civilian infrastructure across the Persian Gulf and Isra… [+134 chars]"
    },
    {
        "source": {
            "id": null,
            "name": "Yahoo Entertainment"
        },
        "author": "Yahoo News Staff",
        "title": "Oscars 2026 winners and recap: 'One Battle After Another' named Best Picture; Jessie Buckley and Michael B. Jordan take home acting awards - Yahoo",
        "description": "Paul Thomas Anderson's \"One Battle After Another\" took home six awards on Sunday.",
        "url": "https://www.yahoo.com/entertainment/movies/live/oscars-2026-winners-and-recap-one-battle-after-another-named-best-picture-jessie-buckley-and-michael-b-jordan-take-home-acting-awards-140057491.html",
        "urlToImage": "https://s.yimg.com/ny/api/res/1.2/yWuFi_khA2BSiBMYtnt6eA--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD02NzU7Y2Y9d2VicA--/https://s.yimg.com/os/creatr-uploaded-images/2026-03/2791cb80-20e2-11f1-abfb-770ddf7fd1c2",
        "publishedAt": "2026-03-16T12:33:28Z",
        "content": "It was One Battle After Anothers night. Paul Thomas Andersons action-thriller took home six Oscars at the 98th Academy Awards on Sunday, including Best Supporting Actor, Best Directing and Best Pictu… [+1167 chars]"
    },
    {
        "source": {
            "id": "the-washington-post",
            "name": "The Washington Post"
        },
        "author": "Jason Samenow",
        "title": "CWG Live: Severe storm threat today with possible tornadoes, then sharply colder - The Washington Post",
        "description": "The most intense storms could produce wind gusts of 60 to 80 mph and/or tornadoes.",
        "url": "https://www.washingtonpost.com/weather/2026/03/16/dc-weather-live-updates-severe-storms-tornadoes/",
        "urlToImage": "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/Z6YL2F43WBGZTKPCKBAGVLXVF4.png&w=1440",
        "publishedAt": "2026-03-16T12:06:39Z",
        "content": "Welcome to cwg.live, updated around-the-clock by Capital Weather Gang meteorologists."
    },
    {
        "source": {
            "id": "associated-press",
            "name": "Associated Press"
        },
        "author": "Will Weissert",
        "title": "Trump suggests he may delay China trip, but Bessent says it's not to pressure on Strait of Hormuz - AP News",
        "description": "President Donald Trump may delay his China trip due to the Iran war, but Treasury Secretary Scott Bessent says it’s not to pressure Beijing on the Strait of Hormuz. Bessent said Monday, “If the meeting for some reason was rescheduled, it would be rescheduled …",
        "url": "https://apnews.com/article/trump-china-iran-strait-hormuz-7ce3b6cd9ca6bd222dfe3236e10f8266",
        "urlToImage": "https://dims.apnews.com/dims4/default/a755436/2147483647/strip/true/crop/6000x3998+0+1/resize/980x653!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2F29%2F85%2F54984c0443b4f05e8f89974e102f%2F240632d47a624031ad817cba0682bf1b",
        "publishedAt": "2026-03-16T12:04:00Z",
        "content": "WASHINGTON (AP) President Donald Trump may delay his China trip due to the Iran war, but Treasury Secretary Scott Bessent said Monday its not to pressure Beijing on the Strait of Hormuz.\r\nBessent sai… [+4046 chars]"
    },
    {
        "source": {
            "id": null,
            "name": "DW (English)"
        },
        "author": "Wesley Dockery, Farid Zuchrinata, Dmytro Hubenko, Shakeel Sobhan",
        "title": "Iran war: Trump dials up the pressure to secure Hormuz - DW.com",
        "description": "President Donald Trump warned NATO of a 'very bad' future if allies didn't exert more pressure to reopen the waterway. Plus, Dubai Airport has temporarily suspended flights after a drone incident near its airfield.",
        "url": "https://www.dw.com/en/iran-war-trump-dials-up-the-pressure-to-secure-hormuz/live-76369891",
        "urlToImage": "https://static.dw.com/image/76373524_6.jpg",
        "publishedAt": "2026-03-16T11:51:20Z",
        "content": "Germany does not see a role for NATO in addressing the blockade of the Strait of Hormuz, German Foreign Minister Johann Wadephul said in Brussels.\r\n\"I don't see that NATO has made any decision in thi… [+1113 chars]"
    }
]
        }
    }
    getNoticiasAPI() {
        return fetch(this.url, {
            method: "GET",
            headers: { "X-Api-Key": "f7e37d4286734f7591efda2dfaddeba2"
            },
        }).then(function (res) {
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`); //Esto nos permitirá ver cuál fue el error que se generó con la solicitud
            }
            return res.json();
        });
    }
}