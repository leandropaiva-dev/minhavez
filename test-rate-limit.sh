#!/bin/bash
# Script para testar rate limiting das APIs

echo "🧪 TESTANDO RATE LIMITING - MinhaVez API"
echo "=========================================="
echo ""

API_URL="http://localhost:3000"

# Teste 1: Rate limit em /api/queue/join
echo "📝 Teste 1: Rate limiting em /api/queue/join"
echo "Limite: 10 requisições por minuto"
echo ""

for i in {1..12}; do
  echo "Requisição $i..."
  response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST "${API_URL}/api/queue/join" \
    -H "Content-Type: application/json" \
    -d '{
      "businessId": "test-123",
      "customerName": "Test User",
      "customerPhone": "11999999999",
      "partySize": 2
    }')
  
  http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
  
  if [ "$http_code" == "429" ]; then
    echo "✅ Rate limit funcionando! Requisição $i bloqueada (429)"
    echo "$response" | grep -v "HTTP_CODE"
    break
  else
    echo "   Status: $http_code"
  fi
  
  sleep 0.5
done

echo ""
echo "=========================================="
echo ""

# Teste 2: Rate limit em /api/reservations/send-confirmation
echo "📧 Teste 2: Rate limiting em /api/reservations/send-confirmation"
echo "Limite: 5 requisições por minuto"
echo ""

for i in {1..7}; do
  echo "Requisição $i..."
  response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST "${API_URL}/api/reservations/send-confirmation" \
    -H "Content-Type: application/json" \
    -d '{
      "reservationId": "test-456"
    }')
  
  http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
  
  if [ "$http_code" == "429" ]; then
    echo "✅ Rate limit funcionando! Requisição $i bloqueada (429)"
    echo "$response" | grep -v "HTTP_CODE"
    break
  else
    echo "   Status: $http_code"
  fi
  
  sleep 0.5
done

echo ""
echo "=========================================="
echo "✅ TESTES CONCLUÍDOS!"
echo ""
