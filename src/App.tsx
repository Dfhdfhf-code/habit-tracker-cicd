import { useAuth } from "./contexts/AuthContext";
import LoginForm from "./components/LoginForm";
import HabitTracker from "./components/HabitTracker";

function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="app-container">
        <p className="app-subtitle">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="app-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 className="app-title" style={{ margin: 0 }}>Трекер привычек</h1>
        <button
          onClick={signOut}
          className="glass-button"
          style={{ padding: "8px 16px", fontSize: 13 }}
        >
          Выйти
        </button>
      </div>
      <HabitTracker />
    </div>
  );
}
export default App;
