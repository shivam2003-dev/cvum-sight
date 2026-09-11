#!/usr/bin/env bash
set -euo pipefail
OPENSSL=${OPENSSL:-openssl}
LAB=$(mktemp -d)
trap 'rm -rf "$LAB"' EXIT
umask 077
cd "$LAB"
"$OPENSSL" version
"$OPENSSL" req -config /dev/null -x509 -newkey ML-DSA-65 -noenc -keyout root.key -out root.pem -days 2 -subj '/CN=PQC Lab Root' -addext 'basicConstraints=critical,CA:TRUE,pathlen:0' -addext 'keyUsage=critical,keyCertSign,cRLSign'
"$OPENSSL" req -config /dev/null -new -newkey ML-DSA-44 -noenc -keyout leaf.key -out leaf.csr -subj '/CN=localhost'
cat > leaf.ext <<'EOF'
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature
extendedKeyUsage=serverAuth
subjectAltName=DNS:localhost
EOF
"$OPENSSL" x509 -req -in leaf.csr -CA root.pem -CAkey root.key -set_serial 2 -days 1 -extfile leaf.ext -out leaf.pem
"$OPENSSL" verify -CAfile root.pem -purpose sslserver -verify_hostname localhost leaf.pem
if "$OPENSSL" verify -CAfile root.pem -verify_hostname wrong.example leaf.pem > /dev/null 2>&1; then exit 1; fi
"$OPENSSL" x509 -in leaf.pem -outform DER -out leaf.der
"$OPENSSL" x509 -in leaf.pem -noout -text > leaf.txt
python3 - <<'PY'
from pathlib import Path
s=Path('leaf.txt').read_text()
assert 'ML-DSA-65' in s and 'ML-DSA-44' in s
print('Leaf DER bytes:',Path('leaf.der').stat().st_size)
print('PASS: ML-DSA issuer/subject algorithms, trusted path, hostname rejection')
PY
