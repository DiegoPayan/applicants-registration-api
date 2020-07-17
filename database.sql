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

INSERT INTO servicio.estudios(nombre) VALUES ("ASISTENTE EJECUTIVO"),("BACHILLERATO"),("BACHILLERATO TECNOLOGICO"),("BACHILLERATO Y TECNICA"),
	("BACHILLERATO Y TECNICO"),("CIRUJANO DENTISTA"),("CONTABILIDAD Y ADMON"),("CONTADOR PUBLICO"),("CONTADURIA Y FINANZAS"),
	("ING. INDUSTRIAL"),("LAE"),("LIC EN BIOLOGIA"),("LIC EN CONTADURIA"),("LIC EN TRABAJO SOCIAL"),("LIC. EN ADMINISTRACION"),
	("LIC. EN ADMON DE EMPR."),("LIC. EN ADMON DE FINZ."),("LIC. EN ADMON TURISTICA"),("LIC. EN ADMON Y FINANZAS"),("LIC. EN ARQUITECTURA"),
	("LIC. EN CIENCIA DE LA COM."),("LIC. EN CONTADURIA PUBLICA"),("LIC. EN CRIMINALISTA"),("LIC. EN ECONOMIA"),("LIC. EN DERECHO"),("LIC. EN CIENCIAS DE C"),
	("LIC. EN DISEÑO GRAFICO CERTIFICADO"),("LIC. EN INFORMATICA"),("LIC. EN MERCADOTECNIA"),("LIC. EN PSICOLOGIA"),("LIC. EN SISTEMAS"),("LIC. EN TRABAJO SOCIAL"),
	("LIC. EN TURISMO"),("LICENCIATURA"),("LICENCIATURA C.P."),("PASANTE DE LIC. EN ADMON TURISTICA"),("PASANTE DE LIC. MER"),
	("PASANTE DE LICENCIATURA"),("PASANTE DE PSICOLOGIA"),("PASANTE LICENCIATURA"),("PASANTE TRABAJO SOCIAL"),("PROFESIONAL"),
	("SECRETARIA"),("SECUNDARIA"),("SECUNDARIA Y SECRETARIA"),("SECUNDARIA Y SECRETARIADO"),("TEC INFORMATICO"),("TEC. DE ADMINISTRACION"),("TRABAJO SOCIAL");

CREATE TABLE rama (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    estatus ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO servicio.rama(nombre) VALUES ("GRUPO AFINES"), ("MEDICA");

CREATE TABLE puesto (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    estatus ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO servicio.puesto(nombre) VALUES ("APOYO ADMINISTRATIVO EN SALUD"), ("APOYO ADMINISTRATIVO EN SALUD A 1"), ("APOYO ADMINISTRATIVO EN SALUD A 2 (ADMINISTRATIVO ESPECIALIZADO)"), 
	("MEDICO RADIÓLOGO"), ("MEDICO HEMATÓLOGO"), 
    ("MEDICO ENDOCRINÓLOGO"),("MEDICO ALERGÓLOGO"), ("MEDICO OTORRINOLARINGÓLOGO"),
    ("MEDICO REUMATÓLOGO");

CREATE TABLE zona (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    estatus ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO servicio.zona(nombre) VALUES ("CENTRO"), ("SUR"), ("NORTE");

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
    subcomision ENUM('DELEGACION', 'HOSPITAL REGIONAL', '') NOT NULL DEFAULT '',
    listado ENUM('INSTITUTO', 'SINDICATO', '') NOT NULL DEFAULT '',
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total INT(10) UNSIGNED DEFAULT 0 NOT NULL,
    nominacion VARCHAR(200) NOT NULL DEFAULT '',
    motivo_baja VARCHAR(400) NOT NULL DEFAULT '',
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
    INDEX IDX_fecha (created_at ASC),
    INDEX IDX_total (total DESC)
);

INSERT INTO servicio.aspirantes(idEstudios,idRama,idPuesto,idZona,folio,nombre,apellidoPaterno,apellidoMaterno,listado,
	)

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

INSERT INTO servicio.usuarios(clave, nombre, apellidoPaterno, apellidoMaterno, permisos) VALUES
("dp12","Diego","Payan","Lopez","LECTURA"),("mm12","Mayela","Madrid","Gutiérrez","CREACION"),
("nz12","Nicolas","Zavala","Sajaropulos","LECTURA");

CREATE TABLE 