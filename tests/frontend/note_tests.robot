*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BROWSER}        chrome
${SERVER}         localhost:3000

*** Test Cases ***
Homepage Should Load
    Open Browser    http://${SERVER}    ${BROWSER}
    Title Should Be    Notes Manager
    Page Should Contain    Notes Manager
    [Teardown]    Close Browser