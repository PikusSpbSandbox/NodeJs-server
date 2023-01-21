-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 21, 2023 at 12:58 AM
-- Server version: 8.0.31
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `history`
--

-- --------------------------------------------------------

--
-- Table structure for table `currency`
--

DROP TABLE IF EXISTS `currency`;
CREATE TABLE IF NOT EXISTS `currency` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `usd` decimal(6,3) DEFAULT NULL,
  `eur` decimal(6,3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `currency`
--

INSERT INTO `currency` (`id`, `date`, `usd`, `eur`) VALUES
(1, '2023-01-13', '67.574', '73.113'),
(2, '2023-01-14', '67.574', '73.113'),
(3, '2023-01-15', '67.574', '73.113'),
(4, '2023-01-16', '68.289', '73.830'),
(5, '2023-01-17', '68.664', '74.265'),
(6, '2023-01-18', '68.873', '74.588'),
(7, '2023-01-19', '68.847', '74.406'),
(8, '2023-01-20', '68.847', '74.406'),
(9, '2023-01-21', '68.666', '74.343');

-- --------------------------------------------------------

--
-- Table structure for table `lightday`
--

DROP TABLE IF EXISTS `lightday`;
CREATE TABLE IF NOT EXISTS `lightday` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `start` time DEFAULT NULL,
  `end` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `weather`
--

DROP TABLE IF EXISTS `weather`;
CREATE TABLE IF NOT EXISTS `weather` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` varchar(10) NOT NULL,
  `value` decimal(6,3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`)
) ENGINE=MyISAM AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `weather`
--

INSERT INTO `weather` (`id`, `date`, `value`) VALUES
(4, '2023-01-04', '2.941'),
(5, '2023-01-05', '1.732'),
(6, '2023-01-06', '1.662'),
(7, '2023-01-07', '-0.590'),
(8, '2023-01-08', '0.186'),
(9, '2023-01-09', '-1.603'),
(10, '2023-01-10', '0.229'),
(11, '2023-01-11', '0.997'),
(12, '2023-01-12', '2.875'),
(13, '2023-01-13', '4.227'),
(14, '2023-01-14', '3.566'),
(15, '2023-01-15', '2.872'),
(16, '2023-01-16', '2.766'),
(17, '2023-01-17', '2.855'),
(18, '2023-01-18', '1.904'),
(19, '2023-01-19', '3.103'),
(20, '2023-01-20', '1.492'),
(21, '2023-01-21', '-0.158');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
