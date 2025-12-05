-- Προσθήκη user_timezone column στον πίνακα manual_deposit_requests
-- Αυτό το script προσθέτει το user_timezone field για να μπορούμε να εμφανίζουμε country flags

-- Προσθήκη στήλης user_timezone (αν δεν υπάρχει)
ALTER TABLE manual_deposit_requests 
ADD COLUMN IF NOT EXISTS user_timezone text;

-- Ενημέρωση των υπάρχοντων manual deposits με default timezone
-- Αν δεν έχουν user_timezone, θα χρησιμοποιήσουμε Europe/Athens ως default
UPDATE manual_deposit_requests 
SET user_timezone = 'Europe/Athens' 
WHERE user_timezone IS NULL;

-- Δημιουργία index για καλύτερη απόδοση (optional)
CREATE INDEX IF NOT EXISTS idx_manual_deposits_user_timezone 
ON manual_deposit_requests(user_timezone) 
WHERE user_timezone IS NOT NULL;

-- Ενημέρωση ολοκληρώθηκε!
-- Τώρα τα manual deposits θα έχουν user_timezone και θα μπορούμε να εμφανίζουμε country flags

