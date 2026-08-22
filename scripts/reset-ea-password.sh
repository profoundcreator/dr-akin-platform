#!/usr/bin/env bash
# Set EA admin password directly via Supabase Admin API (no email).
# Usage:
#   SUPABASE_SERVICE_ROLE_KEY='eyJ...' ./scripts/reset-ea-password.sh
# Or paste the key when prompted.

set -euo pipefail

EMAIL="${1:-ea@theakinakinpelu.org}"
SUPABASE_URL="${PUBLIC_SUPABASE_URL:-https://isxzrhviqbqmtuhubcsp.supabase.co}"

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  read -r -s -p "Paste Supabase service_role key (hidden): " SUPABASE_SERVICE_ROLE_KEY
  echo ""
fi

if [[ -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
  echo "Missing SUPABASE_SERVICE_ROLE_KEY." >&2
  exit 1
fi

PASSWORD="Akin-EA-$(openssl rand -hex 4)!"

echo "Looking up auth user for $EMAIL..."
USERS_JSON=$(curl -sS "$SUPABASE_URL/auth/v1/admin/users?page=1&per_page=200" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")

USER_ID=$(USERS_JSON="$USERS_JSON" EMAIL="$EMAIL" python3 <<'PY'
import json, os, sys
data = json.loads(os.environ["USERS_JSON"])
email = os.environ["EMAIL"].lower()
for user in data.get("users", []):
    if (user.get("email") or "").lower() == email:
        print(user["id"])
        break
else:
    sys.exit("No auth user found for that email.")
PY
)

echo "Setting temporary password..."
curl -sS -X PUT "$SUPABASE_URL/auth/v1/admin/users/$USER_ID" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$PASSWORD\",\"email_confirm\":true}" >/dev/null

cat <<EOF

--- EA can sign in now ---

Login:    https://dr-akin-platform.vercel.app/admin/login
Email:    $EMAIL
Password: $PASSWORD

Then run this in Supabase SQL Editor if Inbox still blocks access:

UPDATE admin_profiles
SET account_state = 'active',
    session_revoked_at = NULL,
    updated_at = now()
WHERE email = '$EMAIL';

EOF
