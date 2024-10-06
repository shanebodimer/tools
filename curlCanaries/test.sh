#!/bin/bash

# ########################################################
# TEST SUITES
# ########################################################
# domain='pictureofmonkey.com'
# validator='monkey.jpg'
domain='shanebodimer.com'
validator='Nova'

# Not implemented.... switching to python...
# has404=true
# 404validator='404 bro'

# ########################################################
# GLOBAL VARS
# ########################################################
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# ########################################################
# FUNCTIONS
# ########################################################
do_work() {
    # curl and use -L to follow and -s to silence status output
    html_content=$(curl -s -L "$url")

    # Check if curl was successful
    if [ $? -eq 0 ]; then
        if [[ $html_content =~ "ListBucketResult" ]]; then
            echo -e "${RED}FAIL - ListBucketResult returned - ${url}${NC}"
        # check if html returned includes monkey (good load)
        elif [[ $html_content =~ $validator ]]; then
            echo -e "${GREEN}PASS - ${url}${NC}"
        else
            echo -e "${RED}FAIL - something else returned - ${url}${NC}"
            # echo "$html_content"
        fi
    else
        echo -e "${RED}FAIL - other curl error - ${url}${NC}"
        exit 1
    fi
}


urls=(
    ${domain}
    ${domain}'/should404andshowhomepage'
    'https://'${domain}
    'http://'${domain}
    'www.'${domain}
    'https://www.'${domain}
    'http://www.'${domain}
    'http://www.'${domain}'/should404andshowhomepage'
)

echo ""

for url in "${urls[@]}"
do
    do_work "$url" &
done

wait

echo ""
echo "all tests completed"
echo ""

