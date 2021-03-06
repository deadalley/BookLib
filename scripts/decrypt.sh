#!/bin/bash

PASSPHRASE=${SSL_PASSWORD}
DIR=./src/environments

openssl version
for FILE in $(ls "${DIR}"/*.ssl); do
    echo "Decrypting $FILE to ${FILE%.ssl}"
    echo openssl aes-256-cbc -d -a -salt -md sha256 -pass pass:"$PASSPHRASE" -in $FILE -out ${FILE%.ssl}
    openssl aes-256-cbc -d -a -salt -md sha256 -pass pass:"$PASSPHRASE" -in $FILE -out ${FILE%.ssl}
done