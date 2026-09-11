#!/usr/bin/env bash
set -euo pipefail
PREFIX=${1:?Usage: build-openssl.sh ABSOLUTE_INSTALL_PREFIX}
case "$PREFIX" in /*) ;; *) echo 'Use an absolute prefix' >&2; exit 1;; esac
VERSION=3.5.8
SHA256=a8f84a39918ec6415ce765d9b429d313ba97b8143169c172e734b9514464f5b2
BUILD=$(mktemp -d)
trap 'rm -rf "$BUILD"' EXIT
cd "$BUILD"
curl --fail --location --retry 3 "https://github.com/openssl/openssl/releases/download/openssl-$VERSION/openssl-$VERSION.tar.gz" -o openssl.tar.gz
python3 - "$SHA256" <<'PY'
import hashlib,sys
assert hashlib.sha256(open('openssl.tar.gz','rb').read()).hexdigest() == sys.argv[1], 'checksum mismatch'
PY
tar -xzf openssl.tar.gz
cd "openssl-$VERSION"
./Configure --prefix="$PREFIX" no-shared
make -j "${BUILD_JOBS:-2}"
make install_sw
"$PREFIX/bin/openssl" version
