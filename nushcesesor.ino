#include "WiFiS3.h"

// --- NETWORK SETTINGS ---
char ssid[] = "TP-Link_7314Barbaros"; 
char pass[] = "NISSANPRIMERA";     

int status = WL_IDLE_STATUS;
WiFiServer server(80);

// --- SENSOR SETTINGS ---
const int EMG_PIN = A0;
const int WINDOW_SIZE = 40;
int readings[WINDOW_SIZE];
int readIndex = 0;
long total = 0;
int fixedBaseline = 512;

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, pass);
    delay(5000);
  }
  Serial.println("Connected!");
  Serial.print("Go to: http://");
  Serial.println(WiFi.localIP()); 
  
  server.begin();

  // Calibration
  pinMode(EMG_PIN, INPUT);
  long sum = 0;
  for (int i = 0; i < 300; i++) {
    sum += analogRead(EMG_PIN);
    delay(10);
  }
  fixedBaseline = sum / 300; 
  for (int i = 0; i < WINDOW_SIZE; i++) readings[i] = 0;
}

void loop() {
  // --- 1. Read Sensor ---
  int rawSignal = analogRead(EMG_PIN);
  int rectifiedSignal = abs(rawSignal - fixedBaseline);
  
  total = total - readings[readIndex];
  readings[readIndex] = rectifiedSignal;
  total = total + readings[readIndex];
  readIndex = (readIndex + 1) % WINDOW_SIZE;
  int envelope = total / WINDOW_SIZE;

  // --- 2. Web Server (No more refreshing!) ---
  WiFiClient client = server.available();
  if (client) {
    String currentLine = "";
    bool isDataRequest = false;
    
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        
        if (c == '\n') {
          if (currentLine.length() == 0) {
            
            if (isDataRequest) {
              // If the webpage asks for data, send ONLY the number
              client.println("HTTP/1.1 200 OK");
              client.println("Content-Type: text/plain");
              client.println("Connection: close");
              client.println();
              client.print(envelope);
            } else {
              // If it's the first time loading, send the full HTML/JS App
              client.println("HTTP/1.1 200 OK");
              client.println("Content-type:text/html");
              client.println("Connection: close");
              client.println();
              
              // The HTML, CSS, and Javascript Payload
              client.print("<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'>");
              client.print("<style>body{background:#1e1e24;color:white;font-family:sans-serif;text-align:center;margin-top:40px;}");
              client.print(".bar-bg{width:80%;height:50px;background:#333;margin:30px auto;border-radius:25px;overflow:hidden;box-shadow:inset 0 0 10px #000;}");
              client.print("#bar{height:100%;width:0%;background:red;transition:width 0.2s, background-color 0.3s;}");
              client.print("#status{font-size:2.5em;font-weight:bold;margin-top:20px;text-transform:uppercase;}</style></head><body>");
              client.print("<h1>Running Pace Monitor</h1>");
              client.print("<div class='bar-bg'><div id='bar'></div></div>");
              client.print("<div id='status'>Waiting for movement...</div>");
              client.print("<div style='margin-top:20px;color:#888;'>Raw Muscle Signal: <span id='raw'>0</span></div>");
              
              // The Javascript that handles the smooth animation logic
              client.print("<script>");
              client.print("let energy = 0;");
              client.print("setInterval(() => {");
              client.print("  fetch('/data').then(r => r.text()).then(val => {");
              client.print("    let flex = parseInt(val);");
              client.print("    document.getElementById('raw').innerText = flex;");
              
              // The Game Logic: Fill bar if running hard, drain if slow
              client.print("    if (flex > 70) { energy += 15; } else { energy -= 5; }");
              client.print("    if (energy > 100) energy = 100; if (energy < 0) energy = 0;");
              
              // Update the UI
              client.print("    document.getElementById('bar').style.width = energy + '%';");
              client.print("    let stat = document.getElementById('status');");
              client.print("    let bar = document.getElementById('bar');");
              
              client.print("    if (energy < 30) { stat.innerText='CONCENTRATE! RUN FASTER!'; stat.style.color='#ff4d4d'; bar.style.background='#ff4d4d'; }");
              client.print("    else if (energy < 75) { stat.innerText='Keep Going!'; stat.style.color='#fca311'; bar.style.background='#fca311'; }");
              client.print("    else { stat.innerText='PERFECT PACE!'; stat.style.color='#4CAF50'; bar.style.background='#4CAF50'; }");
              
              client.print("  });");
              client.print("}, 200);"); // Asks Arduino for new data every 200ms
              
              client.print("</script></body></html>");
            }
            break;
          } else {
            // Check if the Javascript is asking for the "/data" route
            if (currentLine.startsWith("GET /data")) {
              isDataRequest = true;
            }
            currentLine = "";
          }
        } else if (c != '\r') {
          currentLine += c;
        }
      }
    }
    client.stop();
  }
  delay(10);
}