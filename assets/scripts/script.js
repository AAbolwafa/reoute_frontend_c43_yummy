const sideNavbar = $('.side-navbar');
const navLinkItems = $('.nav-links .links .link-item');
const navLinks = $('.nav-links .links .link-item a');
const toggleNavbarBtn = $('.side-navbar .toggle-navbar');
let currentLinkTarget = '';

const openNavbar = () => {
    sideNavbar.animate({ left: '0px' }, 300);
    toggleNavbarBtn.find('i').removeClass('fa-align-justify').addClass('fa-x');
    for (let i = 0; i < navLinkItems.length; i++) {
        navLinkItems.eq(i).animate({ top: '0px', opacity: 1 }, (i + 5) * 100);
    }
};

const closeNavbar = () => {
    const linksAreaWidth = $('.side-navbar .links-area').outerWidth();
    sideNavbar.animate({ left: `${-linksAreaWidth}px` }, 600);
    toggleNavbarBtn.find('i').removeClass('fa-x').addClass('fa-align-justify');
    navLinkItems.animate({ top: '1rem', opacity: 0 }, 300);
};

const toggleNavbar = () => {
    if (sideNavbar.css('left') === '0px') {
        closeNavbar();
    } else {
        openNavbar();
    }
};

toggleNavbarBtn.on('click', toggleNavbar);
setTimeout(() => {
    toggleNavbar();
}, 500);

// Close navbar by clicking outside
$(window).on('resize click', closeNavbar);
sideNavbar.on('click', (e) => {
    e.stopPropagation();
});

// Handle navbar links
navLinks.on('click', (e) => {
    e.preventDefault();
    const target = e.target.dataset.target;
    currentLinkTarget = target;
    if (target !== 'contact') {
        getData(renderOthers, target, 'list', 'list');
    }
});

// Data Service
const getData = async (func = () => {}, param = 's', value = '', page = 'search') => {
    let data = [];
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/${page}.php?${param}=${value}`, {
        method: 'GET',
    });
    if (response.ok) {
        data = await response.json();
        if (data.meals) {
            if (page === 'lookup') {
                func(data.meals[0]);
            } else {
                func(data.meals.slice(0, 20));
            }
        } else {
            renderAlert('warning', 'No data found');
        }
    } else {
        renderAlert('danger', response.statusText || 'Something went wrong');
    }
};

// Handle Search
const inputSearch = $('.search input');
let searchTimer = null;

inputSearch.on('keyup', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        getData(renderMeals, e.target.value.length === 1 ? 'f' : 's', e.target.value);
    }, 1000);
});

// Render Meals
const handleMealDetails = () => {
    $('.meal-card .btn').on('click', (e) => {
        getData(renderMealDetails, 'i', e.target.dataset.mealId, 'lookup');
    });
};

const viewRow = $('.view .row');
const renderMeals = (arr) => {
    let html = '';

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const descHtml = item.strInstructions
            ? `<p class="card-text">${item.strInstructions?.split(' ').slice(0, 20).join(' ')}...</p>`
            : '';
        html += `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="meal-card card text-bg-secondary h-100">
                <img src="${item.strMealThumb}" class="card-img-top" alt="${item.strMeal}">
                <div class="card-body d-flex flex-column row-gap-2">
                    <h5 class="card-title">${item.strMeal}</h5>
                    ${descHtml}
                    <button href="#" class="btn btn-dark mt-auto" data-meal-id="${item.idMeal}">View Details</button>
                </div>
            </div>
        </div>
        `;
    }

    viewRow.html(html);
    handleMealDetails();
};

// Render Meal Details
const renderMealDetails = (item) => {
    console.log(item);
    let ingredientsHtml = '';
    const ingredientKeys = Object.keys(item).filter((i) => i.includes('strIngredient'));
    const measureKeys = Object.keys(item).filter((i) => i.includes('strMeasure'));
    for (let i = 0; i < ingredientKeys.length; i++) {
        if (item[ingredientKeys[i]] && item[measureKeys[i]]) {
            ingredientsHtml += `<span class="badge d-inline-block text-bg-secondary fs-6">${item[measureKeys[i]]} ${
                item[ingredientKeys[i]]
            }</span>`;
        }
    }

    let tagsHtml = '';
    const tags = item.strTags?.split(',');
    for (let i = 0; i < tags?.length; i++) {
        tagsHtml += `<span class="badge d-inline-block text-bg-secondary fs-6">${tags[i]}</span>`;
    }

    const sourceHtml =
        item.strSource &&
        `<a href="${item.strSource}" target="_blank" class="btn btn-primary"><i class="fa-solid fa-globe me-1"></i> Source</a>`;

    const html = `
    <div class="col">
        <div class="card text-bg-secondary bg-transparent">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${item.strMealThumb}" class="img-fluid rounded" alt="${item.strMeal}">
                </div>
                <div class="col-md-8">
                    <div class="card-body pt-0">
                        <h5 class="card-title">${item.strMeal}</h5>
                        <p class="card-text">${item.strInstructions}</p>
                        <h5 class="card-title">Area: <span class="fw-normal">${item.strArea}</span></h5>
                        <h5 class="card-title">Category: <span class="fw-normal">${item.strCategory}</span></h5>

                        <hr />
                        <h5 class="card-title">Recipes:</h5>
                        <div class="d-flex flex-wrap gap-2">${ingredientsHtml || 'Nothing to show'}</div>

                        <hr />
                        <h5 class="card-title">Tags:</h5>
                        <div class="d-flex flex-wrap gap-2">${tagsHtml || 'Nothing to show'}</div>

                        <hr />
                        <div class="d-flex flex-wrap gap-2">
                            ${sourceHtml}
                            <a href="${
                                item.strYoutube
                            }" target="_blank" class="btn btn-primary"><i class="fa-brands fa-youtube me-1"></i>Youtube</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    viewRow.html(html);
};

// Render Others
const handleOtherDetails = () => {
    $('.other-card .card-link').on('click', (e) => {
        getData(renderMeals, e.target.dataset.target, e.target.dataset.targetStr, 'filter');
    });
};
const renderOthers = (arr) => {
    let html = '';
    console.log(currentLinkTarget);
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const title = item.strCategory || item.strArea || item.strIngredient;
        let titleIcon;
        if (currentLinkTarget == 'a') {
            titleIcon = 'home';
        } else if (currentLinkTarget == 'i') {
            titleIcon = 'utensils';
        } else {
            titleIcon = 'list';
        }
        const titleIconHtml = `<i class="fa-solid fa-${titleIcon}"></i>`;
        const descHtml =
            item.strDescription &&
            `<p class="card-text">${item.strDescription.split(' ').slice(0, 10).join(' ')}...</p>`;
        html += `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="other-card card text-bg-light h-100">
                <div class="card-body">
                    <h5 class="card-title">${titleIconHtml} ${title}</h5>
                    ${descHtml || ''}
                    <button class="card-link btn btn-sm btn-dark" data-target="${currentLinkTarget}" data-target-str="${title}">View Meals</button>
                </div>
            </div>
        </div>
        `;
    }

    viewRow.html(html);
    handleOtherDetails();
};

// Render Alert
const renderAlert = (className, msg) => {
    const html = `
    <div class="col">
        <div class="alert alert-${className} d-flex align-items-center column-gap-3" role="alert">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div>${msg}</div>
        </div>
    </div>
    `;

    viewRow.html(html);
};

// On init
getData(renderMeals);
