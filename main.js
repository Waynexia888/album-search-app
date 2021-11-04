// -----------------------------------View--------------------------------------
const View = (() => {
    const domString = {
        albumContainer: '.main',
        searchResultInfo: '.search__result__info',
        albumContentList: '.album__content__list',
        searchInput: '.album__header__input',
        paginationDiv: '.pagination',
        paginationBtn: '.pagination__btn',
        albumLink: '.album__link',

    }

    const render = (template, element) => {
        // element.innerHTML = "";
        element.innerHTML = template;
    }

    const generateAlbumItem = (album) => {
        // let collection = album.collectionName.length > 30 ? album.collectionName.substring(0, 30) : album.collectionName;
        return `<li class="album__content__list-item"><img src="${album.artworkUrl100}" class="album__list__image">
                    <p><a target="_blank" class="album__link" href="https://www.google.com/">${album.collectionName}</a></p>
                </li>`;
    }


    const generatePaginationButton = (number) => {
        return `<button type="button" class="pagination__btn" data-goto="${number}">${number}</button>`;
        // return `<button type="button" class="pagination__btn" data-goto="${number - 1}">Prev Page</button>
        //         <button type="button" class="pagination__btn" data-goto="${number + 1}">Next Page</button>`;
        
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
                    <div class="pagination">
                        
                    </div>
                </section>`
    }

    return {
        domString,
        render,
        generateAlbumItem,
        initialTemplate,
        generateSearchResultTemplate,
        generatePaginationButton,
    }
})();
// -----------------------------------View End--------------------------------------

// -----------------------------------Model--------------------------------------
const Model = (() => {
    const getAlbums = (name) => {
        return fetch(`https://itunes.apple.com/search?term=${name}&media=music&entity=album&attribute=artistTerm&limit=200`)
            .then(response => response.json())
    }

    return {
        getAlbums,
        resultsPerPage: 20,
        page: 1,
    }
})();
// -----------------------------------Model End--------------------------------------


// -------------------------------controller------------------------------------------
const AppController = ((model, view) => {
    const init = () => {
        const initTemplate = view.initialTemplate();
        const initElement = document.querySelector(view.domString.albumContainer);
        view.render(initTemplate, initElement);
        paginationEvent();
        setupEvent();
    }

    let albums = [];
    const updateAndRenderAlbums = (name) => {
        model.getAlbums(name).then(data => { // data is object
            let resultCount = data.resultCount;
            albums = data.results; // array of object
            updateSearchResultCount(resultCount, name);
            updateAlbumList(albums, model.page);

            albums.forEach(album => {
                let artistViewUrl = album.artistViewUrl;
                return updateAlbumLink(artistViewUrl);
            })

            let numPages = Math.ceil(resultCount / Model.resultsPerPage);
            renderButton(numPages);
        })
    }

    const updateAlbumLink = (url) => {
        const albumLinkAll = document.querySelectorAll(view.domString.albumLink);
        albumLinkAll.forEach(
            albumLink => albumLink.addEventListener('click', () => {
                albumLink.setAttribute("href", url);
            })
        )
    }

    const updateSearchResultCount = (resultCount, name) => {
        const initSearchTemplate = View.generateSearchResultTemplate(resultCount, name);
        const initSearchElement = document.querySelector(View.domString.searchResultInfo);
        View.render(initSearchTemplate, initSearchElement);
    }

    const updateAlbumList = (albums, page) => {
        const albumContentListElement = document.querySelector(View.domString.albumContentList);
        let albumContentListArray = albums
            .map(album => View.generateAlbumItem(album));
        // .join("");
        let albumContentListArr = getSearchResultsPage(albumContentListArray, page);
        let albumContentListTemplate = albumContentListArr.join("")
        View.render(albumContentListTemplate, albumContentListElement);
    }

    const getSearchResultsPage = (arr, page = 1) => {
        model.page = page;
        const start = (page - 1) * model.resultsPerPage; // 0
        const end = page * model.resultsPerPage; // 10
        return arr.slice(start, end);
    }

    const renderButton = (numPages) => {
        let arr = [];
        for (let i = 1; i < numPages + 1; i++) {
            arr.push(view.generatePaginationButton(i));
        }
        let buttonTemplate = arr.join("");
        let buttonElement = document.querySelector(view.domString.paginationDiv);
        view.render(buttonTemplate, buttonElement);
    }

    const paginationEvent = () => {
        const btn = document.querySelector(view.domString.paginationDiv);
        btn.addEventListener('click', (e) => {
            const b = e.target.closest(view.domString.paginationBtn);
            const gotoPage = b.dataset.goto;
            // console.log(gotoPage);
            updateAlbumList(albums, gotoPage);
        })


    }

    const setupEvent = () => {
        const searchInput = document.querySelector(view.domString.searchInput);
        searchInput.addEventListener("keyup", (event) => {
            // console.log(event.target.value)
            searchInput.value = event.target.value;
            if (event.key === "Enter") {
                let name = searchInput.value;
                updateAndRenderAlbums(name);
                // renderButton(view.pageCount(name));
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