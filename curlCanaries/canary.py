import json
import requests

# ------------------------------------------------------
# TEST SUITE
# ------------------------------------------------------
# test_suite = "shanebodimer.json"
test_suite = "pictureofmonkey.json"

# ------------------------------------------------------
# GLOBAL VARS
# ------------------------------------------------------
BLUE = "\033[94m"
RESET = "\033[0m"
GREEN = "\033[92m"
RED = "\033[91m"

# ------------------------------------------------------
# MAIN
# ------------------------------------------------------
print(" ")
with open(test_suite, "r") as file:
    data = json.load(file)

title = data["url"]
tests = data["tests"]

print(f"Running canaries for: {BLUE}{data['url']}{RESET}")

for test in data['tests']:
    # Compose url to test
    url = test["protocol"] + test["prepend"] + title + test["postpend"]

    # Fetch and evaluate
    try:
        response = requests.get(url)
        
        if test['expect'] in response.text:
            print(f"{GREEN}PASS: {test['title']} passed for:{RESET} {url}")
        else:
            print(f"{RED}FAIL: {test['title']} failed for:{RESET} {url}")

    # Something went wrong with url
    except requests.RequestException as e:
        print(f"{RED}ERROR: Failed to fetch URL {url} {RESET}")
        print(e)

print(" ")



