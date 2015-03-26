#!/bin/bash
./killvpn.sh
./hma-vpn.sh -p tcp ${HMA_FILTER}
