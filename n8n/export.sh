#!/usr/bin/env bash
# Exporta los workflows de Job Hunter a este repo, listos para commitear.
#
#   ./n8n/export.sh
#
# Corre contra el contenedor de n8n en Docker. No toca nada de n8n:
# solo lee y sobrescribe los .json de esta carpeta.

set -euo pipefail

CONTAINER="${N8N_CONTAINER:-n8n}"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="/tmp/n8n-export"

# Solo se exportan los workflows cuyo nombre empiece así
PREFIX="Job Hunter"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "El contenedor '$CONTAINER' no está corriendo. Abrí Docker Desktop e intentá de nuevo." >&2
  exit 1
fi

echo "Exportando desde el contenedor '$CONTAINER'..."
docker exec "$CONTAINER" rm -rf "$TMP"
docker exec "$CONTAINER" mkdir -p "$TMP"
docker exec "$CONTAINER" n8n export:workflow --all --separate --pretty --output="$TMP" >/dev/null

STAGING="$(mktemp -d)"
trap 'rm -rf "$STAGING"' EXIT
docker cp "$CONTAINER:$TMP/." "$STAGING/"
docker exec "$CONTAINER" rm -rf "$TMP"

count=0
for file in "$STAGING"/*.json; do
  [ -e "$file" ] || continue
  name="$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['name'])" "$file")"
  case "$name" in
    "$PREFIX"*) ;;
    *) continue ;;
  esac
  slug="$(python3 -c "import re,sys; print(re.sub(r'-+','-',re.sub(r'[^a-z0-9]','-',sys.argv[1].lower())).strip('-'))" "$name")"
  cp "$file" "$DEST/$slug.json"
  echo "  $slug.json  <-  $name"
  count=$((count + 1))
done

echo "$count workflows exportados a $DEST"
[ "$count" -eq 3 ] || echo "AVISO: se esperaban 3 workflows de Job Hunter." >&2

echo
echo "Revisa los cambios antes de commitear:  git status n8n"