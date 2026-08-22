const int EMG_PIN = A0;

// Setări filtru de netezire (Moving Average)
const int WINDOW_SIZE = 40;
int readings[WINDOW_SIZE];
int readIndex = 0;
long total = 0;

int fixedBaseline = 512; // Linia de bază fixă calculată la pornire

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000); // Așteaptă conexiunea USB pe UNO R4

  pinMode(EMG_PIN, INPUT);

  // 1. Calibrare Fixă: Citește voltajul de repaus
  // Este crucial să stai cu piciorul complet relaxat la pornire!
  long sum = 0;
  for (int i = 0; i < 300; i++) {
    sum += analogRead(EMG_PIN);
    delay(10);
  }
  fixedBaseline = sum / 300; 
  
  // Inițializare buffer filtru
  for (int i = 0; i < WINDOW_SIZE; i++) {
    readings[i] = 0;
  }
}

void loop() {
  int rawSignal = analogRead(EMG_PIN);

  // 2. Extrage amplitudinea mișcării ignorând zgomotul de fond
  int rectifiedSignal = abs(rawSignal - fixedBaseline);

  // 3. Calculează nivelul de încordare (Netezire undă - Envelope)
  total = total - readings[readIndex];
  readings[readIndex] = rectifiedSignal;
  total = total + readings[readIndex];
  readIndex = (readIndex + 1) % WINDOW_SIZE;

  int envelope = total / WINDOW_SIZE;

  // 4. Afișare curată în Serial Plotter
  Serial.print("Semnal_Brut:");
  Serial.print(rawSignal);
  Serial.print(",");
  Serial.print("Nivel_Incordare:");
  Serial.println(envelope);

  delay(10); // Rata de eșantionare ~100 Hz
}