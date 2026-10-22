
#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <TinyGPS++.h>          // AJOUT BACKEND (GPS)

// =====================================================
// WIFI
// =====================================================
// Mode station : à adapter à votre réseau (box, hotspot, etc.)
const char* ssid = "AGASHA";
const char* password = "12345678";

// --- Ancien mode point d'accès (code d'origine), pour test isolé ---
// const char* ssid = "Robot_ESP32";
// const char* password = "12345678";

WebServer server(80);
IPAddress local_IP(192, 168, 43, 244);
IPAddress gateway(192, 168, 43, 1);
IPAddress subnet(255, 255, 255, 0);

// =====================================================
// PWM
// =====================================================
const int PWM_FREQ = 1000;
const int PWM_RESOLUTION = 8;
const int CHANNEL_A = 0;
const int CHANNEL_B = 1;
const int VITESSE_MAX = 50;   // AJOUT BACKEND : vitesse par défaut si non précisée

// =====================================================
// L298N
// =====================================================
#define IN1 14
#define IN2 27
#define IN3 26
#define IN4 25
#define ENA 32
#define ENB 33

// =====================================================
// CAPTEUR ULTRASONIQUE
// =====================================================
#define TRIG_PIN 5
#define ECHO_PIN 18

// Distance minimale de sécurité
const float DISTANCE_SECURITE = 30.0;

// =====================================================
// GPS NEO-M8N -- AJOUT BACKEND
// =====================================================
// GPS TX -> ESP32 GPIO16 (RX2)
// GPS RX -> ESP32 GPIO17 (TX2)
// (remappé depuis GPIO25/26 du fichier GPS d'origine : ces deux
// broches sont prises par IN4/IN3 ci-dessus sur ce module)
#define GPS_RX 4
#define GPS_TX 13
HardwareSerial GPSserial(2);
TinyGPSPlus gps;

// =====================================================
// ETAT DU ROBOT
// =====================================================
bool robotAvance = false;
bool prochainVirageAGauche = true;

// =====================================================
// MESURE DE DISTANCE
// =====================================================
float mesurerDistance()
{
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duree = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duree == 0)
  {
    return -1;
  }

  float distance = duree * 0.0343 / 2.0;
  return distance;
}

// =====================================================
// MOTEURS
// =====================================================
// AJOUT BACKEND : chaque fonction prend maintenant une vitesse
// (0-255) appliquée aux deux canaux PWM ; appelée sans argument
// (comme dans le code d'origine) elle utilise VITESSE_MAX, donc
// le comportement par défaut ne change pas.
void appliquerVitesse(int vitesse)
{
 ledcWrite(ENA, vitesse);
ledcWrite(ENB, vitesse);
}

void avancer(int vitesse = VITESSE_MAX)
{
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  appliquerVitesse(vitesse);
  robotAvance = true;
  Serial.println("AVANCER");
}

void reculer(int vitesse = VITESSE_MAX)
{
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  appliquerVitesse(vitesse);
  robotAvance = false;
  Serial.println("RECULER");
}

void gauche(int vitesse = VITESSE_MAX)
{
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  appliquerVitesse(vitesse);
  robotAvance = false;
  Serial.println("GAUCHE");
}

void droite(int vitesse = VITESSE_MAX)
{
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  appliquerVitesse(vitesse);
  robotAvance = false;
  Serial.println("DROITE");
}

void stopRobot()
{
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  appliquerVitesse(0);
  robotAvance = false;
  Serial.println("STOP");
}
void eviterObstacle()
{
  stopRobot();
  delay(150);

  reculer();
  delay(400);
  stopRobot();
  delay(100);

  if (prochainVirageAGauche)
  {
    gauche();
  }
  else
  {
    droite();
  }
    delay(400);
  stopRobot();
  delay(100);

  prochainVirageAGauche = !prochainVirageAGauche;

  float distanceApresVirage = mesurerDistance();
  if (distanceApresVirage < 0 || distanceApresVirage > DISTANCE_SECURITE)
  {
    avancer();
    Serial.println("EVITEMENT AUTOMATIQUE : voie degagee, reprise de l'avance");
  }
  else
  {
    Serial.println("EVITEMENT AUTOMATIQUE : toujours bloque apres virage, robot reste arrete");
  }
}

// AJOUT BACKEND : lit ?vitesse=0-255 dans la requête HTTP, sinon VITESSE_MAX
int vitesseDemandee()
{
  if (server.hasArg("vitesse"))
  {
    int v = server.arg("vitesse").toInt();
    if (v < 0) v = 0;
    if (v > 255) v = 255;
    return v;
  }
  return VITESSE_MAX;
}

// =====================================================
// PAGE WEB
// =====================================================
void pageAccueil()
{
  String page = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Robot ESP32</title>
<style>
body {
  margin: 0;
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
  background: #eeeeee;
}
h1 { font-size: 32px; }
.container { max-width: 400px; margin: auto; }
button {
  width: 120px;
  height: 70px;
  margin: 8px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 15px;
  border: none;
  background: #2196F3;
  color: white;
}
button:active { background: #1565C0; }
.stop { background: red; }
.stop:active { background: darkred; }
</style>
</head>
<body>
<h1>Robot ESP32</h1>
<div class="container">
<br>
<button onclick="commande('/avant')">AVANCER</button>
<br>
<button onclick="commande('/gauche')">GAUCHE</button>
<button class="stop" onclick="commande('/stop')">STOP</button>
<button onclick="commande('/droite')">DROITE</button>
<br>
<button onclick="commande('/arriere')">RECULER</button>
</div>
<script>
function commande(url) {
  fetch(url).catch(function(error) { console.log(error); });
}
</script>
</body>
</html>
)rawliteral";
  server.send(200, "text/html", page);
}

