import { useState, useCallback } from 'react';

/**
 * Hook para manejar los estados de la sesión según plan.md
 *
 * Estados:
 * - PRE_LLAMADA: Lista para iniciar, sin conexión LiveKit
 * - EN_SESION: Conectado a LiveKit, conversación activa
 * - PROCESANDO: Procesando transcripción con IA
 * - REVISION: Revisión rápida de datos + generación de documento
 */

export const SESSION_STATES = {
  PRE_LLAMADA: 'PRE_LLAMADA',
  EN_SESION: 'EN_SESION',
  PROCESANDO: 'PROCESANDO',
  REVISION: 'REVISION'
};

export function useSessionState(initialState = SESSION_STATES.PRE_LLAMADA) {
  const [state, setState] = useState(initialState);
  const [casoData, setCasoData] = useState(null);
  const [livekitToken, setLivekitToken] = useState(null);
  const [livekitUrl, setLivekitUrl] = useState(null);
  const [error, setError] = useState(null);

  // Transición a PRE_LLAMADA
  const goToPreLlamada = useCallback(() => {
    setState(SESSION_STATES.PRE_LLAMADA);
    setError(null);
  }, []);

  // Transición a EN_SESION (con token LiveKit)
  const goToEnSesion = useCallback((tokenData) => {
    setLivekitToken(tokenData.access_token);
    setLivekitUrl(tokenData.livekit_url);
    setState(SESSION_STATES.EN_SESION);
    setError(null);
  }, []);

  // Transición a PROCESANDO
  const goToProcesando = useCallback(() => {
    setState(SESSION_STATES.PROCESANDO);
    setError(null);
  }, []);

  // Transición a REVISION (con datos del caso procesado)
  const goToRevision = useCallback((caso) => {
    setCasoData(caso);
    setState(SESSION_STATES.REVISION);
    setError(null);
  }, []);

  // Establecer error
  const setStateError = useCallback((errorMsg) => {
    setError(errorMsg);
  }, []);

  // Reset completo
  const reset = useCallback(() => {
    setState(SESSION_STATES.PRE_LLAMADA);
    setCasoData(null);
    setLivekitToken(null);
    setLivekitUrl(null);
    setError(null);
  }, []);

  return {
    // Estado actual
    currentState: state,
    casoData,
    livekitToken,
    livekitUrl,
    error,

    // Checkers booleanos (para condicionales)
    isPreLlamada: state === SESSION_STATES.PRE_LLAMADA,
    isEnSesion: state === SESSION_STATES.EN_SESION,
    isProcesando: state === SESSION_STATES.PROCESANDO,
    isRevision: state === SESSION_STATES.REVISION,

    // Transiciones
    goToPreLlamada,
    goToEnSesion,
    goToProcesando,
    goToRevision,
    setStateError,
    reset,

    // Actualizar datos del caso
    updateCasoData: setCasoData
  };
}
