*** Settings ***
Documentation     Test suite for all cabinet-related functionality
Resource          ./common.robot

Suite Setup       Initialize Test Environment
Suite Teardown    Cleanup Test Environment
Test Setup       Reset Test Environment

*** Test Cases ***
Create First Cabinet
    [Documentation]    Test creating the first cabinet
    [Tags]    cabinet    smoke    creation
    Create New Cabinet    ${TEST_CABINET_NAME}
    Verify Cabinet Exists    ${TEST_CABINET_NAME}
    Verify Database State    1    0

Create Additional Cabinet
    [Documentation]    Test creating additional cabinet
    [Tags]    cabinet    creation
    Create New Cabinet    Cabinet 1
    Wait Until Cabinet List Updates
    Create New Cabinet    Cabinet 2
    Verify Cabinet Exists    Cabinet 2
    Verify Database State    2    0
    Wait Until Cabinet List Updates

Create Cabinet With Duplicate Name
    [Documentation]    Test creating cabinet with duplicate name (should fail)
    [Tags]    cabinet    creation    negative
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Element Is Visible    css=.text-red-500    timeout=5s
    Element Should Contain    css=.text-red-500    A cabinet with this name already exists
    Verify Database State    1    0

Create Cabinet With Empty Name
    [Documentation]    Test creating cabinet with empty name (should fail)
    [Tags]    cabinet    creation    negative
    Create New Cabinet    ${EMPTY}
    Wait Until Element Is Visible    css=.text-red-500    timeout=5s
    Element Should Contain    css=.text-red-500    Cabinet name cannot be empty
    Verify Database State    0    0

Create Cabinet With Long Name
    [Documentation]    Test creating cabinet with very long name (should fail)
    [Tags]    cabinet    creation    negative
    Create New Cabinet    ${LONG_CABINET_NAME}
    Wait Until Element Is Visible    css=.text-red-500    timeout=5s
    Element Should Contain    css=.text-red-500    Cabinet name must be 50 characters or less
    Verify Database State    0    0

Create Cabinet With Special Characters
    [Documentation]    Test creating cabinet with special characters (should fail)
    [Tags]    cabinet    creation    negative
    Create New Cabinet    ${SPECIAL_CHARS_NAME}
    Wait Until Element Is Visible    css=.text-red-500    timeout=5s
    Element Should Contain    css=.text-red-500    Cabinet name contains invalid characters
    Verify Database State    0    0

Switch Between Cabinets
    [Documentation]    Test switching between cabinets
    [Tags]    cabinet    navigation
    Create New Cabinet    Cabinet 1
    Wait Until Cabinet List Updates
    Verify Cabinet Exists    Cabinet 1
    Create New Note    Note 1    Content 1
    Wait Until Cabinet List Updates
    
    Create New Cabinet    Cabinet 2
    Wait Until Cabinet List Updates
    Verify Cabinet Exists    Cabinet 2
    Create New Note    Note 2    Content 2
    Wait Until Cabinet List Updates
    
    Switch To Cabinet    Cabinet 1
    Wait Until Cabinet List Updates
    Switch To Cabinet    Cabinet 2
    Wait Until Cabinet List Updates
    Verify Database State    2    2

Verify Note Persistence Across Cabinet Switches
    [Documentation]    Test note persistence when switching cabinets
    [Tags]    cabinet    navigation    persistence
    Create New Cabinet    Cabinet 1
    Wait Until Cabinet List Updates
    Create New Note    Note 1    Content 1
    Create New Note    Note 2    Content 2
    Wait Until Cabinet List Updates
    
    Create New Cabinet    Cabinet 2
    Wait Until Cabinet List Updates
    Create New Note    Note 3    Content 3
    Wait Until Cabinet List Updates
    
    Switch To Cabinet    Cabinet 1
    Wait Until Cabinet List Updates
    Page Should Contain    Note 1
    Page Should Contain    Note 2
    Page Should Not Contain    Note 3
    Verify Database State    2    3

Delete Empty Cabinet
    [Documentation]    Test deleting cabinet with no notes
    [Tags]    cabinet    deletion
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Delete Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Page Should Not Contain    ${TEST_CABINET_NAME}
    Verify Database State    0    0

Delete Cabinet With Notes
    [Documentation]    Test deleting cabinet containing notes
    [Tags]    cabinet    deletion
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create New Note    Note 1    Content 1
    Wait Until Cabinet List Updates
    Delete Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Verify Note Does Not Exist    Note 1
    Verify Database State    1    0

Delete Note From Cabinet
    [Documentation]    Test deleting a note from a cabinet
    [Tags]    cabinet    note    deletion
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create New Note    Note 1    Content 1
    Create New Note    Note 2    Content 2
    Wait Until Cabinet List Updates
    Delete Note    1
    Wait Until Cabinet List Updates
    Verify Note Does Not Exist    Note 1
    Page Should Contain    Note 2
    Verify Database State    1    1

Delete Last Cabinet
    [Documentation]    Test deleting the last cabinet
    [Tags]    cabinet    deletion
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Delete Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Element Should Be Disabled    xpath=//button[@data-testid='add-note-button']
    Verify Database State    0    0

Cancel Cabinet Deletion
    [Documentation]    Test canceling cabinet deletion
    [Tags]    cabinet    deletion
    Create New Cabinet    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Create New Note    Note 1    Content 1
    Wait Until Cabinet List Updates
    Cancel Cabinet Deletion    ${TEST_CABINET_NAME}
    Wait Until Cabinet List Updates
    Page Should Contain    ${TEST_CABINET_NAME}
    Page Should Contain    Note 1
    Verify Database State    1    1