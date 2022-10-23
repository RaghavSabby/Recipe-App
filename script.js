const favMealContainer = document.querySelector(".fav-meal-list");
const randomMealContainer = document.querySelector(".meal-of-the-day-container");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.querySelector(".meal-info");
const popupCloseBtn = document.getElementById("close-popup");

const searchTerm = document.querySelector("#search-term");
const searchBtn = document.querySelector("#search");

getRandomMealOfTheDay();
fetchFavMeal();

// Getting Random Meal of the Day
async function getRandomMealOfTheDay() {
    const repsonse = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const result = await repsonse.json();
    const randomMeal = result.meals[0];
    console.log(randomMeal);

    addMealOfTheDay(randomMeal, true);
}

// Getting Meal by Id
async function getMealById(id) {
    const repsonse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const result = await repsonse.json();
    const mealById = result.meals[0]
    console.log(mealById);
    return mealById;
}

// Getting Meal from Search
async function getMealBySearch(search) {
    const repsonse = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`);
    const result = await repsonse.json();
    const meals = result.meals;
    console.log(meals);
    return meals;
}

// Adding the Random Meal of the Day
function addMealOfTheDay(mealData, random = false) {

    const meal = document.createElement("section");

    meal.innerHTML = `<section class="meal-of-the-day-tag">
                        ${random ? `<h4>Meal Of The Day</h4>` : ""}
                    </section>
                    <section class="meal-of-the-day-image">
                        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                    </section>
                    <section class="meal-name-and-heart">
                        <h4>${mealData.strMeal}</h4>
                        <p class="heart-icon"><i class="fa-solid fa-heart"></i></p>
                    </section>`;
    
    const heartBtn = meal.querySelector(".heart-icon");
    heartBtn.addEventListener("click", () => {
        if (heartBtn.classList.contains("active")) {
            removeMealLS(mealData.idMeal);
            heartBtn.classList.remove("active");
        } else {
            addMealLS(mealData.idMeal);
            heartBtn.classList.add("active");
        }

        fetchFavMeal();
    });

    const mealImage = meal.querySelector(".meal-of-the-day-image");
    mealImage.addEventListener("click", () => {
        showMealInfo(mealData);
    })

    randomMealContainer.appendChild(meal);
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();

    // converts JS object to JSON string
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    // converts JS object to JSON string
    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

// Getting meal ids from the local storage
function getMealsLS() {
    // conversts JSON string ==> JS object
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

// Adding meals to favourite meal section
function addMealFav(mealData) {

    const favMealListItem = document.createElement("li");
    favMealListItem.innerHTML = `<img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="fav-meal-image">
    <p class="fav-meal-name" title="${mealData.strMeal}">${mealData.strMeal}</p>
    <button class="clear-btn"><i class="fa-solid fa-xmark"></i></button>`;

    const clearBtn = favMealListItem.querySelector(".clear-btn");
    clearBtn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);
        fetchFavMeal();
    });

    const favMealImage = favMealListItem.querySelector(".fav-meal-image");
    favMealImage.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    favMealContainer.appendChild(favMealListItem);

}

function showMealInfo(mealData) {
    // clean it up
    mealInfoEl.innerHTML = "";

    // update the Meal info
    const mealEl = document.createElement("div");

    const ingredients = [];

    // get ingredients and measures
    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient" + i]) {
            ingredients.push(
                `${mealData["strIngredient" + i]} - ${
                    mealData["strMeasure" + i]
                }`
            );
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        />
        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `;

    mealInfoEl.appendChild(mealEl);

    // show the popup
    mealPopup.classList.remove("hidden");
}

async function fetchFavMeal() {

    favMealContainer.innerHTML = "";
    const mealIds = getMealsLS();
    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        let meal = await getMealById(mealId);
        addMealFav(meal);
    }

}

searchBtn.addEventListener("click", async () => {

    randomMealContainer.innerHTML = "";
    const search = searchTerm.value;
    const meals = await getMealBySearch(search);

    if (meals) {
        meals.forEach((meal) => {
            addMealOfTheDay(meal);
        });
    }
})


popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
})