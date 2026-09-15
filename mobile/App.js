import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getMealById, searchByIngredient } from "./src/mealApi";

const Stack = createNativeStackNavigator();

// shows the photo and name for a recipe
function RecipeCard({ meal, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View recipe for ${meal.strMeal}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.dimmed]}
    >
      <Image
        source={{ uri: meal.strMealThumb }}
        style={styles.image}
        accessibilityLabel={meal.strMeal}
      />
      <Text style={styles.recipeName}>{meal.strMeal}</Text>
    </Pressable>
  );
}

function RecipeFinder({ navigation }) {
  const [ingredient, setIngredient] = useState("");
  const [searchedIngredient, setSearchedIngredient] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(value = ingredient) {
    // wait for the current search to finish
    if (loading) return;
    const query = value.trim();
    Keyboard.dismiss();
    setIngredient(query);
    setSearchedIngredient(query);
    // clear the old results and error before searching
    setMeals([]);
    setError("");
    setLoading(true);
    try {
      // get matching recipes from mealdb api
      const results = await searchByIngredient(query);
      setMeals(results);
    } catch {
      setError(
        "Could not load recipes. Check your internet connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={meals}
          keyExtractor={(meal) => meal.idMeal}
          renderItem={({ item }) => (
            <RecipeCard
              meal={item}
              onPress={() =>
                navigation.navigate("RecipeDetails", { mealId: item.idMeal })
              }
            />
          )}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            <View>
              <Text style={styles.eyebrow}>LET’S GET COOKING</Text>
              <Text style={styles.title}>Recipe Finder</Text>
              <View style={styles.searchBox}>
                <Text style={styles.label}>What’s in your kitchen?</Text>
                <TextInput
                  style={styles.input}
                  value={ingredient}
                  onChangeText={setIngredient}
                  placeholder="Enter an ingredient, e.g. chicken"
                  placeholderTextColor="#747A70"
                  accessibilityLabel="Main ingredient"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={80}
                  returnKeyType="search"
                  onSubmitEditing={() => search()}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={!ingredient.trim() || loading}
                  onPress={() => search()}
                  style={({ pressed }) => [
                    styles.button,
                    (!ingredient.trim() || loading || pressed) && styles.dimmed,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Searching…" : "Find recipes"}
                  </Text>
                </Pressable>
              </View>
              {!!meals.length && (
                <Text style={styles.resultsHeading}>
                  {meals.length} {meals.length === 1 ? "recipe" : "recipes"}{" "}
                  with {searchedIngredient}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            // show a loading message, error, or try again if no results
            <View style={styles.empty} accessibilityLiveRegion="polite">
              {loading ? (
                <>
                  <ActivityIndicator size="large" color="#315B3D" />
                  <Text style={styles.emptyText}>Searching recipes…</Text>
                </>
              ) : error ? (
                <>
                  <Text accessibilityRole="alert" style={styles.error}>
                    {error}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => search(searchedIngredient)}
                    style={styles.retry}
                  >
                    <Text style={styles.retryText}>Try again</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.emptyTitle}>
                    {searchedIngredient
                      ? "No recipes found"
                      : "Dinner starts here"}
                  </Text>
                  <Text style={styles.emptyText}>
                    {searchedIngredient
                      ? `No matches for “${searchedIngredient}”. Try one ingredient such as chicken or potato.`
                      : "Search one main ingredient to find your next meal."}
                  </Text>
                </>
              )}
            </View>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RecipeDetails({ route }) {
  const { mealId } = route.params;
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // load the full recipe when this screen opens
  useEffect(() => {
    loadRecipe();
  }, [mealId]);

  async function loadRecipe() {
    setLoading(true);
    setError("");
    setMeal(null);
    try {
      const result = await getMealById(mealId);
      setMeal(result);
    } catch (error) {
      setError(
        error.message || "Could not load this recipe. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  // mealdb numbers the ingredient and measurement fields from 1 to 20
  const ingredients = [];
  if (meal) {
    for (let i = 1; i <= 20; i++) {
      const name = meal[`strIngredient${i}`]?.trim();
      const measure = meal[`strMeasure${i}`]?.trim();
      if (name)
        ingredients.push({
          id: i,
          text: [measure, name].filter(Boolean).join(" "),
        });
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#315B3D" />
          <Text style={styles.emptyText}>Loading recipe…</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
          <Pressable
            style={styles.retry}
            accessibilityRole="button"
            onPress={loadRecipe}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        meal && (
          <ScrollView contentContainerStyle={styles.content}>
            <Image
              source={{ uri: meal.strMealThumb }}
              style={styles.detailImage}
              accessibilityLabel={meal.strMeal}
            />
            <Text style={styles.title}>{meal.strMeal}</Text>
            <Text style={styles.resultsHeading}>Ingredients</Text>
            {ingredients.length ? (
              ingredients.map((ingredient) => (
                <Text key={ingredient.id} style={styles.ingredient}>
                  • {ingredient.text}
                </Text>
              ))
            ) : (
              <Text style={styles.instructions}>No ingredients provided.</Text>
            )}
            <Text style={styles.resultsHeading}>Instructions</Text>
            <Text style={styles.instructions}>
              {meal.strInstructions?.trim()}
            </Text>
          </ScrollView>
        )
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#F8F6EF" },
            headerTintColor: "#243D2B",
            contentStyle: { backgroundColor: "#F8F6EF" },
          }}
        >
          <Stack.Screen
            name="Search"
            component={RecipeFinder}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RecipeDetails"
            component={RecipeDetails}
            options={{ title: "Recipe details" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  detailImage: {
    width: "100%",
    aspectRatio: 1.3,
    borderRadius: 18,
    marginBottom: 12,
  },
  ingredient: {
    color: "#243D2B",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  instructions: { color: "#243D2B", fontSize: 16, lineHeight: 26 },
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: "#F8F6EF" },
  content: { padding: 22, paddingBottom: 32 },
  eyebrow: {
    color: "#567047",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 14,
  },
  title: { color: "#243D2B", fontSize: 36, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#65695F", fontSize: 16, marginTop: 8, marginBottom: 26 },
  searchBox: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7DD",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#243D2B",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#C9CFC2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: "#243D2B",
    backgroundColor: "#FAFBF7",
  },
  button: {
    backgroundColor: "#315B3D",
    borderRadius: 12,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    marginTop: 12,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  dimmed: { opacity: 0.5 },
  retryText: { color: "#315B3D", fontSize: 14, fontWeight: "600" },
  resultsHeading: {
    color: "#243D2B",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7DD",
  },
  image: { width: "100%", aspectRatio: 1.6, backgroundColor: "#E8ECDF" },
  recipeName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#243D2B",
    padding: 18,
  },
  empty: { alignItems: "center", paddingVertical: 38, paddingHorizontal: 12 },
  emptyTitle: { fontSize: 22, fontWeight: "600", color: "#243D2B" },
  emptyText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#65695F",
    textAlign: "center",
    marginTop: 12,
  },
  error: {
    fontSize: 16,
    lineHeight: 24,
    color: "#9A352C",
    textAlign: "center",
  },
  retry: { padding: 14, marginTop: 8 },
  credit: {
    color: "#65695F",
    textAlign: "center",
    fontSize: 12,
    marginTop: 14,
  },
});
