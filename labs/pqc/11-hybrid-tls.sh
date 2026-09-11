#!/usr/bin/env bash
set -euo pipefail
OPENSSL=${OPENSSL:-openssl}
LAB=$(mktemp -d)
SERVER_PID=''
cleanup() { if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; fi; rm -rf "$LAB"; }
trap cleanup EXIT
umask 077
cd "$LAB"
"$OPENSSL" version
PORT=$(python3 - <<'PY'
import socket
with socket.socket() as s:
 s.bind(('127.0.0.1',0)); print(s.getsockname()[1])
PY
)
"$OPENSSL" req -config /dev/null -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -noenc -keyout key.pem -out cert.pem -days 1 -subj /CN=localhost -addext subjectAltName=DNS:localhost > /dev/null 2>&1
"$OPENSSL" s_server -accept "127.0.0.1:$PORT" -cert cert.pem -key key.pem -tls1_3 -groups X25519MLKEM768 -www > server.log 2>&1 &
SERVER_PID=$!
python3 - "$PORT" <<'PY'
import socket,sys,time
for _ in range(50):
 try:
  with socket.create_connection(('127.0.0.1',int(sys.argv[1])),timeout=.2): break
 except OSError: time.sleep(.1)
else: raise SystemExit('server did not become ready')
PY
printf 'GET / HTTP/1.0\r\n\r\n' | "$OPENSSL" s_client -connect "127.0.0.1:$PORT" -servername localhost -verify_hostname localhost -verify_return_error -CAfile cert.pem -tls1_3 -groups X25519MLKEM768 > client.log 2>&1
python3 - <<'PY'
from pathlib import Path
s=Path('client.log').read_text()
assert 'X25519MLKEM768' in s
assert 'Verify return code: 0 (ok)' in s
for line in s.splitlines():
 if any(x in line for x in ('Negotiated TLS1.3 group','Server Temp Key','Verify return code','SSL handshake has read')): print(line)
PY
if printf '' | "$OPENSSL" s_client -connect "127.0.0.1:$PORT" -servername localhost -CAfile cert.pem -tls1_3 -groups X25519 > negative.log 2>&1; then
 echo 'Unexpected classical-only negotiation' >&2; exit 1
fi
printf '%s\n' 'PASS: authenticated local hybrid TLS and incompatible-group rejection'
