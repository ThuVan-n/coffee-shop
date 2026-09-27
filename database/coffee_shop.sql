-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: coffee_shop
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `stock_quantity` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cost_per_unit` decimal(10,2) NOT NULL,
  `minimum_stock` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredients`
--

LOCK TABLES `ingredients` WRITE;
/*!40000 ALTER TABLE `ingredients` DISABLE KEYS */;
INSERT INTO `ingredients` VALUES (1,'Cà phê hạt','gram',5200.00,180.00,1000.00,'2026-09-25 03:20:12'),(2,'Sữa tươi','ml',19000.00,32.00,5000.00,'2026-09-25 03:20:12'),(3,'Sữa đặc','ml',9970.00,45.00,2000.00,'2026-09-25 03:20:12'),(4,'Đường','gram',9950.00,25.00,2000.00,'2026-09-25 03:20:12'),(5,'Trà đào','gram',2980.00,150.00,500.00,'2026-09-25 03:20:12'),(6,'Syrup đào','ml',4970.00,80.00,1000.00,'2026-09-25 03:20:12'),(7,'Chocolate','gram',3000.00,220.00,500.00,'2026-09-25 03:20:12'),(8,'Đá','gram',28580.00,2.00,5000.00,'2026-09-25 03:20:12'),(9,'Whipping cream','ml',3000.00,180.00,500.00,'2026-09-25 03:20:12'),(10,'Nước','ml',49050.00,1.00,10000.00,'2026-09-25 03:20:12');
/*!40000 ALTER TABLE `ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cost_subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,6,2,30000.00,60000.00,8725.00,17450.00),(2,1,7,1,25000.00,25000.00,3950.00,3950.00),(3,2,1,2,25000.00,50000.00,4025.00,8050.00),(4,2,2,1,20000.00,20000.00,4415.00,4415.00),(5,4,6,2,30000.00,60000.00,8725.00,17450.00),(6,4,7,1,25000.00,25000.00,3950.00,3950.00),(7,5,6,2,30000.00,60000.00,8725.00,17450.00),(8,5,7,1,25000.00,25000.00,3950.00,3950.00),(9,6,6,2,30000.00,60000.00,8725.00,17450.00),(10,6,7,1,25000.00,25000.00,3950.00,3950.00),(13,8,1,2,25000.00,50000.00,4025.00,8050.00),(14,8,2,1,20000.00,20000.00,4415.00,4415.00),(15,9,6,2,30000.00,60000.00,8725.00,17450.00),(16,9,7,1,25000.00,25000.00,3950.00,3950.00),(17,10,7,1,25000.00,25000.00,3950.00,3950.00),(18,10,3,1,30000.00,30000.00,6375.00,6375.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` varchar(20) NOT NULL DEFAULT 'completed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,85000.00,'completed','2026-09-25 07:09:50'),(2,70000.00,'completed','2026-09-25 07:36:08'),(4,85000.00,'completed','2026-09-26 07:18:03'),(5,85000.00,'completed','2026-09-26 07:25:00'),(6,85000.00,'completed','2026-09-26 08:07:57'),(8,70000.00,'completed','2026-09-26 09:41:22'),(9,85000.00,'completed','2026-09-26 11:14:33'),(10,55000.00,'completed','2026-09-27 08:31:04');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Coffee',25000.00,'Cà phê sữa'),(2,'Tea',20000.00,'Trà đào'),(3,'Milk Tea',30000.00,'Trà sữa'),(6,'late',30000.00,'Cà phê latte'),(7,'americano ',25000.00,'cà phê đen');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_items`
--

DROP TABLE IF EXISTS `recipe_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `ingredient_id` int NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recipe_id` (`recipe_id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `recipe_items_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recipe_items_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_items`
--

LOCK TABLES `recipe_items` WRITE;
/*!40000 ALTER TABLE `recipe_items` DISABLE KEYS */;
INSERT INTO `recipe_items` VALUES (1,1,1,20.00),(2,1,4,5.00),(3,1,8,100.00),(4,1,10,100.00),(5,2,5,10.00),(6,2,6,30.00),(7,2,4,5.00),(8,2,8,120.00),(9,2,10,150.00),(10,3,5,10.00),(11,3,2,100.00),(12,3,3,30.00),(13,3,4,5.00),(14,3,8,100.00),(15,4,1,20.00),(16,4,2,150.00),(17,4,4,5.00),(18,4,8,100.00),(19,5,1,20.00),(20,5,10,150.00),(21,5,8,100.00);
/*!40000 ALTER TABLE `recipe_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_id` (`product_id`),
  CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (1,1),(2,2),(3,3),(4,6),(5,7);
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transactions`
--

DROP TABLE IF EXISTS `stock_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingredient_id` int NOT NULL,
  `transaction_type` varchar(20) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `reference_id` int DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `stock_transactions_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transactions`
--

LOCK TABLES `stock_transactions` WRITE;
/*!40000 ALTER TABLE `stock_transactions` DISABLE KEYS */;
INSERT INTO `stock_transactions` VALUES (1,1,'SALE',-60.00,1,'Used for Order #1','2026-09-25 07:25:09'),(2,2,'SALE',-300.00,1,'Used for Order #1','2026-09-25 07:25:09'),(3,4,'SALE',-10.00,1,'Used for Order #1','2026-09-25 07:25:09'),(4,8,'SALE',-300.00,1,'Used for Order #1','2026-09-25 07:25:09'),(5,10,'SALE',-150.00,1,'Used for Order #1','2026-09-25 07:25:09'),(6,1,'SALE',-60.00,6,'Used for Order #6','2026-09-26 08:07:57'),(7,2,'SALE',-300.00,6,'Used for Order #6','2026-09-26 08:07:57'),(8,4,'SALE',-10.00,6,'Used for Order #6','2026-09-26 08:07:57'),(9,8,'SALE',-300.00,6,'Used for Order #6','2026-09-26 08:07:57'),(10,10,'SALE',-150.00,6,'Used for Order #6','2026-09-26 08:07:57'),(11,1,'PURCHASE',500.00,NULL,'Nhập thêm cà phê hạt','2026-09-26 08:16:53'),(12,1,'SALE',-40.00,8,'Used for Order #8','2026-09-26 09:41:22'),(13,4,'SALE',-15.00,8,'Used for Order #8','2026-09-26 09:41:22'),(14,5,'SALE',-10.00,8,'Used for Order #8','2026-09-26 09:41:22'),(15,6,'SALE',-30.00,8,'Used for Order #8','2026-09-26 09:41:22'),(16,8,'SALE',-320.00,8,'Used for Order #8','2026-09-26 09:41:22'),(17,10,'SALE',-350.00,8,'Used for Order #8','2026-09-26 09:41:22'),(18,1,'SALE',-60.00,9,'Used for Order #9','2026-09-26 11:14:33'),(19,2,'SALE',-300.00,9,'Used for Order #9','2026-09-26 11:14:33'),(20,4,'SALE',-10.00,9,'Used for Order #9','2026-09-26 11:14:33'),(21,8,'SALE',-300.00,9,'Used for Order #9','2026-09-26 11:14:33'),(22,10,'SALE',-150.00,9,'Used for Order #9','2026-09-26 11:14:33'),(23,1,'SALE',-20.00,10,'Used for Order #10','2026-09-27 08:31:04'),(24,2,'SALE',-100.00,10,'Used for Order #10','2026-09-27 08:31:04'),(25,3,'SALE',-30.00,10,'Used for Order #10','2026-09-27 08:31:04'),(26,4,'SALE',-5.00,10,'Used for Order #10','2026-09-27 08:31:04'),(27,5,'SALE',-10.00,10,'Used for Order #10','2026-09-27 08:31:04'),(28,8,'SALE',-200.00,10,'Used for Order #10','2026-09-27 08:31:04'),(29,10,'SALE',-150.00,10,'Used for Order #10','2026-09-27 08:31:04');
/*!40000 ALTER TABLE `stock_transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-27 17:26:37
