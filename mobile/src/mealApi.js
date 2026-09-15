const API_URL = "https://www.themealdb.com/api/json/v1/1";

// get ingredients and instructions using the recipe id
export async function getMealById(mealId) {
  const response = await fetch(
    `${API_URL}/lookup.php?i=${encodeURIComponent(mealId)}`,
  );
  const data = await response.json();
  return data.meals[0];
}

export async function searchByIngredient(ingredient) {
  const query = ingredient.trim().toLowerCase().replace(/\s+/g, "_");
  const response = await fetch(
    `${API_URL}/filter.php?i=${encodeURIComponent(query)}`,
  );
  if (!response.ok)
    throw new Error("Recipe search is unavailable. Please try again.");
  const data = await response.json();
  if (data.meals === null) return [];
  return data.meals;
}
