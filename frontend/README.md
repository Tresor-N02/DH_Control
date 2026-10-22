# DH_MIL — Frontend

Interface React 19, Vite et Tailwind CSS pour superviser le drone hybride.
Les données viennent du backend FastAPI ; celui-ci peut basculer en simulation.

## Démarrage

```sh
npm ci
npm run dev
```

Copier `.env.example` vers `.env` si le backend ne se trouve pas sur
`http://localhost:8000`. Se connecter avec un compte créé côté backend.

```sh
npm run lint
npm run build
npm run preview
```

Configurer `VITE_API_URL` et éventuellement `VITE_WS_URL` avant le build.
Le serveur de déploiement doit rediriger les routes de l’application vers
`index.html`.

## Parcours et états

- Navigation latérale sur ordinateur, menu déroulant sur mobile.
- Tableau de bord : batterie, vitesse et obstacle en premier, puis GPS,
  altitude, signal, carte, vidéo et commandes.
- Contrôle : caméra et indicateurs à proximité du joystick.
- Arrêt d’urgence accessible sur toutes les pages authentifiées.
- Mode simulation indiqué par un bandeau permanent. La caméra indique
  séparément si son image est simulée.
- Télémétrie et vidéo périmées après plus de cinq secondes sans mise à jour.
  Les anciennes valeurs sont atténuées, les déplacements sont bloqués et
  le marqueur GPS n’est plus présenté comme une position actuelle.
- Batterie et signal affichés comme indisponibles sur le matériel actuel :
  le firmware ne transmet pas ces mesures. Le simulateur peut les fournir.
- Les commandes de vol et le retour automatique sont désactivés avec
  explication : ces capacités ne sont pas disponibles sur le matériel.

## Commandes et carte

Le joystick fonctionne au pointeur ou avec les flèches du clavier.
Il renouvelle les commandes toutes les 120 ms pendant le maintien.
Relâcher, appuyer sur Espace, quitter la page ou perdre le focus demande
un arrêt. Les champs de formulaire et boutons conservent leur comportement
clavier normal.

Les retours de commande distinguent envoi, acceptation, refus et absence
de confirmation après quatre secondes. Le secours REST conserve la vitesse.
Une confirmation vient du serveur ; elle ne constitue pas une mesure
indépendante de l’immobilité des moteurs. Les protections du backend et
du firmware restent nécessaires.

La carte dispose du zoom, du recentrage et d’un suivi activable. Déplacer
la carte à la main suspend le suivi. Sans position valide récente, aucun
marqueur actuel n’est affiché.

La vidéo conserve le cadrage complet. Les boîtes de détection utilisent
exactement la surface de l’image, y compris lorsque des bandes apparaissent.

## Alertes et limites actuelles

L’ouverture des alertes ne les marque pas comme lues. Une action explicite
marque les alertes chargées depuis la base via l’API. Les nouvelles alertes
WebSocket ne contiennent pas encore leur identifiant de base : leur lecture
reste locale à la session jusqu’à ce que le protocole serveur fournisse cet ID.
Les alertes YOLO enregistrées sans diffusion WebSocket apparaissent au prochain
chargement.

L’application sélectionne le premier drone disponible. Un écran explique
l’absence de drone ou une erreur serveur et propose de réessayer.
Les missions sont un suivi de statut ; elles ne déclenchent pas de navigation
autonome.

## Vérification manuelle

1. Vérifier les vues à 390 × 844 et 1366 × 768, puis à 200 % de zoom.
2. Ouvrir le menu mobile et parcourir toutes les pages.
3. Maintenir le joystick sans le déplacer, puis déclencher l’arrêt d’urgence :
   les envois de mouvement doivent cesser.
4. Saisir du texte et utiliser les flèches dans le titre d’une mission :
   aucune commande de déplacement ne doit partir.
5. Interrompre les messages : après cinq secondes, vérifier les états périmés
   de la vidéo, des mesures et de la carte.
6. Vérifier un refus d’arrêt, une absence de confirmation, une liste de drones
   vide et une erreur réseau.
7. Vérifier le cadrage vidéo et les boîtes sur une image réelle aux proportions
   différentes de celles du panneau.
