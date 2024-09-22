#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

do_work() {
    # curl and use -L to follow and -s to silence status output
    html_content=$(curl -s -L "$url")

    # Check if curl was successful
    if [ $? -eq 0 ]; then
        if [[ $html_content =~ "ListBucketResult" ]]; then
            echo -e "${RED}FAIL - ListBucketResult returned - ${url}${NC}"
        # check if html returned includes monkey (good load)
        elif [[ $html_content =~ "monkey.jpg" ]]; then
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
    'pictureofmonkey.com'
    'pictureofmonkey.com/should404andshowmonkey'
    'https://pictureofmonkey.com'
    'http://pictureofmonkey.com'
    'www.pictureofmonkey.com'
    'https://www.pictureofmonkey.com'
    'http://www.pictureofmonkey.com'
    'http://www.pictureofmonkey.com/should404andshowmonkey'
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

