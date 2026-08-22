interface WorkoutProps {
  onNavigate: (page: string) => void;
}

export default function Workout({ onNavigate }: WorkoutProps) {
  return (
    <div className="screen-content">
      <h1>Workout Session</h1>
      <p>Your sensor data will appear here.</p>
      
      <div className="card">
        <h2>Running (Still)</h2>
        <p>Asteptarssse date de la senzor...</p>
      </div>
      
      <button className="start-button dark" onClick={() => onNavigate('home')}>
        Back to Dashboard
      </button>
    </div>
  );
}