#!/bin/bash

IMPORTFILES=dataset/imports/csv/*.csv
EXPORTFILES=dataset/exports/csv/*.csv

for f in $IMPORTFILES; do
  echo "Processing imports $f"
  tail -n +2 "$f" >> all-imports.csv
done

for f in $EXPORTFILES; do
  echo "Processing exports $f"
  tail -n +2 "$f" >> all-exports.csv
done
