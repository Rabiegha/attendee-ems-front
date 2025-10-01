Create an Entity-Relationship Diagram for a multi-tenant Event Management System (PostgreSQL).

Conventions
PK : id uuid pk (sauf lookup permissions).


Timestamps : created_at timestamptz default now(), updated_at timestamptz default now().


Multi-tenant : org_id sur les tables métier + FKs composites vers le parent pour garantir “même org”.


Portée présence : gate subevent_id IS NULL ; subevent subevent_id = subevents.id.


Toujours indiquer unicités et index clés.



1) organizations
id uuid pk


name text not null


slug text not null unique


timezone text not null default 'UTC'


plan_code text null


created_at, updated_at



2) persons (global, sans org_id)
id uuid pk


first_name text null


last_name text null


email text null unique


phone text null


company text null


job_title text null


country text null


metadata jsonb null


created_at, updated_at
 Index : unique(email)



3) users (compte, mono-org)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


person_id uuid not null unique references persons(id) on delete cascade


role_id uuid not null references roles(id) -- FK composite ci-dessous


email text not null unique


first_name text null


last_name text null


password_hash text null


is_active boolean not null default true


created_at, updated_at
 Uniques/Indexes : unique(id, org_id) (pour FKs composites en aval), index(org_id), index(org_id, role_id)
 FK composite (même org) : (role_id, org_id) → roles(id, org_id)



4) roles (RBAC par org)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


code text not null -- ex: 'admin','manager','partner'


name text not null


description text null


created_at, updated_at
 Uniques/Indexes : unique(org_id, code), unique(id, org_id), index(org_id)



5) permissions (lookup global)
code text pk -- ex: 'event.read','checkin.perform'


description text null


resource text null


action text null



6) role_permissions (M:N roles ↔ permissions)
role_id uuid not null references roles(id) on delete cascade


permission_code text not null references permissions(code) on delete cascade


effect text not null default 'allow' check (effect in ('allow','deny'))


conditions jsonb null


created_at, updated_at
 PK : (role_id, permission_code)
 Index : (permission_code)



7) org_activity_sectors (catalogue de secteurs par org)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


code text not null


name text not null


color_hex text null


text_color_hex text null


icon text null


parent_id uuid null references org_activity_sectors(id) on delete restrict


is_active boolean not null default true


sort_order int not null default 0


created_at, updated_at
 Uniques/Indexes : unique(org_id, code), unique(id, org_id), index(org_id, parent_id, sort_order)
 FK parent même-org : (parent_id, org_id) → org_activity_sectors(id, org_id)



8) org_event_types (catalogue de types d'événement par org)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


code text not null


name text not null


color_hex text null


text_color_hex text null


icon text null


is_active boolean not null default true


sort_order int not null default 0


created_at, updated_at
 Uniques/Indexes : unique(org_id, code), unique(id, org_id), index(org_id, sort_order)



9) events
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


code text not null


name text not null


org_activity_sector_id uuid null references org_activity_sectors(id) on delete set null


org_event_type_id uuid null references org_event_types(id) on delete set null


description text null


start_at timestamptz not null


end_at timestamptz not null


timezone text not null default 'UTC'


status text not null -- 'draft'|'published'|'archived'


capacity int null
 Location


location_type text not null default 'physical' -- 'physical'|'online'|'hybrid'


address_formatted text null


address_street text null


address_city text null


address_region text null


address_postal_code text null


address_country text null


latitude numeric(9,6) null


longitude numeric(9,6) null


place_id text null


created_by uuid null references users(id)


created_at, updated_at
 Uniques/Indexes : unique(id, org_id), unique(org_id, code), index(org_id), index(org_id, start_at), index(org_id, status), index(org_id, org_activity_sector_id), index(org_id, org_event_type_id)
 FK composites (même org) :


(org_activity_sector_id, org_id) → org_activity_sectors(id, org_id)


(org_event_type_id, org_id) → org_event_types(id, org_id)


(optionnel) (created_by, org_id) → users(id, org_id)



10) event_settings (1:1 event – toggles & branding légers)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null unique references events(id) on delete cascade


website_url text null


logo_asset_id uuid null


attendance_mode text not null default 'onsite' -- 'onsite'|'online'|'hybrid'


registration_auto_approve boolean not null default false


allow_checkin_out boolean not null default true


has_event_reminder boolean not null default false


badge_template_id uuid null references badge_templates(id) on delete set null -- défaut


extra jsonb null


created_at, updated_at
 Index : (org_id, event_id)
 FK composites : (event_id, org_id) → events(id, org_id) ; (badge_template_id, org_id) → badge_templates(id, org_id)



