#!/bin/sh
set -eu
OPENSSL=${OPENSSL:-openssl}
"$OPENSSL" version -a
umask 077
work=$(mktemp -d)
cd "$work"
printf 'release=1\n' > message.txt
"$OPENSSL" dgst -sha256 message.txt
"$OPENSSL" genpkey -algorithm ED25519 -out signing.pem
"$OPENSSL" pkey -in signing.pem -pubout -out verify.pem
"$OPENSSL" pkeyutl -sign -rawin -inkey signing.pem \
  -in message.txt -out signature.bin
"$OPENSSL" pkeyutl -verify -rawin -pubin -inkey verify.pem \
  -in message.txt -sigfile signature.bin
printf 'release=2\n' > changed.txt
if "$OPENSSL" pkeyutl -verify -rawin -pubin -inkey verify.pem \
  -in changed.txt -sigfile signature.bin; then
  echo 'ERROR: modified message accepted' >&2
  exit 1
fi
