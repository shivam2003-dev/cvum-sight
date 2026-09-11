#!/usr/bin/env bash
set -euo pipefail
LAB_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
OPENSSL=${OPENSSL:-openssl}
export OPENSSL
"$OPENSSL" version -a
"$OPENSSL" list -providers
"$OPENSSL" list -kem-algorithms
"$OPENSSL" list -signature-algorithms
python3 "$LAB_DIR/03-quantum-toys.py"
python3 "$LAB_DIR/04-mathematics.py"
python3 "$LAB_DIR/06-ntt.py"
for script in 02-foundations.sh 07-ml-kem.sh 08-ml-dsa.sh 09-slh-dsa.sh 11-hybrid-tls.sh 12-pki.sh; do
 bash "$LAB_DIR/$script"
done
"$OPENSSL" speed -testmode ML-KEM-768 ML-DSA-65 SLH-DSA-SHA2-128s
printf '%s\n' 'PASS: complete PQC course functional suite'
