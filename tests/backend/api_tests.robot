*** Settings ***
Library    RequestsLibrary
Library    Collections
Suite Setup    Create Session    backend    http://localhost:5000

*** Variables ***
${API_URL}    http://localhost:5000/api

*** Test Cases ***
Health Check Should Return Healthy
    ${response}=    GET On Session    backend    /health
    Status Should Be    200    ${response}
    Dictionary Should Contain Value    ${response.json()}    healthy

Create And Get Cabinet
    # Create a new cabinet
    ${cabinet}=    Create Dictionary    name=Test Cabinet
    ${response}=    POST On Session    backend    /api/cabinets    json=${cabinet}
    Status Should Be    201    ${response}
    
    # Get all cabinets
    ${response}=    GET On Session    backend    /api/cabinets
    Status Should Be    200    ${response}
    Length Should Be    ${response.json()}    1