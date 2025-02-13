*** Settings ***
Library           SeleniumLibrary
Library           RequestsLibrary
Library           Collections
Library           OperatingSystem
Library           Process
Library           pymongo

*** Variables ***
${BROWSER}               chrome
${FRONTEND_URL}         http://localhost:3000
${BACKEND_URL}          http://localhost:5001
${API_URL}              ${BACKEND_URL}/api
${MONGODB_URI}          mongodb://localhost:27017/notes_manager_test
${TEST_CABINET_NAME}    Test Cabinet
${TEST_NOTE_TITLE}      Test Note
${TEST_NOTE_CONTENT}    This is a test note content
${SPECIAL_CHARS_NAME}   Test!@#$%^&*()_+
${LONG_CABINET_NAME}    ThisCabinetNameIsWayTooLongAndShouldFailValidation12345AAAAAAAAAAAAAAAAAAAAA
${TIMEOUT}              2s    # Global timeout for element waits
${DB_TIMEOUT}           0.5s  # Global timeout for database operations
${HEADLESS}             ${FALSE}    # Toggle this to run headless or not

*** Keywords ***
Initialize Test Environment
    [Documentation]    Sets up the test environment including browser and database
    ${options}=    Evaluate    selenium.webdriver.ChromeOptions()    modules=selenium.webdriver
    Call Method    ${options}    add_argument    --no-sandbox
    Call Method    ${options}    add_argument    --disable-dev-shm-usage
    Run Keyword If    ${HEADLESS}    Call Method    ${options}    add_argument    --headless
    Create Webdriver    Chrome    options=${options}
    Set Window Size    1920    1080
    Set Selenium Speed    0.0s    # Remove artificial delay
    Clean Database

Cleanup Test Environment
    [Documentation]    Cleans up all test resources
    Close All Browsers
    Clean Database

Reset Test Environment
    [Documentation]    Resets the test environment between tests
    Clean Database
    Go To    ${FRONTEND_URL}
    Wait Until Element Is Visible    css=.app-container    timeout=5s
    ${overlay_present}=    Run Keyword And Return Status    Element Should Be Visible    css=div[data-state="open"][class*="fixed inset-0"]
    Run Keyword If    ${overlay_present}    Press Keys    None    ESC

Clean Database
    [Documentation]    Completely cleans the test database and verifies the cleanup
    Log    Starting thorough database cleanup...    console=True
    ${mongo}=    Connect To MongoDB
    Clean MongoDB Collections    ${mongo}
    Verify Collections Empty    ${mongo}
    Disconnect From MongoDB    ${mongo}
    Log    Database cleanup completed and verified    console=True

Connect To MongoDB
    [Documentation]    Creates a connection to MongoDB and returns the client
    ${mongo}=    Evaluate    pymongo.MongoClient("${MONGODB_URI}")    modules=pymongo
    [Return]    ${mongo}

Clean MongoDB Collections
    [Documentation]    Deletes all documents from relevant collections
    [Arguments]    ${mongo}
    ${db}=    Evaluate    $mongo.get_database()
    
    # Delete all documents from each collection
    ${cabinets_result}=    Evaluate    $db.cabinets.delete_many({})
    ${notes_result}=    Evaluate    $db.notes.delete_many({})
    
    # Log cleanup results
    Log    Deleted ${cabinets_result.deleted_count} documents from cabinets collection    console=True
    Log    Deleted ${notes_result.deleted_count} documents from notes collection    console=True

Verify Collections Empty
    [Documentation]    Verifies that all collections are empty
    [Arguments]    ${mongo}
    ${db}=    Evaluate    $mongo.get_database()
    
    # Check cabinets collection
    ${cabinet_count}=    Evaluate    $db.cabinets.count_documents({})
    Should Be Equal As Numbers    ${cabinet_count}    0    msg=Cabinets collection still has ${cabinet_count} documents
    
    # Check notes collection
    ${notes_count}=    Evaluate    $db.notes.count_documents({})
    Should Be Equal As Numbers    ${notes_count}    0    msg=Notes collection still has ${notes_count} documents
    
    Log    All collections verified empty    console=True

