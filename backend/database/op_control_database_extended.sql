-- ============================================================================
-- op_control -- EXTENDED schema
--
-- This is the schema originally supplied (op_control_database.sql),
-- unchanged except for two small, additive sets of columns needed to
-- store the sensor data this project asked the backend to account for:
--
--   * telemetrie.distance_obstacle / obstacle_detecte
--       the ultrasonic reading that drives obstacle avoidance, and
--       whether it counted as "too close" at that instant.
--   * detection.bbox_x / bbox_y / bbox_w / bbox_h
--       the YOLO bounding box (normalized 0..1, relative to the frame),
--       so the frontend can redraw a past detection without re-running
--       inference.
--
-- Every table name, column name, type and constraint from the original
-- file is preserved as-is. app/models.py maps 1:1 onto this file.
--
-- If you already created the database from the original file, you can
-- upgrade in place instead of re-running everything:
--
--   ALTER TABLE telemetrie
--     ADD COLUMN distance_obstacle DECIMAL(6,2) NULL AFTER latitude,
--     ADD COLUMN obstacle_detecte  TINYINT(1) NOT NULL DEFAULT 0 AFTER distance_obstacle;
--
--   ALTER TABLE detection
--     ADD COLUMN bbox_x DECIMAL(6,5) NULL AFTER confiance,
--     ADD COLUMN bbox_y DECIMAL(6,5) NULL AFTER bbox_x,
--     ADD COLUMN bbox_w DECIMAL(6,5) NULL AFTER bbox_y,
--     ADD COLUMN bbox_h DECIMAL(6,5) NULL AFTER bbox_w;
-- ============================================================================

CREATE DATABASE IF NOT EXISTS op_control
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE op_control;

CREATE TABLE utilisateur (
    id_utilisateur INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('OPERATEUR','ADMIN') NOT NULL DEFAULT 'OPERATEUR'
) ENGINE=InnoDB;

CREATE TABLE drone (
    id_drone INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    etat ENUM('ARRETE','PRET','EN_VOL','EN_DEPLACEMENT','EN_MISSION','ERREUR')
        NOT NULL DEFAULT 'ARRETE',
    mode ENUM('AERIEN','TERRESTRE') NOT NULL DEFAULT 'AERIEN'
) ENGINE=InnoDB;

CREATE TABLE camera (
    id_camera INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_drone INT UNSIGNED NOT NULL UNIQUE,
    resolution VARCHAR(50) NOT NULL,
    stream_url VARCHAR(500),
    etat ENUM('ACTIVE','INACTIVE','ERREUR') NOT NULL DEFAULT 'INACTIVE',
    CONSTRAINT fk_camera_drone FOREIGN KEY (id_drone)
        REFERENCES drone(id_drone)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE mission (
    id_mission INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_drone INT UNSIGNED NOT NULL,
    titre VARCHAR(150) NOT NULL,
    statut ENUM('PLANIFIEE','EN_COURS','TERMINEE','ANNULEE')
        NOT NULL DEFAULT 'PLANIFIEE',
    date_debut DATETIME NULL,
    date_fin DATETIME NULL,
    CONSTRAINT fk_mission_drone FOREIGN KEY (id_drone)
        REFERENCES drone(id_drone)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_mission_drone (id_drone)
) ENGINE=InnoDB;

CREATE TABLE telemetrie (
    id_telemetrie BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_drone INT UNSIGNED NOT NULL,
    batterie DECIMAL(5,2) NOT NULL,
    altitude DECIMAL(10,2) NOT NULL DEFAULT 0,
    vitesse DECIMAL(10,2) NOT NULL DEFAULT 0,
    temperature DECIMAL(6,2),
    signal INT,
    longitude DECIMAL(11,8),
    latitude DECIMAL(10,8),
    -- --- additive: ultrasonic sensor (obstacle avoidance) ---
    distance_obstacle DECIMAL(6,2) NULL,
    obstacle_detecte TINYINT(1) NOT NULL DEFAULT 0,
    date_heure DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_telemetrie_drone FOREIGN KEY (id_drone)
        REFERENCES drone(id_drone)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_telemetrie_drone_date (id_drone, date_heure)
) ENGINE=InnoDB;

CREATE TABLE detection (
    id_detection BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_camera INT UNSIGNED NOT NULL,
    objet VARCHAR(100) NOT NULL,
    confiance DECIMAL(5,4) NOT NULL,
    -- --- additive: normalized bounding box (0..1, relative to frame) ---
    bbox_x DECIMAL(6,5) NULL,
    bbox_y DECIMAL(6,5) NULL,
    bbox_w DECIMAL(6,5) NULL,
    bbox_h DECIMAL(6,5) NULL,
    date_detection DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_detection_confiance CHECK (confiance >= 0 AND confiance <= 1),
    CONSTRAINT fk_detection_camera FOREIGN KEY (id_camera)
        REFERENCES camera(id_camera)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_detection_camera_date (id_camera, date_detection)
) ENGINE=InnoDB;

CREATE TABLE alerte (
    id_alerte BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_drone INT UNSIGNED NOT NULL,
    id_detection BIGINT UNSIGNED NULL,
    type VARCHAR(80) NOT NULL,
    message VARCHAR(255) NOT NULL,
    date_alerte DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('NOUVELLE','LUE','TRAITEE') NOT NULL DEFAULT 'NOUVELLE',
    CONSTRAINT fk_alerte_drone FOREIGN KEY (id_drone)
        REFERENCES drone(id_drone)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alerte_detection FOREIGN KEY (id_detection)
        REFERENCES detection(id_detection)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_alerte_drone_date (id_drone, date_alerte)
) ENGINE=InnoDB;

CREATE TABLE historique (
    id_historique BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT UNSIGNED NULL,
    id_drone INT UNSIGNED NULL,
    id_mission INT UNSIGNED NULL,
    action VARCHAR(255) NOT NULL,
    date_action DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historique_utilisateur FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateur(id_utilisateur)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_historique_drone FOREIGN KEY (id_drone)
        REFERENCES drone(id_drone)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_historique_mission FOREIGN KEY (id_mission)
        REFERENCES mission(id_mission)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_historique_date (date_action)
) ENGINE=InnoDB;

CREATE OR REPLACE VIEW vue_derniere_telemetrie AS
SELECT t.*
FROM telemetrie t
INNER JOIN (
    SELECT id_drone, MAX(date_heure) AS derniere_date
    FROM telemetrie GROUP BY id_drone
) d ON t.id_drone = d.id_drone AND t.date_heure = d.derniere_date;

INSERT INTO drone (nom, etat, mode)
VALUES ('Drone Hybride 01', 'ARRETE', 'AERIEN');

INSERT INTO camera (id_drone, resolution, stream_url, etat)
VALUES (1, '1920x1080', NULL, 'INACTIVE');