11) email_senders (org-scoped)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


name text not null


from_email text not null


reply_to_email text null


cc_emails text[] null


bcc_emails text[] null


is_default boolean not null default false


created_at, updated_at
 Unique(org_id, from_email)



12) email_settings (1:1 event – overrides simples)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null unique references events(id) on delete cascade


confirm_subject text null


confirm_url text null


approved_subject text null


approved_url text null


approved_online_subject text null


approved_online_url text null


onsite_to_online_subject text null


onsite_to_online_url text null


rejected_subject text null


rejected_url text null


created_at, updated_at
 Index : (org_id, event_id)
 FK composite : (event_id, org_id) → events(id, org_id)



13) event_qr_settings (1:1 event – QR payload policy)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null unique references events(id) on delete cascade


mode text not null default 'opaque' -- 'opaque'|'vcard_2_1'|'vcard_3_0'|'fields'


template text null


secret_salt text null


error_correction text null -- 'L'|'M'|'Q'|'H'


include_logo boolean not null default false


created_at, updated_at
 FK composite : (event_id, org_id) → events(id, org_id)



14) attendee_types (catalogue par org)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


code text not null -- 'vip','speaker','staff'…


name text not null


color_hex text not null


text_color_hex text null


icon text null


is_active boolean not null default true


sort_order int not null default 0


created_at, updated_at
 Uniques/Indexes : unique(org_id, code), unique(id, org_id), index(org_id, sort_order), index(org_id, name)



15) event_attendee_types (palette par event, overrides visuels)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null references events(id) on delete cascade


attendee_type_id uuid not null references attendee_types(id) on delete cascade


display_name text null


color_hex text null


text_color_hex text null


is_active boolean not null default true


sort_order int not null default 0


created_at, updated_at
 Uniques/Indexes : unique(id, event_id, org_id), unique(event_id, attendee_type_id), index(org_id, event_id, sort_order)
 FK composites : (event_id, org_id) → events(id, org_id) ; (attendee_type_id, org_id) → attendee_types(id, org_id)



16) attendees (wrapper contact par org)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


person_id uuid not null references persons(id) on delete cascade


default_type_id uuid null references attendee_types(id) on delete set null


labels text[] null


notes text null


created_at, updated_at
 Uniques/Indexes : unique(org_id, person_id), unique(id, org_id), index(org_id), index(person_id)



17) registrations (lien attendee ↔ event + état)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null references events(id) on delete cascade


attendee_id uuid not null references attendees(id) on delete cascade


status text not null -- 'awaiting'|'approved'|'refused'|'cancelled'


attendance_type text check (attendance_type in ('online','onsite','hybrid'))


answers jsonb null


event_attendee_type_id uuid null references event_attendee_types(id) on delete set null


badge_template_id uuid null references badge_templates(id) on delete set null


invited_at timestamptz null


confirmed_at timestamptz null


created_at timestamptz default now()


updated_at timestamptz default now()
 Uniques/Indexes : unique(event_id, attendee_id), unique(id, event_id, org_id), index(org_id, event_id, status), index(org_id, attendee_id), index(org_id, event_id, event_attendee_type_id)
 FK composites :


(event_id, org_id) → events(id, org_id)


(attendee_id, org_id) → attendees(id, org_id)


(event_attendee_type_id, event_id, org_id) → event_attendee_types(id, event_id, org_id)


(optionnel) (badge_template_id, org_id) → badge_templates(id, org_id)



18) badge_templates (catalogue org)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


name text not null


spec jsonb not null


is_default boolean not null default false


created_at, updated_at
 Uniques/Indexes : unique(org_id, name), unique(id, org_id)



19) event_attendee_type_badges (règle par type dans l’event – optionnel)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null references events(id) on delete cascade


event_attendee_type_id uuid not null references event_attendee_types(id) on delete cascade


badge_template_id uuid not null references badge_templates(id) on delete cascade


created_at, updated_at
 Uniques/Indexes : unique(event_id, event_attendee_type_id)
 FK composites : (event_id, org_id) → events(id, org_id) ; (event_attendee_type_id, event_id, org_id) → event_attendee_types(id, event_id, org_id) ; (badge_template_id, org_id) → badge_templates(id, org_id)



20) badges (1:1 avec registration – credential & assets)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null references events(id) on delete cascade


registration_id uuid not null unique references registrations(id) on delete cascade


qr_value text not null


badge_pdf_url text null


badge_html_url text null


badge_image_url text null