Disconnect From MongoDB
    [Documentation]    Safely closes the MongoDB connection
    [Arguments]    ${mongo}
    Evaluate    $mongo.close()

Wait For Database Operation
    [Documentation]    Waits for database operations to complete
    [Arguments]    ${timeout}=0.5s
    Sleep    ${timeout}

Create New Cabinet
    [Documentation]    Creates a new cabinet with the given name
    [Arguments]    ${cabinet_name}
    Wait Until Element Is Not Visible    css=div[data-state="open"][class*="fixed inset-0"]    timeout=5s
    Wait Until Element Is Visible    xpath=//*[@data-testid='cabinet-selector']    timeout=5s
    Click Element    xpath=//*[@data-testid='cabinet-selector']
    
    Wait Until Element Is Visible    xpath=//div[contains(@role, 'menu')]//span[text()='New Cabinet']    timeout=5s
    Click Element    xpath=//div[contains(@role, 'menu')]//span[text()='New Cabinet']
    
    Wait Until Element Is Visible    css=input[placeholder='Cabinet name']    timeout=5s
    Input Text    css=input[placeholder='Cabinet name']    ${cabinet_name}
    Wait Until Element Is Visible    xpath=//button[@type='submit'][text()='Create Cabinet']    timeout=5s
    Click Element    xpath=//button[@type='submit'][text()='Create Cabinet']
    Wait For Database Operation

Verify Cabinet Exists
    [Documentation]    Verifies that a cabinet with the given name exists
    [Arguments]    ${cabinet_name}
    Wait Until Element Contains    xpath=//*[@data-testid='cabinet-selector']    ${cabinet_name}    timeout=5s

