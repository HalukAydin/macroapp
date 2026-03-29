import ProfileForm from "./components/ProfileForm";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Macro MVP</h1>
      <ProfileForm />
      <Dashboard />
    </div>
  );
}

export default App;