-- Fix currency rates in database
-- USD is base currency (1.0000)
-- All other rates are relative to USD

UPDATE currencies SET rate = 1.0000 WHERE code = 'USD';
UPDATE currencies SET rate = 110.0000 WHERE code = 'BDT';  -- 1 USD = 110 BDT
UPDATE currencies SET rate = 2.7000 WHERE code = 'XCD';    -- 1 USD = 2.7 XCD
UPDATE currencies SET rate = 1.0000 WHERE code = 'USDT';   -- 1 USD = 1 USDT
UPDATE currencies SET rate = 0.8500 WHERE code = 'EUR';    -- 1 USD = 0.85 EUR
UPDATE currencies SET rate = 0.7300 WHERE code = 'GBP';    -- 1 USD = 0.73 GBP
UPDATE currencies SET rate = 150.0000 WHERE code = 'JPY';  -- 1 USD = 150 JPY

-- Check the updated rates
SELECT code, name, rate, enabled FROM currencies ORDER BY code;
