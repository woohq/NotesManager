*** Settings ***
Documentation     Test Suite for Notes Manager Application
Library          SeleniumLibrary
Library          OperatingSystem
Library          Collections
Library          Process
Resource         resources/common.robot
Resource         resources/note_keywords.robot
Resource         resources/cabinet_keywords.robot
Suite Setup      Open Test Browser
Suite Teardown   Close All Browsers

*** Variables ***
${BROWSER}              chrome
${BASE_URL}            http://localhost:3000
${CHROME_OPTIONS}      add_argument("--start-maximized"); add_argument("--disable-notifications"); add_argument("--disable-dev-shm-usage")
${API_URL}             http://localhost:5000/api
${DEFAULT_TIMEOUT}     10s
${IMPLICIT_WAIT}       2s

*** Test Cases ***
Create New Standard Note
    [Documentation]    Test creating a new standard note
    [Tags]    notes    create
    Go To Notes Manager
    Click Add Note Button
    Select Note Type    standard
    Wait Until Note Created
    Input Note Title    Test Note
    Input Note Content    This is a test note
    Note Should Exist    Test Note

Delete Standard Note
    [Documentation]    Test deleting a note
    [Tags]    notes    delete
    Go To Notes Manager
    Create Test Note    Test Delete Note    This note will be deleted
    Delete Note    Test Delete Note
    Note Should Not Exist    Test Delete Note

Create New Cabinet
    [Documentation]    Test creating a new cabinet
    [Tags]    cabinets    create
    Go To Notes Manager
    Open Cabinet Menu
    Click Create Cabinet
    Input Cabinet Name    Test Cabinet
    Submit Cabinet Creation
    Cabinet Should Exist    Test Cabinet

Switch Between Cabinets
    [Documentation]    Test switching between cabinets
    [Tags]    cabinets    navigation
    Go To Notes Manager
    Create Test Cabinet    Cabinet A
    Create Test Cabinet    Cabinet B
    Select Cabinet    Cabinet A
    Verify Current Cabinet    Cabinet A
    Select Cabinet    Cabinet B
    Verify Current Cabinet    Cabinet B

Create Task List Note
    [Documentation]    Test creating a task list note
    [Tags]    notes    tasks
    Go To Notes Manager
    Click Add Note Button
    Select Note Type    task
    Wait Until Note Created
    Input Note Title    My Tasks
    Add Task Item    First Task
    Add Task Item    Second Task
    Toggle Task    First Task
    Verify Task Status    First Task    checked
    Verify Task Status    Second Task    unchecked

Create Calendar Note
    [Documentation]    Test creating a calendar note
    [Tags]    notes    calendar
    Go To Notes Manager
    Click Add Note Button
    Select Note Type    calendar
    Wait Until Note Created
    Input Note Title    My Calendar
    Select Calendar Date    15    # Selects 15th of current month
    Input Calendar Content    Meeting with team
    Calendar Content Should Exist    15    Meeting with team

Test Rich Text Formatting
    [Documentation]    Test rich text editing capabilities
    [Tags]    notes    formatting
    Go To Notes Manager
    Create Test Note    Format Test    Initial content
    Apply Text Format    bold
    Input Note Content    Bold text
    Format Should Be Applied    Bold text    bold
    Apply Text Format    italic
    Input Note Content    Italic text
    Format Should Be Applied    Italic text    italic

Test Note Reordering
    [Documentation]    Test drag and drop reordering of notes
    [Tags]    notes    reorder
    Go To Notes Manager
    Create Test Note    First Note    Content 1
    Create Test Note    Second Note    Content 2
    Create Test Note    Third Note    Content 3
    Drag Note    First Note    Third Note
    Verify Note Order    Second Note    First Note    Third Note

*** Keywords ***
Go To Notes Manager
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    css=.app-container
    Wait Until Page Contains Element    css=.cabinet-header