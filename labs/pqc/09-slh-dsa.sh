#!/usr/bin/env bash
set -euo pipefail
OPENSSL=${OPENSSL:-openssl}
LAB=$(mktemp -d)
trap 'rm -rf "$LAB"' EXIT
umask 077
cd "$LAB"
"$OPENSSL" version
printf '%s\n' 'firmware manifest: demonstration only' > message.txt
for variant in SLH-DSA-SHA2-128s SLH-DSA-SHA2-128f; do
 "$OPENSSL" genpkey -algorithm "$variant" -out private.pem
 "$OPENSSL" pkey -in private.pem -pubout -out public.pem
 "$OPENSSL" pkeyutl -sign -rawin -inkey private.pem -in message.txt -out signature.bin
 "$OPENSSL" pkeyutl -verify -rawin -pubin -inkey public.pem -in message.txt -sigfile signature.bin
 python3 - "$variant" <<'PY'
import sys
from pathlib import Path
expected = 7856 if sys.argv[1].endswith('128s') else 17088
assert Path('signature.bin').stat().st_size == expected
print(sys.argv[1], 'signature bytes:', expected)
PY
 printf 'altered' > changed.txt
 if "$OPENSSL" pkeyutl -verify -rawin -pubin -inkey public.pem -in changed.txt -sigfile signature.bin > /dev/null 2>&1; then exit 1; fi
done
printf '%s\n' 'PASS: both variants verify and reject changed messages'
