#!/usr/bin/env bash
set -euo pipefail
OPENSSL=${OPENSSL:-openssl}
LAB=$(mktemp -d)
trap 'rm -rf "$LAB"' EXIT
umask 077
cd "$LAB"
"$OPENSSL" version
"$OPENSSL" genpkey -algorithm ML-KEM-768 -out private.pem
"$OPENSSL" pkey -in private.pem -pubout -out public.pem
"$OPENSSL" pkeyutl -encap -pubin -inkey public.pem -out ciphertext.bin -secret sender.bin
"$OPENSSL" pkeyutl -decap -inkey private.pem -in ciphertext.bin -secret recipient.bin
cmp sender.bin recipient.bin
python3 - <<'PY'
from pathlib import Path
c = bytearray(Path('ciphertext.bin').read_bytes())
assert len(c) == 1088
assert len(Path('sender.bin').read_bytes()) == 32
c[0] ^= 1
Path('corrupted.bin').write_bytes(c)
Path('truncated.bin').write_bytes(c[:-1])
PY
"$OPENSSL" pkeyutl -decap -inkey private.pem -in corrupted.bin -secret rejected.bin
if cmp -s sender.bin rejected.bin; then
  echo 'Unexpected matching secret after corruption' >&2; exit 1
fi
if "$OPENSSL" pkeyutl -decap -inkey private.pem -in truncated.bin -secret unused.bin 2>error.log; then
  echo 'Unexpected acceptance of truncated ciphertext' >&2; exit 1
fi
printf '%s\n' 'PASS: agreement, 1088-byte ciphertext, 32-byte secret, implicit rejection, length rejection'
