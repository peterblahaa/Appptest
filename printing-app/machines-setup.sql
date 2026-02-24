-- SQL skript pre pridanie tabuľky strojov do existujúcej databázy

CREATE TABLE IF NOT EXISTS `machines` (
  `id` varchar(50) NOT NULL,
  `sheet_format` varchar(20) NOT NULL,
  `technology` varchar(20) NOT NULL,
  `digital_setup_fixed` decimal(10,2) DEFAULT NULL,
  `digital_price_per_side_1F` decimal(10,2) DEFAULT NULL,
  `digital_price_per_side_4F` decimal(10,2) DEFAULT NULL,
  `offset_run_price_per_sheet_side` decimal(10,2) DEFAULT NULL,
  `offset_setup_per_side` decimal(10,2) DEFAULT NULL,
  `plate_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Import predvolených dát strojov z pôvodného zdrojového kódu
INSERT IGNORE INTO `machines` (`id`, `sheet_format`, `technology`, `digital_setup_fixed`, `digital_price_per_side_1F`, `digital_price_per_side_4F`, `offset_run_price_per_sheet_side`, `offset_setup_per_side`, `plate_price`) VALUES
('XEROX_SRA3', 'SRA3', 'digital', 15.00, 0.03, 0.05, NULL, NULL, NULL),
('KONICA_SRA3', 'SRA3', 'digital', 15.00, 0.03, 0.05, NULL, NULL, NULL),
('HEIDELBERG_SRA2', 'SRA2', 'offset', NULL, NULL, NULL, 0.02, 30.00, 6.00);
