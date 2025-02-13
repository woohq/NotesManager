*** Settings ***
Documentation     Test suite for standard note functionality
Resource          ./common.robot

Suite Setup       Initialize Test Environment
Suite Teardown    Cleanup Test Environment
Test Setup       Reset Test Environment

*** Variables ***
${NOTE_EDITOR}    css=.ProseMirror[contenteditable="true"]
${TITLE_DISPLAY}    css=div[data-testid="note-title"]
${TITLE_INPUT}    css=div[data-testid="note-title-input"]
${ADD_NOTE_BTN}    xpath=//button[contains(@class, 'text-[#6b7280]')][contains(., 'Add Note')]
${STANDARD_NOTE_OPTION}    xpath=//div[contains(@role, 'menuitem')]//span[text()='Standard Note']

*** Keywords ***
Create Standard Note
    [Arguments]    ${title}=${EMPTY}    ${content}=${EMPTY}
    Click Element    ${ADD_NOTE_BTN}
    Wait Until Element Is Visible    ${STANDARD_NOTE_OPTION}    timeout=5s
    Click Element    ${STANDARD_NOTE_OPTION}
    
    # Wait for note to be created and editor to be ready
    Wait Until Element Is Visible    ${NOTE_EDITOR}    timeout=5s
    Sleep    1s
    
    # Enter title if provided
    Run Keyword If    '${title}' != '${EMPTY}'    Input Text    ${NOTE_EDITOR}    ${title}
    
    # Enter content if provided
    Run Keyword If    '${content}' != '${EMPTY}'    Input Text    ${NOTE_EDITOR}    ${content}
    
    # Ensure focus moves away from the editor
    Press Keys    ${NOTE_EDITOR}    TAB
    Wait For Database Operation    1s

*** Test Cases ***
Basic Text Input
    [Documentation]    Test basic text input functionality in standard notes
    [Tags]    standard    content    smoke
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create Standard Note    ${TEST_NOTE_TITLE}    ${TEST_NOTE_CONTENT}
    
    # Verify content
    Element Should Contain    ${NOTE_EDITOR}    ${TEST_NOTE_CONTENT}
    Wait Until Element Contains    ${TITLE_DISPLAY}    ${TEST_NOTE_TITLE}    timeout=5s
    Verify Database State    1    1

Content Auto Save
    [Documentation]    Verify content saves automatically after changes
    [Tags]    standard    content    autosave
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create Standard Note    Initial Title    Initial Content
    
    # Update content
    Wait Until Element Is Visible    ${NOTE_EDITOR}    timeout=5s
    Clear Element Text    ${NOTE_EDITOR}
    Input Text    ${NOTE_EDITOR}    Updated Content
    Press Keys    ${NOTE_EDITOR}    TAB
    Wait For Database Operation    2s
    
    # Refresh and verify persistence
    Reload Page
    Wait Until Element Is Visible    ${NOTE_EDITOR}    timeout=5s
    Element Should Contain    ${NOTE_EDITOR}    Updated Content
    Verify Database State    1    1

Content Persistence After Refresh
    [Documentation]    Test content persistence after page refresh
    [Tags]    standard    content    persistence
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create Standard Note    ${TEST_NOTE_TITLE}    ${TEST_NOTE_CONTENT}
    
    # Refresh and verify
    Reload Page
    Wait Until Element Is Visible    ${NOTE_EDITOR}    timeout=5s
    Element Should Contain    ${NOTE_EDITOR}    ${TEST_NOTE_CONTENT}
    Verify Database State    1    1

Empty Title Shows Untitled
    [Documentation]    Verify "Untitled" appears when title is empty
    [Tags]    standard    title
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create Standard Note    content=${TEST_NOTE_CONTENT}
    
    # Verify "Untitled" appears
    Wait Until Element Contains    ${TITLE_DISPLAY}    Untitled    timeout=5s
    
    # Verify it persists after refresh
    Reload Page
    Wait Until Element Contains    ${TITLE_DISPLAY}    Untitled    timeout=5s
    Verify Database State    1    1

Edit And Save Empty Fields
    [Documentation]    Test editing and saving with empty fields
    [Tags]    standard    content    empty
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create Standard Note    Initial Title    Initial Content
    
    # Clear content
    Wait Until Element Is Visible    ${NOTE_EDITOR}    timeout=5s
    Clear Element Text    ${NOTE_EDITOR}
    Press Keys    ${NOTE_EDITOR}    TAB
    Wait For Database Operation    1s
    
    # Clear title (by setting empty content)
    Click Element    ${TITLE_DISPLAY}
    Input Text    ${NOTE_EDITOR}    ${EMPTY}
    Press Keys    ${NOTE_EDITOR}    TAB
    Wait For Database Operation    1s
    
    # Verify empty state
    Element Should Not Contain    ${NOTE_EDITOR}    Initial Content
    Wait Until Element Contains    ${TITLE_DISPLAY}    Untitled    timeout=5s
    Verify Database State    1    1

Multiple Standard Notes
    [Documentation]    Test creating and managing multiple standard notes
    [Tags]    standard    multiple
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    
    # Create three notes
    FOR    ${index}    IN RANGE    1    4
        Create Standard Note    Note ${index}    Content ${index}
        Wait For Database Operation    1s
    END
    
    # Verify all notes
    FOR    ${index}    IN RANGE    1    4
        ${note_title}=    Set Variable    (${TITLE_DISPLAY})[${index}]
        ${note_content}=    Set Variable    (${NOTE_EDITOR})[${index}]
        
        Wait Until Element Is Visible    ${note_title}    timeout=5s
        Wait Until Element Is Visible    ${note_content}    timeout=5s
        
        Element Should Contain    ${note_title}    Note ${index}
        Element Should Contain    ${note_content}    Content ${index}
    END
    
    Verify Database State    1    3

Note Content HTML Sanitization
    [Documentation]    Test that HTML content is properly sanitized
    [Tags]    standard    content    security
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create Standard Note    HTML Test    <p>Safe content</p><script>alert('test')</script>
    
    # Verify sanitization
    Wait Until Element Is Visible    ${NOTE_EDITOR}    timeout=5s
    ${content}=    Get Text    ${NOTE_EDITOR}
    
    # Verify safe content remains and dangerous content is removed
    Should Contain    ${content}    Safe content
    Should Not Match Regexp    ${content}    .*<script>.*
    Should Not Match Regexp    ${content}    .*alert\\('test'\\).*
    Should Not Match Regexp    ${content}    .*<p>.*
    
    Verify Database State    1    1