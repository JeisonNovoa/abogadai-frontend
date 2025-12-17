import { useState } from 'react';

export default function AnalisisDocumento({ caso }) {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // Validación de seguridad: si no hay caso, no renderizar nada
  if (!caso) {
    return null;
  }

  const jurisprudencia = caso?.analisis_jurisprudencia;
  const sugerencias = caso?.sugerencias_mejora;

  const getPrioridadStyles = (prioridad) => {
    switch (prioridad) {
      case 'crítica':
        return {
          backgroundColor: 'var(--color-error-light)',
          borderColor: 'var(--color-error)',
          textColor: 'var(--color-error-dark)'
        };
      case 'alta':
        return {
          backgroundColor: 'var(--color-warning-light)',
          borderColor: 'var(--color-warning)',
          textColor: 'var(--color-warning-dark)'
        };
      default:
        return {
          backgroundColor: 'var(--color-info-light)',
          borderColor: 'var(--color-info)',
          textColor: 'var(--color-info-dark)'
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Panel de Jurisprudencia */}
      {jurisprudencia && jurisprudencia.total_sentencias > 0 && (
        <div className="rounded-lg p-6" style={{ backgroundColor: 'white', border: '1px solid var(--neutral-300)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-800)' }}>
            ⚖️ Jurisprudencia Citada
          </h3>

          <p className="text-sm mb-3" style={{ color: 'var(--neutral-700)' }}>
            Se encontraron <strong>{jurisprudencia.total_sentencias}</strong> sentencias citadas en el documento.
          </p>

          {jurisprudencia.advertencia && (
            <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--color-warning-light)', border: '1px solid var(--color-warning)' }}>
              <p className="text-sm" style={{ color: 'var(--color-warning-dark)' }}>⚠️ {jurisprudencia.advertencia}</p>
            </div>
          )}

          {/* Lista de Sentencias */}
          {jurisprudencia.sentencias_citadas && jurisprudencia.sentencias_citadas.length > 0 && (
            <div className="space-y-2">
              {jurisprudencia.sentencias_citadas.map((sent, idx) => (
                <div key={idx} className="p-2 rounded" style={{ backgroundColor: 'var(--neutral-200)', border: '1px solid var(--neutral-300)' }}>
                  <span className="text-sm font-mono font-semibold">{sent.referencia}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel de Sugerencias */}
      {sugerencias && sugerencias.total_sugerencias > 0 && (
        <div className="rounded-lg p-6" style={{ backgroundColor: 'white', border: '1px solid var(--neutral-300)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-800)' }}>
            💡 Sugerencias de Mejora ({sugerencias.total_sugerencias})
          </h3>

          {sugerencias.prioridad_critica > 0 && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-error-light)', border: '1px solid var(--color-error)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-error-dark)' }}>
                {sugerencias.prioridad_critica} sugerencias críticas
              </p>
            </div>
          )}

          <div className="space-y-3">
            {sugerencias.sugerencias.map((sug, idx) => {
              const styles = getPrioridadStyles(sug.prioridad);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: styles.backgroundColor,
                    border: `1px solid ${styles.borderColor}`
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: styles.textColor }}>
                      {sug.prioridad}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--neutral-800)' }}>{sug.categoria}</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--neutral-700)' }}>{sug.descripcion}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--neutral-600)' }}>
                        <strong>Acción:</strong> {sug.accion}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
