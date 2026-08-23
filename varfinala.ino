#include "WiFiS3.h"

// --- SETĂRI REȚEA ---
char ssid[] = "bagheta"; 
char pass[] = "123456789";     

int status = WL_IDLE_STATUS;
WiFiServer server(80);

// --- SETĂRI SENZOR ---
const int EMG_PIN = A0;
const int WINDOW_SIZE = 40;
int readings[WINDOW_SIZE];
int readIndex = 0;
long total = 0;
int fixedBaseline = 512;

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  Serial.print("Conectare la WiFi: ");
  Serial.println(ssid);
  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, pass);
    delay(5000);
  }
  Serial.println("Conectat!");
  Serial.print("Accesează: http://");
  Serial.println(WiFi.localIP()); 
  
  server.begin();

  // Calibrare
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
  // --- 1. Citire Senzor ---
  int rawSignal = analogRead(EMG_PIN);
  int rectifiedSignal = abs(rawSignal - fixedBaseline);
  
  total = total - readings[readIndex];
  readings[readIndex] = rectifiedSignal;
  total = total + readings[readIndex];
  readIndex = (readIndex + 1) % WINDOW_SIZE;
  int envelope = total / WINDOW_SIZE;

  // --- 2. Server Web ---
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
              client.println("HTTP/1.1 200 OK");
              client.println("Content-Type: text/plain");
              client.println("Access-Control-Allow-Origin: *");
              client.println("Connection: close");
              client.println();
              client.print(envelope);
            } else {
              client.println("HTTP/1.1 200 OK");
              client.println("Content-type:text/html; charset=UTF-8");
              client.println("Connection: close");
              client.println();
              
              client.print("<!DOCTYPE html><html lang='ro'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>");
              client.print("<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>"); 
              client.print("<style>");
              client.print("body { background: #121212; color: #fff; font-family: 'Segoe UI', sans-serif; text-align: center; margin: 0; padding: 20px; }");
              client.print("h1 { color: #4CAF50; font-size: 2em; letter-spacing: 2px; }");
              
              // Stiluri pentru Tab-urile de navigare
              client.print(".nav-tabs { display: flex; justify-content: center; gap: 8px; margin-bottom: 30px; flex-wrap: wrap; }");
              client.print(".nav-btn { background: #1f1f1f; color: #888; border: 1px solid #333; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s; }");
              client.print(".nav-btn.active-nav { background: #4CAF50; color: #000; border-color: #4CAF50; }");
              
              // Vizualizări pagini
              client.print(".view { display: none; }");
              client.print(".view.active-view { display: block; }");

              // Stiluri pentru exerciții
              client.print(".tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; flex-wrap: wrap; }");
              client.print(".tab { background: #2a2a2a; color: white; border: 2px solid #333; padding: 10px 20px; border-radius: 30px; cursor: pointer; font-weight: bold; transition: 0.3s; }");
              client.print(".tab.active { background: #4CAF50; border-color: #4CAF50; color: #000; box-shadow: 0 0 15px #4CAF50; }");
              
              // Stiluri Visualizer (Cerc luminos)
              client.print(".visualizer { position: relative; width: 200px; height: 200px; margin: 30px auto; border-radius: 50%; display: flex; justify-content: center; align-items: center; transition: box-shadow 0.1s ease-out; background: #fff; }"); 
              client.print(".visualizer img { max-width: 90%; max-height: 90%; border-radius: 50%; z-index: 10; object-fit: contain; }");
              
              client.print("#status { font-size: 1.5em; font-weight: bold; margin-top: 20px; text-transform: uppercase; }");
              client.print(".data-box { margin-top: 15px; font-size: 1.2em; color: #aaa; }");
              
              // Stiluri pentru panouri (Setări, Statistici)
              client.print(".panel-container { max-width: 600px; margin: 0 auto; background: #1a1a1a; padding: 20px; border-radius: 15px; border: 1px solid #333; text-align: left; }");
              client.print(".gear-display { font-size: 4em; font-weight: bold; color: #4CAF50; margin: 10px 0; text-align: center; text-shadow: 0 0 20px rgba(76,175,80,0.4); }");
              client.print(".gear-action { font-size: 1.2em; color: #ffc107; margin-bottom: 10px; font-weight: bold; height: 25px; text-align: center; }");
              
              // Formular Setări
              client.print(".form-group { margin-bottom: 15px; }");
              client.print("label { display: block; margin-bottom: 5px; color: #aaa; font-weight: bold; }");
              client.print("select, input { width: 100%; padding: 10px; background: #2a2a2a; border: 1px solid #444; color: #fff; border-radius: 5px; font-size: 1em; box-sizing: border-box; }");
              client.print(".save-btn { background: #4CAF50; color: #000; border: none; padding: 12px; width: 100%; font-weight: bold; border-radius: 5px; cursor: pointer; margin-top: 10px; font-size: 1.1em; }");
              client.print(".save-btn:hover { background: #45a049; }");
              client.print("</style></head><body>");
              
              client.print("<h1>MONITOR EMG AERO-FIT</h1>");
              
              // Meniul Principal
              client.print("<div class='nav-tabs'>");
              client.print("<div class='nav-btn active-nav' id='nav-settings' onclick='switchTab(\"settings\")'>⚙️ Setări</div>");
              client.print("<div class='nav-btn' id='nav-monitor' onclick='switchTab(\"monitor\")'>🏋️ Antrenament</div>");
              client.print("<div class='nav-btn' id='nav-stats' onclick='switchTab(\"stats\")'>📊 Statistici</div>");
              client.print("<div class='nav-btn' id='nav-gear' onclick='switchTab(\"gear\")'>🚴 Viteze Bicicletă</div>");
              client.print("</div>");
              
              // --- VIZUALIZARE 1: SETĂRI ---
              client.print("<div id='view-settings' class='view active-view'>");
              client.print("<div class='panel-container'>");
              client.print("<h2>Setări Senzor EMG & Profil</h2>");
              
              client.print("<div class='form-group'>");
              client.print("<label>Grupă Musculară Activă:</label>");
              client.print("<select id='setting-muscle' onchange='updateMuscleGroup()'>");
              client.print("<option value='Braț'>Braț (Biceps / Triceps)</option>");
              client.print("<option value='Picior'>Picior (Cvadriceps / Gambe)</option>");
              client.print("<option value='Piept'>Piept (Pectorali)</option>");
              client.print("<option value='Abdomen'>Abdomen (Core)</option>");
              client.print("</select>");
              client.print("</div>");

              client.print("<div class='form-group'>");
              client.print("<label>Prag Maxim Personalizat (Sensibilitate):</label>");
              client.print("<input type='number' id='setting-threshold' value='200' min='50' max='400'>");
              client.print("</div>");

              client.print("<div class='form-group'>");
              client.print("<label>Timp Așteptare Schimbător Viteze (Secunde):</label>");
              client.print("<input type='number' id='setting-cooldown' value='1.5' step='0.5' min='0.5' max='5'>");
              client.print("</div>");

              client.print("<button class='save-btn' onclick='saveSettings()'>Salvează Setările</button>");
              client.print("<p id='save-msg' style='text-align:center; color:#4CAF50; margin-top:10px; font-weight:bold;'></p>");
              client.print("</div></div>");

              // --- VIZUALIZARE 2: ANTRENAMENT ---
              client.print("<div id='view-monitor' class='view'>");
              client.print("<div class='tabs'>");
              client.print("<div class='tab active' id='btn-jk' onclick='setEx(\"jk\")'>Sărituri (Jacks)</div>");
              client.print("<div class='tab' id='btn-hk' onclick='setEx(\"hk\")'>Genunchi Sus</div>");
              client.print("<div class='tab' id='btn-sq' onclick='setEx(\"sq\")'>Genuflexiuni</div>");
              client.print("</div>");
              
              client.print("<div id='glow' class='visualizer'><img id='ex-img' src=''></div>");
              client.print("<div id='status'>Se așteaptă semnal...</div>");
              client.print("<div class='data-box'>Grupă Setată: <span id='current-muscle-label' style='color:#4CAF50;'>Braț</span></div>");
              client.print("<div class='data-box'>Semnal Brut: <span id='raw' style='color:#fff; font-weight:bold;'>0</span></div>");
              client.print("</div>");

              // --- VIZUALIZARE 3: STATISTICI ---
              client.print("<div id='view-stats' class='view'>");
              client.print("<div class='panel-container' style='text-align: center;'>");
              client.print("<h2>Istoric Activitate Musculară</h2>");
              client.print("<canvas id='emgChart'></canvas>");
              client.print("</div></div>");

              // --- VIZUALIZARE 4: VITEZE BICICLETĂ ---
              client.print("<div id='view-gear' class='view'>");
              client.print("<div class='panel-container' style='text-align: center;'>");
              client.print("<h2>Schimbător Automat de Viteze</h2>");
              client.print("<div class='gear-action' id='gear-msg'>Stare: Pregătit</div>");
              client.print("<div class='gear-display' id='gear-num'>Viteza 5</div>");
              client.print("<p style='color: #888;'>Relaxează pentru a crește viteza ⬆️ | Contracție maximă pentru a scădea viteza ⬇️</p>");
              client.print("</div></div>");
              
              // --- LOGICĂ JAVASCRIPT ---
              client.print("<script>");
              
              // Schimbare pagini
              client.print("function switchTab(tabName) {");
              client.print("  ['settings', 'monitor', 'stats', 'gear'].forEach(t => {");
              client.print("    document.getElementById('view-' + t).classList.remove('active-view');");
              client.print("    document.getElementById('nav-' + t).classList.remove('active-nav');");
              client.print("  });");
              client.print("  document.getElementById('view-' + tabName).classList.add('active-view');");
              client.print("  document.getElementById('nav-' + tabName).classList.add('active-nav');");
              client.print("}");

              // Inițializare Grafic (cu axa Y fixată la 400 maxim pentru o vizualizare optimă)
              client.print("const ctx = document.getElementById('emgChart').getContext('2d');");
              client.print("const emgChart = new Chart(ctx, {");
              client.print("  type: 'line',");
              client.print("  data: { labels: [], datasets: [{ label: 'Intensitate Semnal EMG', data: [], borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderWidth: 2, fill: true, tension: 0.3 }] },");
              client.print("  options: { responsive: true, scales: { y: { beginAtZero: true, max: 400 } } }");
              client.print("});");

              // Animații și praguri
              client.print("const animations = {");
              client.print("  'jk': 'https://cdn.dribbble.com/userupload/23995967/file/original-b7327e47be94975940e98b26277e5ead.gif',");
              client.print("  'hk': 'https://i.pinimg.com/originals/95/db/ae/95dbae82f51c67fc0f5aa30a57da663c.gif',");
              client.print("  'sq': 'https://images.squarespace-cdn.com/content/v1/54f9e84de4b0d13f30bba4cb/1530743652042-8AW6T0MPM6Q0JYEV6AO9/image-asset.gif'");
              client.print("};");
              
              client.print("const thresholds = { 'jk': 200, 'hk': 350, 'sq': 150 };");
              client.print("let currentTarget = thresholds['jk'];");
              client.print("let customCooldown = 1500;"); 
              
              // Variabile pentru Viteze
              client.print("let currentGear = 5;");
              client.print("let lastShiftTime = 0;"); 

              client.print("function setEx(ex) {");
              client.print("  document.getElementById('ex-img').src = animations[ex];");
              client.print("  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));");
              client.print("  document.getElementById('btn-' + ex).classList.add('active');");
              client.print("  currentTarget = thresholds[ex];");
              client.print("  document.getElementById('setting-threshold').value = currentTarget;");
              client.print("}");
              client.print("setEx('jk');"); 

              // Actualizare Setări
              client.print("function updateMuscleGroup() {");
              client.print("  let selectedMuscle = document.getElementById('setting-muscle').value;");
              client.print("  document.getElementById('current-muscle-label').innerText = selectedMuscle;");
              client.print("  if(selectedMuscle === 'Braț') { currentTarget = 200; }");
              client.print("  else if(selectedMuscle === 'Picior') { currentTarget = 350; }");
              client.print("  else if(selectedMuscle === 'Piept') { currentTarget = 300; }");
              client.print("  else if(selectedMuscle === 'Abdomen') { currentTarget = 180; }");
              client.print("  document.getElementById('setting-threshold').value = currentTarget;");
              client.print("}");

              client.print("function saveSettings() {");
              client.print("  let userVal = parseInt(document.getElementById('setting-threshold').value);");
              client.print("  let userCd = parseFloat(document.getElementById('setting-cooldown').value);");
              client.print("  if(!isNaN(userVal) && userVal > 0) { currentTarget = userVal; }");
              client.print("  if(!isNaN(userCd)) { customCooldown = userCd * 1000; }");
              client.print("  let msg = document.getElementById('save-msg');");
              client.print("  msg.innerText = 'Setări salvate cu succes!';");
              client.print("  setTimeout(() => { msg.innerText = ''; }, 3000);");
              client.print("}");
              
              // Buclă citire date
              client.print("setInterval(() => {");
              client.print("  fetch('/data').then(r => r.text()).then(val => {");
              client.print("    let flex = parseInt(val);");
              client.print("    if(isNaN(flex)) return;");
              client.print("    document.getElementById('raw').innerText = flex;");
              
              // Calcul vizual (Culoare și umbră)
              client.print("    let intensity = Math.min(flex / currentTarget, 1.0);"); 
              client.print("    let r = Math.round(255 * intensity);");
              client.print("    let g = Math.round(255 * (1 - intensity));");
              client.print("    let color = `rgb(${r}, ${g}, 0)`;");
              client.print("    let shadowSize = 50 + (intensity * 200);"); 
              client.print("    document.getElementById('glow').style.boxShadow = `0 0 ${shadowSize}px ${shadowSize/2}px ${color}`;");
              
              client.print("    let stat = document.getElementById('status');");
              client.print("    let gearMsg = document.getElementById('gear-msg');");
              client.print("    let now = new Date().getTime();");

              // Logica pentru schimbătorul de viteze
              client.print("    if (intensity < 0.3) {");
              client.print("      stat.innerText = 'RELAXAT'; stat.style.color = '#4CAF50';");
              client.print("      if (now - lastShiftTime > customCooldown && currentGear < 10) { currentGear++; lastShiftTime = now; gearMsg.innerText = '⬆️ CREȘTERE VITEZĂ (Relaxat)'; gearMsg.style.color = '#4CAF50'; }");
              client.print("    } else if (intensity > 0.7) {");
              client.print("      stat.innerText = 'CONTRACȚIE MAXIMĂ!'; stat.style.color = '#F44336';");
              client.print("      if (now - lastShiftTime > customCooldown && currentGear > 1) { currentGear--; lastShiftTime = now; gearMsg.innerText = '⬇️ SCĂDERE VITEZĂ (Efort Maxim)'; gearMsg.style.color = '#F44336'; }");
              client.print("    } else {");
              client.print("      stat.innerText = 'MODERAT'; stat.style.color = '#FFC107';");
              client.print("      gearMsg.innerText = '⏸️ MENȚINERE VITEZĂ (Efort Mediu)'; gearMsg.style.color = '#FFC107';");
              client.print("    }");

              // Actualizare ecran Viteze
              client.print("    document.getElementById('gear-num').innerText = 'Viteza ' + currentGear;");

              // Actualizare Grafic (optimizat la maximum 100 de puncte recente pentru fluiditate)
              client.print("    let timeStr = new Date().toLocaleTimeString();");
              client.print("    if (emgChart.data.labels.length > 100) {");
              client.print("      emgChart.data.labels.shift();");
              client.print("      emgChart.data.datasets[0].data.shift();");
              client.print("    }");
              client.print("    emgChart.data.labels.push(timeStr);");
              client.print("    emgChart.data.datasets[0].data.push(flex);");
              client.print("    emgChart.update();");
              
              client.print("  });");
              client.print("}, 200);"); 
              
              client.print("</script></body></html>");
            }
            break;
          } else {
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