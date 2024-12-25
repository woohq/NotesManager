*** Settings ***
Documentation     Smoke tests for Notes Manager application
Resource          ../../resources/common.robot
Test Setup        Open Notes Application
Test Teardown     Close Notes Application

*** Test Cases ***
Application Should Load Successfully
    [Documentation]    Verify that the application loads and shows the main interface
    [Tags]    smoke    critical
    # Log current state
    ${url}=    Get Location
    Log    Current URL: ${url}
    ${title}=    Get Title
    Log    Page Title: ${title}
    ${source}=    Get Source
    Log    Page Source: ${source}
    
    # Basic visibility checks with logging
    ${container_visible}=    Run Keyword And Return Status    
    ...    Page Should Contain Element    css=.app-container
    Log    App Container Visible: ${container_visible}
    
    ${wrapper_visible}=    Run Keyword And Return Status    
    ...    Page Should Contain Element    css=.content-wrapper
    Log    Content Wrapper Visible: ${wrapper_visible}
    
    ${header_visible}=    Run Keyword And Return Status    
    ...    Page Should Contain Element    css=.cabinet-header
    Log    Cabinet Header Visible: ${header_visible}
    
    # Final assertions
    Should Be True    ${container_visible}    App container not found
    Should Be True    ${wrapper_visible}    Content wrapper not found
    Should Be True    ${header_visible}    Cabinet header not found

Create And Verify Standard Note
    [Documentation]    Create a standard note and verify its presence
    [Tags]    smoke    notes
    # Wait for and verify Add Note button
    Wait Until Element Is Visible    css=.add-action-button    timeout=${DEFAULT_WAIT_TIME}
    
    # Create note with logging
    ${create_success}=    Run Keyword And Return Status    Create New Note
    Log    Note Creation Success: ${create_success}
    
    # Verify note existence
    ${note_visible}=    Run Keyword And Return Status    Verify Note Exists
    Log    Note Visible: ${note_visible}
    
    # Enter and verify title
    Enter Note Title    Test Note
    Page Should Contain    Test Note
    
    # Enter and verify content
    Enter Note Content    This is a test note content
    Page Should Contain    This is a test note content

Delete Note Operation
    [Documentation]    Create a note and then delete it
    [Tags]    smoke    notes
    # Create note first
    Wait Until Element Is Visible    css=.add-action-button    timeout=${DEFAULT_WAIT_TIME}
    Create New Note
    Enter Note Title    Note To Delete
    
    # Verify note exists before deletion
    ${note_present}=    Run Keyword And Return Status    
    ...    Page Should Contain Element    css=.note:nth-child(1)
    Log    Note Present Before Deletion: ${note_present}
    
    # Delete note
    Delete Note
    
    # Verify note is gone
    ${note_absent}=    Run Keyword And Return Status    
    ...    Page Should Not Contain Element    css=.note:nth-child(1)
    Log    Note Absent After Deletion: ${note_absent}
    Should Be True    ${note_absent}    Note was not properly deleted