// =====================================================
// AJOUT BACKEND : /telemetrie -- ultrason + GPS en un seul JSON
// =====================================================
void handleTelemetrie()
{
  float distance = mesurerDistance();

  String json = "{";
  json += "\"distance_cm\":" + String(distance, 1) + ",";

  if (gps.location.isValid())
  {
    json += "\"latitude\":" + String(gps.location.lat(), 6) + ",";
    json += "\"longitude\":" + String(gps.location.lng(), 6) + ",";
  }
  else
  {
    json += "\"latitude\":null,\"longitude\":null,";
  }

  json += "\"altitude\":" + String(gps.altitude.isValid() ? gps.altitude.meters() : 0, 1) + ",";
  json += "\"vitesse\":" + String(gps.speed.isValid() ? gps.speed.kmph() : 0, 1) + ",";
  json += "\"satellites\":" + String(gps.satellites.isValid() ? gps.satellites.value() : 0) + ",";
  json += "\"fix\":" + String(gps.location.isValid() ? "true" : "false");
  json += "}";

  server.send(200, "application/json", json);
}

// =====================================================
// SETUP
// =====================================================
void setup()
{
  Serial.begin(115200);

  // --- BROCHES MOTEURS ---
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  // --- PWM ---
  ledcAttach(ENA, PWM_FREQ, PWM_RESOLUTION);
ledcAttach(ENB, PWM_FREQ, PWM_RESOLUTION);

  // --- ULTRASON ---
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  // --- GPS (AJOUT BACKEND) ---
  GPSserial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  // --- ARRET AU DEMARRAGE ---
  stopRobot();

  // --- WIFI (mode station) ---
  WiFi.mode(WIFI_STA);
  WiFi.config(local_IP, gateway, subnet);
  WiFi.begin(ssid, password);
  IPAddress local_IP(192, 168, 43, 244);
IPAddress gateway(192, 168, 43, 1);
IPAddress subnet(255, 255, 255, 0);
  Serial.print("Connexion WiFi");
  unsigned long debutConnexion = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - debutConnexion < 15000)
  {
    delay(400);
    Serial.print(".");
  }
  Serial.println();

  // --- Pour tester cette carte seule, remplacer le bloc ci-dessus par : ---
  // WiFi.softAP(ssid, password);

  Serial.println("==============================");
  Serial.println(" ROBOT ESP32 - MODULE TERRESTRE");
  Serial.println("==============================");
  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.print("Adresse IP : ");
    Serial.println(WiFi.localIP());   // <- c'est cette IP qu'on met dans GROUND_MODULE_BASE_URL côté backend
  }
  else
  {
    Serial.println("WiFi non connecte -- verifier SSID/mot de passe.");
  }

  // --- ROUTES WEB ---
  server.on("/", pageAccueil);

  server.on("/avant", []()
  {
    float distance = mesurerDistance();
    Serial.print("Obstacle : ");
    Serial.print(distance);
    Serial.println(" cm");

    if (distance > 0 && distance <= DISTANCE_SECURITE)
    {
      eviterObstacle();
      Serial.println("!!! OBSTACLE DETECTE !!!");
      Serial.println("AVANCE BLOQUEE");
      server.send(200, "text/plain", "Obstacle detecte");
      return;
    }
    avancer(vitesseDemandee());
    server.send(200, "text/plain", "AVANCER");
  });

  server.on("/arriere", []()
  {
    reculer(vitesseDemandee());
    server.send(200, "text/plain", "RECULER");
  });

  server.on("/gauche", []()
  {
    gauche(vitesseDemandee());
    server.send(200, "text/plain", "GAUCHE");
  });

  server.on("/droite", []()
  {
    droite(vitesseDemandee());
    server.send(200, "text/plain", "DROITE");
  });

  server.on("/stop", []()
  {
    stopRobot();
    server.send(200, "text/plain", "STOP");
  });

  server.on("/telemetrie", handleTelemetrie);   // AJOUT BACKEND

  // --- SERVEUR ---
  server.begin();
  Serial.println("Serveur Web demarre");
}

// =====================================================
// LOOP
// =====================================================
void loop()
{
  server.handleClient();

  // AJOUT BACKEND : il faut nourrir le parseur GPS en continu
  // pour qu'il decode les trames NMEA au fil de l'eau.
  while (GPSserial.available())
  {
    gps.encode(GPSserial.read());
  }

  // --- SURVEILLANCE DE L'OBSTACLE ---
  static unsigned long dernierMesure = 0;
  if (millis() - dernierMesure >= 200)
  {
    dernierMesure = millis();
    float distance = mesurerDistance();
    if (distance > 0)
    {
      Serial.print("Distance : ");
      Serial.print(distance);
      Serial.println(" cm");

      // Si le robot avance et qu'un obstacle apparait devant lui
      if (robotAvance && distance <= DISTANCE_SECURITE)
      {
        eviterObstacle();
        Serial.println("!!! ARRET AUTOMATIQUE !!!");
      }
    }
    else
    {
    Serial.println("Distance : aucun echo");
    }
  }
}
