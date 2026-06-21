#!/bin/bash
# End-to-End API Testsuite für Deutschland-Stack-Tools

BASE_URL=${1:-"http://localhost:3000/api/v1"}

echo "============================================="
echo "Deutschland-Stack-Tools E2E Testsuite"
echo "API Base URL: $BASE_URL"
echo "============================================="

# Ensure jq is installed for parsing JSON
if ! command -v jq &> /dev/null; then
    echo "FEHLER: 'jq' wird für die Testsuite benötigt. Bitte installieren (z.B. brew install jq)."
    exit 1
fi

passed=0
failed=0

run_test() {
    local test_name=$1
    local file_path=$2
    local expected_status=$3
    local expect_error=$4
    local endpoint=${5:-"/validate"}
    
    echo -n "Test: $test_name ... "
    
    # Create dummy file if not exists
    if [ ! -f "$file_path" ]; then
        if [[ "$file_path" == *".odt" ]]; then
            echo "dummy odt content" > "$file_path"
        elif [[ "$file_path" == *".pdf" ]]; then
            echo "%PDF-1.4" > "$file_path"
            echo "invalid pdf data" >> "$file_path"
        elif [[ "$file_path" == *".txt" ]]; then
            echo "dummy txt content" > "$file_path"
        fi
    fi

    response=$(curl -s -F "file=@$file_path" "${BASE_URL}${endpoint}")
    
    # Check if we expect a hard error (like UNSUPPORTED_FORMAT)
    if [ "$expect_error" != "false" ]; then
        err=$(echo "$response" | jq -r '.error // empty')
        if [ "$err" == "$expect_error" ]; then
            echo "✅ BESTANDEN ($err erkannt)"
            ((passed++))
        else
            echo "❌ FEHLGESCHLAGEN"
            echo "Erwartet Error: $expect_error, Bekommen: $response"
            ((failed++))
        fi
        return
    fi

    # OCR Special Check
    if [ "$endpoint" == "/ocr/wba" ]; then
        doc_type=$(echo "$response" | jq -r '.antrags_metadaten.dokumenten_typ // empty')
        if [[ "$doc_type" == *"WBA"* || "$doc_type" == *"Antrag"* ]]; then
            echo "✅ BESTANDEN (JSON extrahiert)"
            ((passed++))
        else
            echo "❌ FEHLGESCHLAGEN"
            echo "Erwartet WBA JSON, Bekommen: $response"
            ((failed++))
        fi
        return
    fi
    
    # Check validation status
    status=$(echo "$response" | jq -r '.status // empty')
    if [[ "$status" == "$expected_status" || ( "$expected_status" == "valid" && "$status" == "warning" ) ]]; then
        echo "✅ BESTANDEN"
        ((passed++))
    else
        echo "❌ FEHLGESCHLAGEN"
        echo "Erwartet Status: $expected_status, Bekommen: $status"
        echo "Response: $response"
        ((failed++))
    fi
}

mkdir -p /tmp/dst_e2e_tests

# Wir laden kurz echte Test-Dateien herunter, um realistische Ergebnisse zu erzielen
echo "Lade Testdateien herunter..."
wget -q -O /tmp/dst_e2e_tests/real-valid.odt "https://filesamples.com/samples/document/odt/sample1.odt" || echo "dummy" > /tmp/dst_e2e_tests/real-valid.odt
wget -q -O /tmp/dst_e2e_tests/real-invalid.pdf "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" || echo "dummy" > /tmp/dst_e2e_tests/real-invalid.pdf

echo "Starte Tests..."
echo "---------------------------------------------"

run_test "Unsupported File Format" "/tmp/dst_e2e_tests/test.txt" "" "UNSUPPORTED_FORMAT"
run_test "Fake PDF (Parsing Fehler)" "/tmp/dst_e2e_tests/fake.pdf" "invalid" "false"
run_test "Echtes PDF (aber nicht PDF/UA)" "/tmp/dst_e2e_tests/real-invalid.pdf" "invalid" "false"
run_test "Echtes ODT (Sollte Valid oder Warning sein)" "/tmp/dst_e2e_tests/real-valid.odt" "valid" "false"

if [ "$CI" == "true" ]; then
    echo "Test: WBA OCR API Endpoint ... ⏭️  ÜBERSPRUNGEN (CI Environment)"
else
    # Wir nutzen das im Projekt liegende wba-dummy.pdf für diesen Test
    run_test "WBA OCR API Endpoint" "./tests/fixtures/wba-dummy.pdf" "valid" "false" "/ocr/wba"
fi

echo "---------------------------------------------"
echo "Tests abgeschlossen."
echo "✅ Bestanden: $passed"
if [ $failed -gt 0 ]; then
    echo "❌ Fehlgeschlagen: $failed"
    exit 1
fi
exit 0
