#!/bin/bash

echo "Sending 'Hello world!' to notetaker endpoint..."

response=$(curl -s -X POST http://localhost:5173/notetaker \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "markdownText=Here's a new test that I'd like to print!")

echo "Response:"
echo $response