const API_URL = "https://www.themealdb.com/api/json/v1/1";

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
