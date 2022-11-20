#!/bin/sh

REPOPATH=dist/ocpi-types/chargemap-ocpi

mkdir -p dist/ocpi-types
mkdir -p src/ocpimsgs

if [ ! -d "$REPOPATH" ]; then
    git clone git@github.com:ChargeMap/ocpi-protocol.git dist/ocpi-types/chargemap-ocpi
else
    pushd .
    cd "$REPOPATH"
    git pull
    popd
fi

find dist/ocpi-types/chargemap-ocpi/resources/jsonSchemas -name '*.json' | while read x
do 
      echo "Typescriptifying $x"
      schemafilebasename=`basename "$x"`
      tsfilebasename=`echo "$schemafilebasename" | sed s/\.json$/.ts/`
      tsfilename="src/ocpimsgs/$tsfilebasename"
      npx json2ts --cwd $(dirname "$x") "$x" > "$tsfilename"
done


