class ApiNoticias{
    constructor(url = "https://newsapi.org/v2/top-headlines?country=co&pageSize=5"){ //Organice la url de tal manera que sacara las noticias de Colombia y solo mande 5
        this.url = url;
    }
    getNoticias() {
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
// ===== TEST =====
async function probar(){
    const api = new ApiNoticias();

    try{
        const noticias = await api.getNoticias();

        console.log("✅ Noticias obtenidas:\n");

        noticias.articles.forEach((noticia, i) => {
            console.log(`📰 ${i + 1}. ${noticia.title}`);
            console.log(`Fuente: ${noticia.source.name}`);
            console.log(`URL: ${noticia.url}`);
            console.log("-------------------------");
        });

    }catch(error){
        console.error("❌ Error:", error);
    }
}

probar();