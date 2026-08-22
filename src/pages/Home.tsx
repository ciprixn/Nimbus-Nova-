interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="screen-content">
      <h1>Dashboard</h1>
      <p>Welcome to your AI Workout Assistant.</p>
      
      <div className="card">
        <h2>Quick Start</h2>
        <p>Ready to start your session?</p>
        <button className="start-button" onClick={() => onNavigate('workout')}>
          Open Workout Page
        </button>
      </div>
    </div>
  );
}