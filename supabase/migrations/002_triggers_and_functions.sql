-- Generate unique 5-digit referral code function
CREATE OR REPLACE FUNCTION gen_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := LPAD((FLOOR(RANDOM()*100000))::INT::TEXT, 5, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = code);
  END LOOP;
  NEW.referral_code := code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral code generation
DROP TRIGGER IF EXISTS trg_profiles_gen_code ON profiles;
CREATE TRIGGER trg_profiles_gen_code
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION gen_referral_code();

-- Alert match trigger: new listing → notify subscribed users
CREATE OR REPLACE FUNCTION match_alerts_on_listing()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, payload)
  SELECT a.user_id, 'alert_match',
         JSONB_BUILD_OBJECT('listing_id', NEW.id, 'title', NEW.title, 'price_cents', NEW.price_cents)
  FROM alerts a
  WHERE a.school_id = NEW.school_id
    AND a.expires_at > NOW()
    AND LOWER(NEW.title) LIKE '%' || LOWER(a.query_text) || '%';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for alert matching
DROP TRIGGER IF EXISTS trg_listings_match_alerts ON listings;
CREATE TRIGGER trg_listings_match_alerts
AFTER INSERT ON listings
FOR EACH ROW
EXECUTE FUNCTION match_alerts_on_listing();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS trg_profiles_update_timestamp ON profiles;
CREATE TRIGGER trg_profiles_update_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_listings_update_timestamp ON listings;
CREATE TRIGGER trg_listings_update_timestamp
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_courses_update_timestamp ON courses;
CREATE TRIGGER trg_courses_update_timestamp
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update message_threads last_message_at on new message
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads
  SET last_message_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_messages_update_thread_timestamp ON messages;
CREATE TRIGGER trg_messages_update_thread_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_thread_last_message();
