CREATE DATABASE IF NOT EXISTS taskapp;

USE taskapp;

CREATE TABLE users (
    id INT AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    dueDate DATE,
    category VARCHAR(255),
    completed BOOLEAN DEFAULT FALSE,
    userId INT,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES users(id)
);

DELIMITER $$
CREATE PROCEDURE insert_task(
   IN title VARCHAR(255),
   IN description TEXT,
   IN dueDate DATE,
   IN category VARCHAR(255),
   IN completed BOOLEAN,
   IN userId INT)
BEGIN
INSERT INTO tasks (title, description, dueDate, category, completed, userId)
VALUES (title, description, dueDate, category, completed, userId);
END$$

DELIMITER ;