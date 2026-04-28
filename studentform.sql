CREATE DATABASE student_db;

USE student_db;

CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    
    student_name VARCHAR(100) NOT NULL,
    
    class VARCHAR(20) NOT NULL,
    
    address VARCHAR(255) NOT NULL,
    
    contact_number VARCHAR(10) UNIQUE NOT NULL,
    
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100)
);