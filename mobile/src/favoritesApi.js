const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL?.replace(/\/$/, "");

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, options);
  } catch {
    throw new Error(
      "Could not connect to favorites. Check that the backend is running and you are on the same Wi-Fi.",
    );
  }
  if (response.status === 204) return;
  return response.json();
}

export async function getFavorites() {
  const favorites = await request("/favorites");
  return favorites;
}

export function saveFavorite(meal) {
  return request("/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mealId: meal.idMeal,
      name: meal.strMeal,
      image: meal.strMealThumb,
    }),
  });
}

export function deleteFavorite(mealId) {
  return request(`/favorites/${encodeURIComponent(mealId)}`, {
    method: "DELETE",
  });
}
