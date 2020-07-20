#!/bin/bash

TR_TORRENT_DIR=${TR_TORRENT_DIR:-$1}
TR_TORRENT_NAME=${TR_TORRENT_NAME:-$2}
TR_TORRENT_ID=${TR_TORRENT_ID:-$3}
IS_DIRECTORY=0
UPLOAD_DIR=_Subidas
REMOTE=Google

if [[ -d "$TR_TORRENT_DIR/$TR_TORRENT_NAME" ]]; then
    IS_DIRECTORY=1
elif [[ -f "$TR_TORRENT_DIR/$TR_TORRENT_NAME" ]]; then
    IS_DIRECTORY=0
else
    IS_DIRECTORY=-1
    exit 1
fi

curl -s --data-urlencode "upload_dir=$UPLOAD_DIR" --data-urlencode "file_dir=$TR_TORRENT_DIR" --data-urlencode "file_name=$TR_TORRENT_NAME" --data-urlencode "is_directory=$IS_DIRECTORY" --data-urlencode "remote=$REMOTE"  -X POST http://localhost:3040/api/save > /dev/null