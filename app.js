// -----------------------------------View--------------------------------------
const View = (() => {
    const domString = {
        albumContainer: '.main',
        searchResultInfo: '.search__result__info',
        albumContentList: '.album__content__list',
        searchInput: '.album__header__input',
    }

    const render = (template, element) => {
        element.innerHTML = template;
    }

    const generateAlbumItem = (album) => {
        // let collection = album.collectionName.length > 30 ? album.collectionName.substring(0, 30) : album.collectionName;
        return `<li class="album__content__list-item"><img src="${album.artworkUrl100}" class="album__list__image">
                <p>${album.collectionName}</p>
            </li>`;
    }

    const generateSearchResultTemplate = (res, name) => {
        return `<p>${res} results for "${name}"</p>`
    }

    const initialTemplate = () => {
        return `<header class="album__header">
                    <input type="text" placeholder="Search ...  " required class="album__header__input" />
                    <i class="fa fa-search search__icon" aria-hidden="true"></i>
                </header>
                <div class="search__result__info">Search Albums by Artist Name:</div>
                <section>
                    <ul class="album__content__list"></ul>
                </section>`
    }

    return {
        domString,
        render,
        generateAlbumItem,
        initialTemplate,
        generateSearchResultTemplate
    }
})();
// -----------------------------------View End--------------------------------------

// -----------------------------------Model--------------------------------------
const Model = (() => {
    const getAlbums = (name) => {
        return fetch(`https://itunes.apple.com/search?term=${name}&media=music&entity=album&attribute=artistTerm&limit=200`)
            .then(response => response.json());
    }

    return {
        getAlbums,
    }
})();
// -----------------------------------Model End--------------------------------------


// -------------------------------controller------------------------------------------
const AppController = ((model, view) => {
    const init = () => {
        const initTemplate = view.initialTemplate();
        const initElement = document.querySelector(view.domString.albumContainer);
        view.render(initTemplate, initElement);
        setupEvent();
    }

    const updateAndRenderAlbums = (name) => {
        model.getAlbums(name).then(data => {
            let resultCount = data.resultCount;
            let albums = data.results;
            updateSearchResultCount(resultCount, name);
            updateAlbumList(albums);
        })
    }

    const updateSearchResultCount = (resultCount, name) => {
        const initSearchTemplate = View.generateSearchResultTemplate(resultCount, name);
        const initSearchElement = document.querySelector(View.domString.searchResultInfo);
        View.render(initSearchTemplate, initSearchElement);
    }

    const updateAlbumList = (albums) => {
        const albumContentListElement = document.querySelector(View.domString.albumContentList);
        let albumContentListTemplate = albums
            .map(album => View.generateAlbumItem(album))
            .join("");

        View.render(albumContentListTemplate, albumContentListElement);
    }

    const setupEvent = () => {
        const searchInput = document.querySelector(view.domString.searchInput);
        searchInput.addEventListener("keyup", (event) => {
            // console.log(event.target.value)
            searchInput.value = event.target.value;
            if (event.key === "Enter") {
                let name = searchInput.value;
                updateAndRenderAlbums(name)
                searchInput.value = "";
            }
        })
    }

    return {
        init,
    }
})(Model, View);

AppController.init();

//---------------------------------Controller End----------------------------------