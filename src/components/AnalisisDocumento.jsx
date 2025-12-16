import { useState } from 'react';

export default function AnalisisDocumento({ caso }) {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // Validación de seguridad: si no hay caso, no renderizar nada
  if (!caso) {
    return null;
  }

  const jurisprudencia = caso?.analisis_jurisprudencia;
  const sugerencias = caso?.sugerencias_mejora;

  return (
    <div className="space-y-4">
      {/* Panel de Jurisprudencia */}
      {jurisprudencia && jurisprudencia.total_sentencias > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⚖️ Jurisprudencia Citada
          </h3>

          <p className="text-sm text-gray-700 mb-3">
            Se encontraron <strong>{jurisprudencia.total_sentencias}</strong> sentencias citadas en el documento.
          </p>

          {jurisprudencia.advertencia && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">⚠️ {jurisprudencia.advertencia}</p>
            </div>
          )}

          {/* Lista de Sentencias */}
          {jurisprudencia.sentencias_citadas && jurisprudencia.sentencias_citadas.length > 0 && (
            <div className="space-y-2">
              {jurisprudencia.sentencias_citadas.map((sent, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <span className="text-sm font-mono font-semibold">{sent.referencia}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel de Sugerencias */}
      {sugerencias && sugerencias.total_sugerencias > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Sugerencias de Mejora ({sugerencias.total_sugerencias})
          </h3>

          {sugerencias.prioridad_critica > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-900">
                {sugerencias.prioridad_critica} sugerencias críticas
              </p>
            </div>
          )}

          <div className="space-y-3">
            {sugerencias.sugerencias.map((sug, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  sug.prioridad === 'crítica'
                    ? 'bg-red-50 border-red-200'
                    : sug.prioridad === 'alta'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {sug.prioridad}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{sug.categoria}</p>
                    <p className="text-sm text-gray-700 mt-1">{sug.descripcion}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>Acción:</strong> {sug.accion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
