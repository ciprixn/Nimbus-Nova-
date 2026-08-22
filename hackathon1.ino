const int EMG_PIN = A0;

// Setări filtru de netezire (Moving Average)
const int WINDOW_SIZE = 40;
int readings[WINDOW_SIZE];
int readIndex = 0;
long total = 0;

int fixedBaseline = 512; // Linia de bază fixă calculată la pornire

// Pragul de încordare pentru Plank (Poți ajusta această valoare în funcție de senzori)
const int PLANK_THRESHOLD = 30; 

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000); // Așteaptă conexiunea USB

  pinMode(EMG_PIN, INPUT);

  // 1. Calibrare Fixă: 3 secunde de repaus total
  Serial.println("Calibrare baseline... NU te misca si stai relaxat!");
  long sum = 0;
  for (int i = 0; i < 300; i++) {
    sum += analogRead(EMG_PIN);
    delay(10);
  }
  fixedBaseline = sum / 300; // Salvează valoarea exactă de repaus
  
  // Inițializare buffer filtru
  for (int i = 0; i < WINDOW_SIZE; i++) {
    readings[i] = 0;
  }
}

void loop() {
  int rawSignal = analogRead(EMG_PIN);

  // 2. Redresare față de Baseline-ul FIX (nu se mai modifică în timp)
  int rectifiedSignal = abs(rawSignal - fixedBaseline);

  // 3. Calculare nivel de încordare (Netezire undă)
  total = total - readings[readIndex];
  readings[readIndex] = rectifiedSignal;
  total = total + readings[readIndex];
  readIndex = (readIndex + 1) % WINDOW_SIZE;

  int envelope = total / WINDOW_SIZE;

  // 4. Detecție status Plank (1 = Plank Corect, 0 = Abdomen Relaxat / Forma Greșită)
  bool isPlankActive = (envelope >= PLANK_THRESHOLD);

  // Afișare în Serial Plotter
  Serial.print("Nivel_Incordare:");
  Serial.print(envelope);
  Serial.print(",");
  Serial.print("Prag_Minim_Plank:");
  Serial.print(PLANK_THRESHOLD);
  Serial.print(",");
  Serial.print("Plank_Valid:");
  Serial.println(isPlankActive * 60); // Scalat la valoarea 60 pentru vizibilitate pe grafic

  delay(10); // Sampling la ~100 Hz
}