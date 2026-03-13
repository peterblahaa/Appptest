-- Vytvorenie tabuľky pre globálne nastavenia aplikácie (ceny väzby, dokončovania atď.)
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Predvyplnené základné hodnoty (aby kalkulačka nepadala pri prvom spustení)
INSERT IGNORE INTO `settings` (`setting_key`, `setting_value`) VALUES
('custom_bindings', '{"V1":{"setup_cost":10,"price_per_piece":0.05},"V2":{"setup_cost":15,"price_per_piece":0.15},"V4":{"setup_cost":20,"price_per_piece":0.5},"V8":{"setup_cost":30,"price_per_piece":1}}'),
('custom_finishing', '{"LAMINATION":{"setup_cost":5,"price_per_sheet_pass":0,"passes":1},"VARNISH":{"setup_cost":5,"price_per_sheet_pass":0,"passes":1},"FOIL":{"setup_cost":5,"price_per_sheet_pass":0,"passes":1}}');
