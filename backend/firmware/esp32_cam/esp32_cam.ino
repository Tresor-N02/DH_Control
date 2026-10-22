// ============================================================
// ESP32-CAM (AI Thinker, capteur OV3660) - Drone Hybride
//
// Reprend TEL QUEL le code du document fourni. Seul changement :
// WiFi.softAP() -> WiFi.begin() (mode station), pour que cette
// carte rejoigne le MEME réseau que le module terrestre et que
// le backend Python puisse parler aux deux en même temps (voir
// la note réseau en tête de firmware/ground_module/ground_module.ino).
// L'ancien mode point d'accès est gardé en commentaire.
//
// La route GET /capture (image JPEG) est inchangée : c'est elle
// que le backend interroge en boucle pour reconstituer un flux
// video (voir app/services/esp32_client.py + video_service.py).
//
// Non testé en compilation dans cet environnement (pas de chaîne
// de compilation ESP32 disponible ici) -- à vérifier avec
// PlatformIO/Arduino IDE avant de flasher.
// ============================================================

#include <Arduino.h>
#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

// =====================================================
// WIFI ESP32-CAM
// =====================================================
// Mode station : mettre le MEME reseau que ground_module.ino
const char* ssid = "AGASHA";
const char* password = "12345678";


// --- Ancien mode point d'acces (code d'origine), pour test isole ---
// const char* ssid = "ESP32-CAM";
// const char* password = "12345678";

WebServer server(80);
IPAddress local_IP(192, 168, 43, 111);
IPAddress gateway(192, 168, 43, 1);
IPAddress subnet(255, 255, 255, 0);

// =====================================================
// BROCHES AI THINKER ESP32-CAM
// =====================================================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22
#define LED_GPIO_NUM       4

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
<title>ESP32-CAM</title>
<style>
body { margin: 0; padding: 20px; background: #111; color: white; font-family: Arial; text-align: center; }
h1 { font-size: 30px; }
img { width: 100%; max-width: 640px; border-radius: 10px; border: 3px solid white; }
.info { margin-top: 15px; font-size: 18px; }
</style>
</head>
<body>
<h1>ESP32-CAM</h1>
<img id="camera" src="/capture">
<div class="info">
<p>Camera : OV3660</p>
<p>Carte : AI Thinker ESP32-CAM</p>
<p>Actualisation automatique</p>
</div>
<script>
function actualiserImage() {
  document.getElementById("camera").src = "/capture?t=" + new Date().getTime();
}
setInterval(actualiserImage, 300);
</script>
</body>
</html>
)rawliteral";
  server.send(200, "text/html", page);
}

// =====================================================
// CAPTURE IMAGE
// =====================================================
void captureImage()
{
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb)
  {
    server.send(500, "text/plain", "Erreur capture camera");
    return;
  }
  server.sendHeader("Content-Type", "image/jpeg");
  server.send_P(200, "image/jpeg", (const char*)fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

// =====================================================
// SETUP
// =====================================================
void setup()
{
  Serial.begin(115200);
  delay(1000);
  Serial.println();
  Serial.println("==============================");
  Serial.println("       ESP32-CAM");
  Serial.println("==============================");

  // --- CONFIGURATION CAMERA ---
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_DRAM;

  // --- INITIALISATION CAMERA ---
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK)
  {
    Serial.printf("Erreur camera : 0x%x\n", err);
    while (true) { delay(1000); }
  }

  // --- CONFIGURATION DU CAPTEUR OV3660 ---
  sensor_t* sensor = esp_camera_sensor_get();
  if (sensor->id.PID == OV3660_PID)
  {
    Serial.println("Capteur OV3660 detecte");
    sensor->set_vflip(sensor, 1);
    sensor->set_brightness(sensor, 1);
    sensor->set_saturation(sensor, -2);
  }
  sensor->set_framesize(sensor, FRAMESIZE_QVGA);

  // --- LED FLASH ---
  pinMode(LED_GPIO_NUM, OUTPUT);
  digitalWrite(LED_GPIO_NUM, LOW);

  // --- CREATION DU WIFI (mode station) ---
  WiFi.mode(WIFI_STA);
  WiFi.config(local_IP, gateway, subnet);
  WiFi.begin(ssid, password);
  IPAddress local_IP(192, 168, 43, 111);
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
  // WiFi.mode(WIFI_AP);
  // WiFi.softAP(ssid, password);

  // --- ROUTES WEB ---
  server.on("/", pageAccueil);
  server.on("/capture", captureImage);

  // --- DEMARRAGE SERVEUR ---
  server.begin();
  Serial.println();
  Serial.println("==============================");
  Serial.println("Camera demarree !");
  Serial.println("==============================");
  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.print("Adresse IP : ");
    Serial.println(WiFi.localIP());   // <- c'est cette IP qu'on met dans CAMERA_MODULE_BASE_URL côté backend
  }
  else
  {
    Serial.println("WiFi non connecte -- verifier SSID/mot de passe.");
  }
}

// =====================================================
// LOOP
// =====================================================
void loop()
{
  server.handleClient();
}
