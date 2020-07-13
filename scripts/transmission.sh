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

curl -s -d "upload_dir=$UPLOAD_DIR&file_dir=$TR_TORRENT_DIR&file_name=$TR_TORRENT_NAME&is_directory=$IS_DIRECTORY&remote=$REMOTE" -X POST http://localhost:3000/api/save > /dev/null