Create New Note
    [Documentation]    Creates a new note with the given title and content
    [Arguments]    ${note_title}    ${note_content}
    # Click Add Note dropdown trigger
    ${add_note_button}=    Set Variable    //button[contains(@class, 'text-[#6b7280]')][contains(., 'Add Note')]
    Wait Until Element Is Visible    xpath=${add_note_button}    timeout=${TIMEOUT}
    Click Element    xpath=${add_note_button}
    
    # Wait for dropdown and select Standard Note
    Wait Until Element Is Visible    xpath=//div[contains(@role, 'menuitem')]//span[text()='Standard Note']    timeout=${TIMEOUT}
    Click Element    xpath=//div[contains(@role, 'menuitem')]//span[text()='Standard Note']
    
    # Handle title input
    Wait Until Element Is Visible    css=.title-input    timeout=${TIMEOUT}
    Input Text    css=.title-input    ${note_title}
    Press Keys    css=.title-input    TAB
    
    # Target the last note's content editor
    ${content_editor}=    Set Variable    (//div[contains(@class, 'note-wrapper')])[last()]//div[contains(@class, 'ProseMirror')]
    Wait Until Element Is Visible    xpath=${content_editor}    timeout=${TIMEOUT}
    Input Text    xpath=${content_editor}    ${note_content}
    
    # Verify
    Element Should Contain    xpath=${content_editor}    ${note_content}
    Wait For Database Operation    ${DB_TIMEOUT}

Switch To Cabinet
    [Documentation]    Switches to a different cabinet
    [Arguments]    ${cabinet_name}
    Wait Until Element Is Visible    xpath=//*[@data-testid='cabinet-selector']    timeout=5s
    Click Element    xpath=//*[@data-testid='cabinet-selector']
    ${testid}=    Set Variable    cabinet-item-${cabinet_name.replace(' ', '-')}
    Wait Until Element Is Visible    xpath=//*[@data-testid='${testid}']    timeout=5s
    Click Element    xpath=//*[@data-testid='${testid}']
    Click Element    xpath=//*[@data-testid='cabinet-selector']
    Wait For Database Operation

Delete Cabinet
    [Documentation]    Deletes a cabinet with the given name
    [Arguments]    ${cabinet_name}
    Wait Until Element Is Visible    xpath=//*[@data-testid='cabinet-selector']    timeout=5s
    Click Element    xpath=//*[@data-testid='cabinet-selector']
    
    ${dropdown_item}=    Set Variable    xpath=//div[contains(@role, 'menuitem')]//span[text()='${cabinet_name}']
    Wait Until Element Is Visible    ${dropdown_item}    timeout=5s
    Mouse Over    ${dropdown_item}
    Click Element    ${dropdown_item}/../..//button[contains(@class, 'delete-button')]
    
    Wait Until Page Contains    Delete Cabinet    timeout=5s
    Wait Until Page Contains    Are you sure you want to delete ${cabinet_name}?    timeout=5s
    Wait Until Page Contains    This will permanently delete all notes in this cabinet    timeout=5s
    
    Wait Until Element Is Visible    xpath=//*[@data-testid='confirm-delete-cabinet']    timeout=5s
    Click Element    xpath=//*[@data-testid='confirm-delete-cabinet']
    Wait For Database Operation

Cancel Cabinet Deletion
    [Documentation]    Cancels the deletion of a cabinet
    [Arguments]    ${cabinet_name}
    Wait Until Element Is Visible    xpath=//*[@data-testid='cabinet-selector']    timeout=5s
    Click Element    xpath=//*[@data-testid='cabinet-selector']
    
    ${dropdown_item}=    Set Variable    xpath=//div[contains(@role, 'menuitem')]//span[text()='${cabinet_name}']
    Wait Until Element Is Visible    ${dropdown_item}    timeout=5s
    Mouse Over    ${dropdown_item}
    Click Element    ${dropdown_item}/../..//button[contains(@class, 'delete-button')]
    
    Wait Until Page Contains    Delete Cabinet    timeout=5s
    Wait Until Element Is Visible    xpath=//*[@data-testid='cancel-delete-cabinet']    timeout=5s
    Click Element    xpath=//*[@data-testid='cancel-delete-cabinet']

Delete Note
    [Documentation]    Deletes a note at the specified position
    [Arguments]    ${position}
    ${delete_button}=    Set Variable    xpath=(//button[contains(@class, 'delete-button')])[${position}]
    Wait Until Element Is Visible    ${delete_button}    timeout=5s
    Click Element    ${delete_button}
    Wait For Database Operation

Verify Note Does Not Exist
    [Documentation]    Verifies that a note with the given title does not exist
    [Arguments]    ${note_title}
    Page Should Not Contain    ${note_title}

Verify Database State
    [Documentation]    Verifies the current state of the database
    [Arguments]    ${expected_cabinets}    ${expected_notes}
    ${mongo}=    Connect To MongoDB
    ${db}=    Evaluate    $mongo.get_database()
    ${cabinet_count}=    Evaluate    $db.cabinets.count_documents({})
    ${notes_count}=    Evaluate    $db.notes.count_documents({})
    Should Be Equal As Numbers    ${cabinet_count}    ${expected_cabinets}
    Should Be Equal As Numbers    ${notes_count}    ${expected_notes}
    Disconnect From MongoDB    ${mongo}

Wait Until Cabinet List Updates
    [Documentation]    Waits for the cabinet list to update after an operation
    [Arguments]    ${timeout}=0.5s
    Sleep    ${timeout}

Verify Note Order
    [Documentation]    Verifies that notes are in the expected order
    [Arguments]    @{expected_notes}
    FOR    ${index}    ${note_title}    IN ENUMERATE    @{expected_notes}
        ${position}=    Evaluate    ${index} + 1
        ${actual_title}=    Get Text    xpath=//div[@data-position='${position}']//div[contains(@class, 'title-display')]
        Should Be Equal    ${actual_title}    ${note_title}
    END