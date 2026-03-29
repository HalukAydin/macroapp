import { calculateTdee, calculateMacroTargets } from "@macro/core";

function App() {
  const tdee = calculateTdee({
    sex: "male",
    age: 24,
    heightCm: 175,
    weightKg: 78,
    activity: "moderate"
  });

  const macros = calculateMacroTargets({
    weightKg: 78,
    targetCalories: tdee,
    rules: {
      proteinGPerKg: 2,
      fatMinGPerKg: 0.8
    }
  });

  return (
    <div style={{ padding: 40 }}>
      <h1>Macro MVP</h1>

      <h2>TDEE: {tdee} kcal</h2>

      <h3>Macros</h3>
      <ul>
        <li>Protein: {macros.proteinG} g</li>
        <li>Fat: {macros.fatG} g</li>
        <li>Carb: {macros.carbG} g</li>
      </ul>
    </div>
  );
}

export default App;