created_at, updated_at
 Uniques/Indexes : unique(id, event_id, org_id), unique(event_id, qr_value), index(org_id, event_id)
 FK composites : (event_id, org_id) → events(id, org_id) ; (registration_id, event_id, org_id) → registrations(id, event_id, org_id)



21) badge_prints (journal d’impression – optionnel)
id uuid pk


org_id uuid not null


event_id uuid not null


registration_id uuid not null


badge_id uuid not null references badges(id) on delete cascade


badge_template_id uuid null


device_id text null


printed_by uuid null references users(id)


printed_at timestamptz not null default now()
 FK composites : (event_id, org_id) → events(id, org_id) ; (registration_id, event_id, org_id) → registrations(id, event_id, org_id) ; (optionnel) (printed_by, org_id) → users(id, org_id)



22) subevents (sous-événements)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null references events(id) on delete cascade


title text not null


description text null


start_at timestamptz not null


end_at timestamptz not null


capacity int null


location text null


status text not null default 'scheduled'


created_at, updated_at
 Uniques/FKs : unique(id, event_id, org_id) ; FK composite (event_id, org_id) → events(id, org_id)
 Indexes : index(org_id, event_id, start_at)



23) partner_scans (M:N users ↔ registrations, 1 ligne par scan avec note)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null references events(id) on delete cascade


user_id uuid not null references users(id) on delete cascade -- partner/admin


registration_id uuid not null references registrations(id) on delete cascade


subevent_id uuid null references subevents(id) on delete cascade


device_id text null


source text not null default 'scan' -- 'scan'|'manual'|'import'


note text null


created_at timestamptz default now() -- = scanned_at


updated_at timestamptz default now()
 Indexes : index(org_id, event_id, user_id, created_at), index(org_id, event_id, registration_id, created_at)
 FK composites : (registration_id, event_id, org_id) → registrations(id, event_id, org_id) ; (subevent_id, event_id, org_id) → subevents(id, event_id, org_id) ; (optionnel) (user_id, org_id) → users(id, org_id)



24) event_access (liste blanche des users non-admin)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null references events(id) on delete cascade


user_id uuid not null references users(id) on delete cascade


reason text null


granted_by uuid null references users(id)


expires_at timestamptz null


created_at timestamptz default now(), updated_at timestamptz default now()
 Uniques/Indexes : unique(org_id, event_id, user_id), index(org_id, user_id), index(org_id, event_id)
 FK composite : (event_id, org_id) → events(id, org_id)



25) presence_visits (modèle “intervals” pour la présence)
id uuid pk


org_id uuid not null references organizations(id) on delete cascade


event_id uuid not null references events(id) on delete cascade


registration_id uuid not null references registrations(id) on delete cascade


subevent_id uuid null references subevents(id) on delete cascade -- NULL = gate


in_at timestamptz not null


out_at timestamptz null -- NULL = présent


in_source text not null default 'scan' -- 'scan'|'manual'|'auto'…


out_source text null


in_user_id uuid null references users(id)


out_user_id uuid null references users(id)


voided_at timestamptz null


voided_by uuid null references users(id)


void_reason text null


created_at, updated_at
 FK composites : (event_id, org_id) → events(id, org_id) ; (registration_id, event_id, org_id) → registrations(id, event_id, org_id) ; (subevent_id, event_id, org_id) → subevents(id, event_id, org_id)
 Unicité visite ouverte (partial unique) :
 unique(org_id, registration_id, event_id, coalesce(subevent_id, '00000000-0000-0000-0000-000000000000')) WHERE out_at IS NULL AND voided_at IS NULL
 Indexes : index(org_id, event_id, subevent_id, in_at), index(org_id, registration_id, event_id, subevent_id, out_at)



RELATIONSHIPS (cardinalités)
organizations 1—* users, roles, org_activity_sectors, attendee_types, org_event_types, events


users *—1 roles


roles — permissions (via role_permissions)


org_activity_sectors (adjacency via parent_id, même org)


events 1—1 event_settings ; events 1—1 email_settings ; events 1—1 event_qr_settings


events 1—* subevents ; events 1—* registrations ; events 1—* badges ; events 1—* partner_scans ; events 1—* presence_visits


attendee_types 1—* event_attendee_types ; event_attendee_types 1—* registrations (optionnel)


persons 1—* attendees (par org) ; attendees 1—* registrations


registrations 1—1 badges ; registrations 1—* presence_visits ; registrations 1—* partner_scans


users 1—* partner_scans (scanners)


events 1—* event_access ; users 1—* event_access
