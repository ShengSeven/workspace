CREATE DATABASE smartex;

USE smartex;

DROP TABLE IF EXISTS TRANSACTION;
CREATE TABLE TRANSACTION (

 from_addr VARCHAR(50),
 to_addr VARCHAR(50),
 level_str INT,
 time_stmp INT

);

SELECT * FROM TRANSACTION;