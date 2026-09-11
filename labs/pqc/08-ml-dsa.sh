#!/usr/bin/env bash
set -euo pipefail
OPENSSL=${OPENSSL:-openssl}
LAB=$(mktemp -d)
trap 'rm -rf "$LAB"' EXIT
umask 077
cd "$LAB"
"$OPENSSL" version
printf '%s\n' 'release=1; artifact=example; environment=lab' > message.txt
"$OPENSSL" genpkey -algorithm ML-DSA-65 -out private.pem
"$OPENSSL" pkey -in private.pem -pubout -out public.pem
"$OPENSSL" pkeyutl -sign -rawin -inkey private.pem -in message.txt -out signature.bin -pkeyopt context-string:pqc-course
"$OPENSSL" pkeyutl -verify -rawin -pubin -inkey public.pem -in message.txt -sigfile signature.bin -pkeyopt context-string:pqc-course
python3 - <<'PY'
from pathlib import Path
assert len(Path('signature.bin').read_bytes()) == 3309
Path('changed.txt').write_bytes(Path('message.txt').read_bytes() + b'changed')
PY
if "$OPENSSL" pkeyutl -verify -rawin -pubin -inkey public.pem -in changed.txt -sigfile signature.bin -pkeyopt context-string:pqc-course > /dev/null 2>&1; then exit 1; fi
if "$OPENSSL" pkeyutl -verify -rawin -pubin -inkey public.pem -in message.txt -sigfile signature.bin -pkeyopt context-string:wrong-context > /dev/null 2>&1; then exit 1; fi
for i in 1 2; do
 "$OPENSSL" pkeyutl -sign -rawin -inkey private.pem -in message.txt -out "det$i.bin" -pkeyopt deterministic:1 -pkeyopt context-string:pqc-course
done
cmp det1.bin det2.bin
printf '%s\n' 'PASS: verification, 3309-byte signature, tamper rejection, context binding, deterministic repeat'
