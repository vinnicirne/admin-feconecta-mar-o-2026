-- Função para incrementar contador de posts
CREATE OR REPLACE FUNCTION increment_posts_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET posts_count = posts_count + 1, updated_at = now() 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Função para decrementar contador de posts  
CREATE OR REPLACE FUNCTION decrement_posts_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET posts_count = GREATEST(posts_count - 1, 0), updated_at = now() 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar contador de comentários
CREATE OR REPLACE FUNCTION increment_comments_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET comments_count = comments_count + 1, updated_at = now() 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar contador de seguidores
CREATE OR REPLACE FUNCTION increment_followers_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET followers_count = followers_count + 1, updated_at = now() 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Função para decrementar contador de seguidores  
CREATE OR REPLACE FUNCTION decrement_followers_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET followers_count = GREATEST(followers_count - 1, 0), updated_at = now() 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar contador de seguindo
CREATE OR REPLACE FUNCTION increment_following_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET following_count = following_count + 1, updated_at = now() 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Função para decrementar contador de seguindo
CREATE OR REPLACE FUNCTION decrement_following_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET following_count = GREATEST(following_count - 1, 0), updated_at = now() 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;