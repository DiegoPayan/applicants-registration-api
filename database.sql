DROP DATABASE servicio;
CREATE DATABASE servicio;
USE servicio;

CREATE TABLE estudios (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    estatus ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rama (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    estatus ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE puesto (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    estatus ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE zona (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    estatus ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE aspirantes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    idEstudios INT(10) UNSIGNED NOT NULL,
    idRama INT(10) UNSIGNED NOT NULL,
    idPuesto INT(10) UNSIGNED NOT NULL,
    idZona INT(10) UNSIGNED NOT NULL,
    folio VARCHAR(10) NOT NULL DEFAULT '',
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    apellidoPaterno VARCHAR(50) NOT NULL DEFAULT '',
    apellidoMaterno VARCHAR(50) NOT NULL DEFAULT '',
    listado ENUM('INSTITUTO', 'SINDICATO', '') NOT NULL DEFAULT '',
    fechaAlta DATE NOT NULL DEFAULT '1900-01-01',
    total INT(10) UNSIGNED DEFAULT 0 NOT NULL,
    estatus ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idEstudios)
        REFERENCES estudios (id),
    FOREIGN KEY (idRama)
        REFERENCES rama (id),
    FOREIGN KEY (idPuesto)
        REFERENCES puesto (id),
    FOREIGN KEY (idZona)
        REFERENCES zona (id),
    INDEX IDX_fecha (fechaAlta ASC),
    INDEX IDX_total (total DESC)
);

CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(4) NOT NULL DEFAULT '',
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    apellidoPaterno VARCHAR(50) NOT NULL DEFAULT '',
    apellidoMaterno VARCHAR(50) NOT NULL DEFAULT '',
    permisos ENUM('LECTURA', 'CREACION') NOT NULL DEFAULT 'LECTURA',
    estatus ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE puntaje (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    idAspirante BIGINT UNSIGNED,
    escolaridad DOUBLE(10 , 2 ) NOT NULL DEFAULT 0.0,
    parentesco DOUBLE(10 , 2 ) NOT NULL DEFAULT 0.0,
    tiempoServicio DOUBLE(10 , 2 ) NOT NULL DEFAULT 0.0,
    tiempoRegistro DOUBLE(10 , 2 ) NOT NULL DEFAULT 0.0,
    total DOUBLE(10 , 2 ) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idAspirante)
        REFERENCES aspirantes (id)
);
