#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "Downloading ODF Toolkit Validator 0.13.0..."
wget -q -O odftoolkit.zip https://github.com/tdf/odftoolkit/releases/download/v0.13.0/odftoolkit-0.13.0-bin.zip
unzip -q odftoolkit.zip odfvalidator-0.13.0-jar-with-dependencies.jar
mv odfvalidator-0.13.0-jar-with-dependencies.jar odfvalidator.jar
rm odftoolkit.zip
echo "✓ ODF Validator downloaded"

echo "Downloading veraPDF..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is required to download veraPDF. Please install docker first."
    exit 1
fi

docker pull verapdf/cli:latest
container_id=$(docker create verapdf/cli:latest)
docker cp $container_id:/opt/verapdf ./verapdf
docker rm $container_id
echo "✓ veraPDF downloaded to tools/verapdf"

echo "Done. Tools are ready."
