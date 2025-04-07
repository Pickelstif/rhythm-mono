create table "public"."availability" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "band_id" uuid,
    "date" date not null,
    "source" text not null,
    "parsed_from" text,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP
);


alter table "public"."availability" enable row level security;

create table "public"."band_members" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "band_id" uuid,
    "role" text default 'member'::text,
    "joined_at" timestamp without time zone default CURRENT_TIMESTAMP
);


alter table "public"."band_members" enable row level security;

create table "public"."bands" (
    "id" uuid not null,
    "name" text not null,
    "created_by" uuid,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP
);


alter table "public"."bands" enable row level security;

create table "public"."events" (
    "id" uuid not null default uuid_generate_v4(),
    "band_id" uuid,
    "title" text not null,
    "date" date not null,
    "created_by" uuid,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP,
    "location" text,
    "start_time" timestamp with time zone not null
);


alter table "public"."events" enable row level security;

create table "public"."notifications" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "type" text not null,
    "content" text not null,
    "sent_via" text[] default '{}'::text[],
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP
);


alter table "public"."notifications" enable row level security;

create table "public"."users" (
    "id" uuid not null,
    "name" text not null,
    "email" text not null,
    "instruments" text[] default '{}'::text[],
    "notification_pref" text not null default 'email'::text,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX availability_pkey ON public.availability USING btree (id);

CREATE UNIQUE INDEX band_members_pkey ON public.band_members USING btree (id);

CREATE UNIQUE INDEX bands_pkey ON public.bands USING btree (id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE INDEX idx_availability_band_id ON public.availability USING btree (band_id);

CREATE INDEX idx_availability_user_id ON public.availability USING btree (user_id);

CREATE INDEX idx_band_members_band_id ON public.band_members USING btree (band_id);

CREATE INDEX idx_band_members_user_id ON public.band_members USING btree (user_id);

CREATE INDEX idx_events_band_id ON public.events USING btree (band_id);

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."availability" add constraint "availability_pkey" PRIMARY KEY using index "availability_pkey";

alter table "public"."band_members" add constraint "band_members_pkey" PRIMARY KEY using index "band_members_pkey";

alter table "public"."bands" add constraint "bands_pkey" PRIMARY KEY using index "bands_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."availability" add constraint "availability_band_id_fkey" FOREIGN KEY (band_id) REFERENCES bands(id) not valid;

alter table "public"."availability" validate constraint "availability_band_id_fkey";

alter table "public"."availability" add constraint "availability_source_check" CHECK ((source = ANY (ARRAY['manual'::text, 'ics'::text, 'pdf'::text]))) not valid;

alter table "public"."availability" validate constraint "availability_source_check";

alter table "public"."availability" add constraint "availability_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."availability" validate constraint "availability_user_id_fkey";

alter table "public"."band_members" add constraint "band_members_band_id_fkey" FOREIGN KEY (band_id) REFERENCES bands(id) not valid;

alter table "public"."band_members" validate constraint "band_members_band_id_fkey";

alter table "public"."band_members" add constraint "band_members_role_check" CHECK ((role = ANY (ARRAY['member'::text, 'admin'::text, 'leader'::text]))) not valid;

alter table "public"."band_members" validate constraint "band_members_role_check";

alter table "public"."band_members" add constraint "band_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."band_members" validate constraint "band_members_user_id_fkey";

alter table "public"."bands" add constraint "bands_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) not valid;

alter table "public"."bands" validate constraint "bands_created_by_fkey";

alter table "public"."events" add constraint "events_band_id_fkey" FOREIGN KEY (band_id) REFERENCES bands(id) not valid;

alter table "public"."events" validate constraint "events_band_id_fkey";

alter table "public"."events" add constraint "events_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) not valid;

alter table "public"."events" validate constraint "events_created_by_fkey";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK ((type = ANY (ARRAY['event'::text, 'reminder'::text, 'conflict'::text]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."availability" to "anon";

grant insert on table "public"."availability" to "anon";

grant references on table "public"."availability" to "anon";

grant select on table "public"."availability" to "anon";

grant trigger on table "public"."availability" to "anon";

grant truncate on table "public"."availability" to "anon";

grant update on table "public"."availability" to "anon";

grant delete on table "public"."availability" to "authenticated";

grant insert on table "public"."availability" to "authenticated";

grant references on table "public"."availability" to "authenticated";

grant select on table "public"."availability" to "authenticated";

grant trigger on table "public"."availability" to "authenticated";

grant truncate on table "public"."availability" to "authenticated";

grant update on table "public"."availability" to "authenticated";

grant delete on table "public"."availability" to "service_role";

grant insert on table "public"."availability" to "service_role";

grant references on table "public"."availability" to "service_role";

grant select on table "public"."availability" to "service_role";

grant trigger on table "public"."availability" to "service_role";

grant truncate on table "public"."availability" to "service_role";

grant update on table "public"."availability" to "service_role";

grant delete on table "public"."band_members" to "anon";

grant insert on table "public"."band_members" to "anon";

grant references on table "public"."band_members" to "anon";

grant select on table "public"."band_members" to "anon";

grant trigger on table "public"."band_members" to "anon";

grant truncate on table "public"."band_members" to "anon";

grant update on table "public"."band_members" to "anon";

grant delete on table "public"."band_members" to "authenticated";

grant insert on table "public"."band_members" to "authenticated";

grant references on table "public"."band_members" to "authenticated";

grant select on table "public"."band_members" to "authenticated";

grant trigger on table "public"."band_members" to "authenticated";

grant truncate on table "public"."band_members" to "authenticated";

grant update on table "public"."band_members" to "authenticated";

grant delete on table "public"."band_members" to "service_role";

grant insert on table "public"."band_members" to "service_role";

grant references on table "public"."band_members" to "service_role";

grant select on table "public"."band_members" to "service_role";

grant trigger on table "public"."band_members" to "service_role";

grant truncate on table "public"."band_members" to "service_role";

grant update on table "public"."band_members" to "service_role";

grant delete on table "public"."bands" to "anon";

grant insert on table "public"."bands" to "anon";

grant references on table "public"."bands" to "anon";

grant select on table "public"."bands" to "anon";

grant trigger on table "public"."bands" to "anon";

grant truncate on table "public"."bands" to "anon";

grant update on table "public"."bands" to "anon";

grant delete on table "public"."bands" to "authenticated";

grant insert on table "public"."bands" to "authenticated";

grant references on table "public"."bands" to "authenticated";

grant select on table "public"."bands" to "authenticated";

grant trigger on table "public"."bands" to "authenticated";

grant truncate on table "public"."bands" to "authenticated";

grant update on table "public"."bands" to "authenticated";

grant delete on table "public"."bands" to "service_role";

grant insert on table "public"."bands" to "service_role";

grant references on table "public"."bands" to "service_role";

grant select on table "public"."bands" to "service_role";

grant trigger on table "public"."bands" to "service_role";

grant truncate on table "public"."bands" to "service_role";

grant update on table "public"."bands" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Band leaders can manage member availability"
on "public"."availability"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM band_members
  WHERE ((band_members.band_id = availability.band_id) AND (band_members.user_id = auth.uid()) AND (band_members.role = 'admin'::text)))));


create policy "Users can manage their own availability"
on "public"."availability"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can view band availability"
on "public"."availability"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM band_members
  WHERE ((band_members.band_id = availability.band_id) AND (band_members.user_id = auth.uid())))));


