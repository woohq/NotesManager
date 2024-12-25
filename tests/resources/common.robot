*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem
Library    Process

*** Variables ***
${BROWSER}              chrome
${SELENIUM_SPEED}       0.5
${SELENIUM_TIMEOUT}     30
${APP_URL}             http://localhost:3000
${DEFAULT_WAIT_TIME}   30
${CHROME_OPTIONS}      add_argument("--disable-dev-shm-usage");add_argument("--no-sandbox");add_argument("--disable-gpu");add_argument("--disable-extensions");add_argument("--disable-software-rasterizer")

*** Keywords ***
Open Notes Application
    ${chrome_options}=    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    Call Method    ${chrome_options}    add_argument    --disable-dev-shm-usage
    Call Method    ${chrome_options}    add_argument    --no-sandbox
    Call Method    ${chrome_options}    add_argument    --disable-gpu
    Call Method    ${chrome_options}    add_argument    --disable-extensions
    Call Method    ${chrome_options}    add_argument    --disable-software-rasterizer
    
    Create Webdriver    Chrome    chrome_options=${chrome_options}
    Set Window Size    1920    1080
    Go To    ${APP_URL}
    Set Selenium Speed    ${SELENIUM_SPEED}
    Set Selenium Timeout    ${SELENIUM_TIMEOUT}
    
    # Add debug logging
    Log    Current URL: ${APP_URL}
    ${page_source}=    Get Source
    Log    Page Source: ${page_source}
    
    # Wait for React to load and render
    Wait Until Page Contains Element    css=body    timeout=${DEFAULT_WAIT_TIME}
    Wait Until Page Does Not Contain Element    css=.loading    timeout=${DEFAULT_WAIT_TIME}
    Wait Until Element Is Visible    css=.app-container    timeout=${DEFAULT_WAIT_TIME}
    
Close Notes Application
    Close All Browsers

Wait For Loading
    Sleep    2s    # Increased wait time for React components
    
Create New Note
    [Arguments]    ${note_type}=standard
    Wait Until Element Is Visible    css=.add-action-button    timeout=${DEFAULT_WAIT_TIME}
    Click Element    css=.add-action-button
    Wait For Loading
    Wait Until Element Is Visible    css=.note-header    timeout=${DEFAULT_WAIT_TIME}

Delete Note
    [Arguments]    ${index}=1
    Wait Until Element Is Visible    css=.note:nth-child(${index}) .delete-button    timeout=${DEFAULT_WAIT_TIME}
    Click Element    css=.note:nth-child(${index}) .delete-button
    Wait For Loading

Verify Note Exists
    [Arguments]    ${index}=1
    Wait Until Element Is Visible    css=.note:nth-child(${index})    timeout=${DEFAULT_WAIT_TIME}

Enter Note Title
    [Arguments]    ${title}    ${index}=1
    Wait Until Element Is Visible    css=.note:nth-child(${index}) .title-input    timeout=${DEFAULT_WAIT_TIME}
    Input Text    css=.note:nth-child(${index}) .title-input    ${title}
    Press Keys    css=.note:nth-child(${index}) .title-input    RETURN
    Wait For Loading

Enter Note Content
    [Arguments]    ${content}    ${index}=1
    Wait Until Element Is Visible    css=.note:nth-child(${index}) .ProseMirror    timeout=${DEFAULT_WAIT_TIME}
    Input Text    css=.note:nth-child(${index}) .ProseMirror    ${content}
    Wait For Loading