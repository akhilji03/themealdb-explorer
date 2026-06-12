document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();

    document.getElementById('searchBtn').addEventListener('click', () => {
        const query = document.getElementById('searchInput').value;
        searchMeals(query);
    });

    document.getElementById('randomBtn').addEventListener('click', fetchRandomMeal);
});

async function fetchCategories() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    const container = document.getElementById('categories');

    data.categories.slice(0, 8).forEach(cat => {
        const chip = document.createElement('span');
        chip.className = 'cat-chip';
        chip.innerText = cat.strCategory;
        chip.addEventListener('click', () => {
            document.getElementById('searchInput').value = cat.strCategory;
            searchMeals(cat.strCategory);
        });
        container.appendChild(chip);
    });
}

async function searchMeals(query) {
    const res = await fetch(`/api/search?s=${query}`);
    const data = await res.json();
    displayMeals(data.meals);
}

async function fetchRandomMeal() {
    const res = await fetch('/api/random');
    const data = await res.json();
    displayMeals(data.meals);
}

function displayMeals(meals) {
    const container = document.getElementById('mealContainer');
    container.innerHTML = '';

    if (!meals) {
        container.innerHTML = '<p style="text-align:center;">No recipes found. Try another search!</p>';
        return;
    }

    meals.forEach(meal => {
                const ingredients = [];
                for (let i = 1; i <= 20; i++) {
                    if (meal[`strIngredient${i}`]) {
                        ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`);
            }
        }

        let videoEmbed = '';
        if (meal.strYoutube) {
            const videoId = meal.strYoutube.split('v=')[1];
            videoEmbed = `
                <h3>Video Tutorial</h3>
                <div class="video-container">
                    <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                </div>
            `;
        }

        const mealEl = document.createElement('div');
        mealEl.className = 'meal-card';
        mealEl.innerHTML = `
            <div class="meal-header">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="meal-details">
                    <h2>${meal.strMeal}</h2>
                    <p><strong>Category:</strong> ${meal.strCategory} | <strong>Origin:</strong> ${meal.strArea}</p>
                    <h3>Ingredients</h3>
                    <div class="ingredients-list">
                        ${ingredients.map(ing => `<div>• ${ing}</div>`).join('')}
                    </div>
                </div>
            </div>
            <div class="instructions">
                <h3>Instructions</h3>
                <p>${meal.strInstructions.replace(/\r\n/g, '<br>')}</p>
                ${videoEmbed}
            </div>
        `;
        container.appendChild(mealEl);
    });
}