create policy "Users can view their own availability"
on "public"."availability"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Enable read access for authenticated users"
on "public"."band_members"
as permissive
for select
to authenticated
using (true);


create policy "Enable write access for authenticated users"
on "public"."band_members"
as permissive
for all
to authenticated
using (true);


create policy "Anyone can view bands"
on "public"."bands"
as permissive
for select
to public
using (true);


create policy "Band leaders can update their bands"
on "public"."bands"
as permissive
for update
to public
using (((auth.uid() = created_by) OR (EXISTS ( SELECT 1
   FROM band_members
  WHERE ((band_members.band_id = bands.id) AND (band_members.user_id = auth.uid()) AND (band_members.role = 'admin'::text))))));


create policy "Users can create bands"
on "public"."bands"
as permissive
for insert
to public
with check ((auth.uid() = created_by));


create policy "Band leaders can manage events"
on "public"."events"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM band_members
  WHERE ((band_members.band_id = events.band_id) AND (band_members.user_id = auth.uid()) AND (band_members.role = 'admin'::text)))));


create policy "Band members can view events"
on "public"."events"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM band_members
  WHERE ((band_members.band_id = events.band_id) AND (band_members.user_id = auth.uid())))));


create policy "Users can manage their own notifications"
on "public"."notifications"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can view their own notifications"
on "public"."notifications"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can update their own profile"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view other users in their bands"
on "public"."users"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM band_members
  WHERE ((band_members.user_id = auth.uid()) AND (band_members.band_id IN ( SELECT band_members_1.band_id
           FROM band_members band_members_1
          WHERE (band_members_1.user_id = users.id)))))));


create policy "Users can view their own profile"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));



