#!/bin/sh

WORKSPACE_DIR="/home/pi/workspace"
RELEASE_DIR=$WORKSPACE_DIR"/RELEASE"
BACKUP_DIR=$RELEASE_DIR"/BACKUP"
FILENAME_VERSION="kairoshub.VERSION"
CURRENT_TIMESTAMP=`date +%s`
CONTAINER_NAME="kairoshub"

cd $RELEASE_DIR
SOFTWARE_VERSION=`cat $FILENAME_VERSION`

echo "GETTING RELEASE $CURRENT_TIMESTAMP"
REPO="https://github.com/mfinotti/kairoshub/releases/latest/download/kairoshub.zip"
ZIPFILE="kairoshub-relase.zip"
wget -c $REPO -O $ZIPFILE
echo "UNPACKAGING ARCHIVE"
unzip $ZIPFILE

echo "CURRENT SOFTWARE VERSION: $SOFTWARE_VERSION"
RELEASE_SOFTWARE_VERSION=`cat $WORKSPACE_DIR/kairoshub/$FILENAME_VERSION`
echo "RELEASE SOFTWARE VERSION: $RELEASE_SOFTWARE_VERSION"

if [ "$SOFTWARE_VERSION" = "$RELEASE_SOFTWARE_VERSION" ]; then
        echo "SOFTWARE UP TO DATE"
        python /home/pi/workspace/hakairos-configuration/scripts/release.py "kairoshub" "UP_TO_DATE"
else
        echo "UPDATING SOFTWARE"
        echo "BACKUP OLD SOFTWARE"
        BACKUP_FILE="kairoshub-"$CURRENT_TIMESTAMP".tar.gz"
        tar -czvf $BACKUP_DIR/$BACKUP_FILE $WORKSPACE_DIR"/kairoshub"

        echo "STOPPING CONTAINER..."
        docker stop $CONTAINER_NAME
        echo "MOVING NEW SOFTWARE TO WORKSPACE"
        sudo rsync -a kairoshub $WORKSPACE_DIR
        sleep 5
        echo "PUBLISHING SOFTWARE MANIFEST $RELEASE_SOFTWARE_VERSION"
        python /home/pi/workspace/hakairos-configuration/scripts/release.py "kairoshub" $RELEASE_SOFTWARE_VERSION
        echo $RELEASE_SOFTWARE_VERSION | tee $FILENAME_VERSION
        echo "REBOOTING CONTAINER.."
        docker restart $CONTAINER_NAME
fi;

echo "CLEANING ENVIRONMENT..."
rm $RELEASE_DIR/$ZIPFILE
rm -rf $RELEASE_DIR/kairoshub

echo "END"
exit 0