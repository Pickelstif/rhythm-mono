-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.availability (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  band_id uuid,
  date date NOT NULL,
  source text NOT NULL CHECK (source = ANY (ARRAY['manual'::text, 'ics'::text, 'pdf'::text])),
  parsed_from text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT availability_pkey PRIMARY KEY (id),
  CONSTRAINT availability_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id),
  CONSTRAINT availability_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.band_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  band_id uuid,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['member'::text, 'admin'::text, 'leader'::text])),
  joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT band_members_pkey PRIMARY KEY (id),
  CONSTRAINT band_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT band_members_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id)
);
CREATE TABLE public.bands (
  id uuid NOT NULL,
  name text NOT NULL,
  created_by uuid,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT bands_pkey PRIMARY KEY (id),
  CONSTRAINT bands_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  band_id uuid,
  title text NOT NULL,
  date date NOT NULL,
  created_by uuid,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  location text,
  start_time timestamp with time zone NOT NULL,
  event_type text NOT NULL DEFAULT 'rehearsal'::text,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT events_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['event'::text, 'reminder'::text, 'conflict'::text])),
  content text NOT NULL,
  sent_via ARRAY DEFAULT '{}'::text[],
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.setlist_songs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  setlist_id uuid NOT NULL,
  song_id uuid NOT NULL,
  position integer NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT setlist_songs_pkey PRIMARY KEY (id),
  CONSTRAINT setlist_songs_setlist_id_fkey FOREIGN KEY (setlist_id) REFERENCES public.setlists(id),
  CONSTRAINT setlist_songs_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id)
);
CREATE TABLE public.setlists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT setlists_pkey PRIMARY KEY (id),
  CONSTRAINT setlists_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT setlists_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.songs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  band_id uuid,
  title text NOT NULL,
  artist text NOT NULL,
  spotify_link text,
  song_sheet_path text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT songs_pkey PRIMARY KEY (id),
  CONSTRAINT songs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT songs_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  band_id uuid NOT NULL,
  amount numeric NOT NULL,
  description text NOT NULL,
  transaction_date timestamp with time zone DEFAULT now(),
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT transactions_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  instruments ARRAY DEFAULT '{}'::text[],
  notification_pref text NOT NULL DEFAULT 'email'::text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);