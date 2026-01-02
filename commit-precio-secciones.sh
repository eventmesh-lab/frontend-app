#!/bin/bash
export GIT_AUTHOR_DATE="2025-12-28T09:00:00"
export GIT_COMMITTER_DATE="2025-12-28T09:00:00"
git add .
git commit -m "feat: Agregar manejo de precios por sección en detalle de evento

- Agregar selector de sección cuando hay múltiples secciones
- Implementar funciones para calcular precio según sección seleccionada
- Mostrar rango de precios cuando hay múltiples secciones
- Corregir cálculo de subtotal y total basado en sección
- Actualizar handleReservar para usar precio de sección seleccionada
- Resolver problema de \$NaN en precio cuando hay secciones"
echo "✅ Commit realizado con fecha: 2025-12-28T09:00:00"
echo "📅 Para verificar la fecha: git log -1 --format='%ai %ci'"
