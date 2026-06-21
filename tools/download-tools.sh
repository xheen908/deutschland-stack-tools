#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "Downloading ODF Toolkit Validator 0.13.0..."
wget -q -O odfvalidator.jar https://github.com/tdf/odftoolkit/releases/download/v0.13.0/odfvalidator-0.13.0-jar-with-dependencies.jar
echo "✓ ODF Validator downloaded"

echo "Downloading veraPDF 1.26.2..."
wget -q -O verapdf.zip https://github.com/veraPDF/veraPDF-apps/releases/download/v1.26.2/verapdf-1.26.2.zip
unzip -q verapdf.zip
rm verapdf.zip
mv verapdf-* verapdf
echo "✓ veraPDF downloaded to tools/verapdf"

echo "Done. Tools are ready."
