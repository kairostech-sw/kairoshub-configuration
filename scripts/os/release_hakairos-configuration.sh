#!/bin/sh

WORKSPACE_DIR="/home/pi/workspace"
RELEASE_DIR=$WORKSPACE_DIR"/RELEASE"
BACKUP_DIR=$RELEASE_DIR"/BACKUP"
FILENAME_VERSION="hakairos-configuration.VERSION"
CURRENT_TIMESTAMP=`date +%s`

cd $RELEASE_DIR
SOFTWARE_VERSION=`cat $FILENAME_VERSION`

echo "GETTING RELEASE $CURRENT_TIMESTAMP"
REPO="https://github.com/mfinotti/hakairos-configuration/releases/latest/download/hakairos-configuration.zip"
ZIPFILE="hakairos-configuration-release.zip"
wget -c $REPO -O $ZIPFILE
echo "UNPACKAGING ARCHIVE"
unzip $ZIPFILE

echo "CURRENT SOFTWARE VERSION: $SOFTWARE_VERSION"
RELEASE_SOFTWARE_VERSION=`cat $WORKSPACE_DIR/hakairos-configuration/$FILENAME_VERSION`
echo "RELEASE SOFTWARE VERSION: $RELEASE_SOFTWARE_VERSION"

if [ "$SOFTWARE_VERSION" = "$RELEASE_SOFTWARE_VERSION" ]; then
        echo "SOFTWARE UP TO DATE"
        python /home/pi/workspace/hakairos-configuration/scripts/release.py "hakairos-configuration" "UP_TO_DATE"
else
        echo "UPDATING SOFTWARE"
        echo "BACKUP OLD SOFTWARE"
        BACKUP_FILE="hakairos-configuration-"$CURRENT_TIMESTAMP".tar.gz"
        tar -czvf $BACKUP_DIR/$BACKUP_FILE $WORKSPACE_DIR"/hakairos-configuration"
        
        echo "STOPPING CONTAINER.."
        docker stop appdaemon
        echo "MOVING NEW SOFTWARE TO WORKSPACE"
        sudo rsync -a hakairos-configuration $WORKSPACE_DIR
        sleep 5
        echo "PUBLISHING SOFTWARE MANIFEST"
    python /home/pi/workspace/hakairos-configuration/scripts/release.py "hakairos-configuration" $RELEASE_SOFTWARE_VERSION
        echo $RELEASE_SOFTWARE_VERSION | tee $FILENAME_VERSION
        echo "REBOOTING CONTAINER.."
        docker start appdaemon

        chmod +x $WORKSPACE_DIR"/hakairos-configuration/scripts/os/release_hakairos-configuration.sh"
        chmod +x $WORKSPACE_DIR"/hakairos-configuration/scripts/os/release_kairoshub.sh"
fi;

echo "CLEANING ENVIRONMENT..."
rm $RELEASE_DIR/$ZIPFILE
rm -rf $RELEASE_DIR/hakairos-configuration

echo "END"
exit 0