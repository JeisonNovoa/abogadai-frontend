import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LiveKitRoom, RoomAudioRenderer, useTracks, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';
import { Track } from 'livekit-client';
import livekitService from '../services/livekitService';
import casoService from '../services/casoService';
import { useAuth } from '../context/AuthContext';
import { useSessionState, SESSION_STATES } from '../hooks/useSessionState';
import TranscriptPanel from '../components/TranscriptPanel';
import RevisionRapida from '../components/RevisionRapida';

// Componente para detectar participantes remotos (avatar)
function AvatarDetector({ onAvatarConnected }) {
  const remoteParticipants = useRemoteParticipants();

  useEffect(() => {
    const isConnected = remoteParticipants.length > 0;
    onAvatarConnected?.(isConnected);
  }, [remoteParticipants, onAvatarConnected]);

  return null;
}

// Componente para controles de audio
function AudioControls({ isMuted, onToggleMute, onMicActivity, isEnabled }) {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(isEnabled && !isMuted);
    }
  }, [isMuted, localParticipant, isEnabled]);

  useEffect(() => {
    if (!localParticipant) return;

    const handleSpeakingChange = (speaking) => {
      onMicActivity?.(speaking);
    };

    localParticipant.on('isSpeakingChanged', handleSpeakingChange);

    return () => {
      localParticipant.off('isSpeakingChanged', handleSpeakingChange);
    };
  }, [localParticipant, onMicActivity]);

  return null;
}

// Componente del video del avatar
function VideoComponent({ onSpeakingChange, isSpeaking: isAvatarSpeaking }) {
  const tracks = useTracks([Track.Source.Camera]);
  const videoRef = useRef(null);

  useEffect(() => {
    if (tracks.length > 0 && tracks[0]?.participant) {
      const participant = tracks[0].participant;

      const handleSpeakingChange = (speaking) => {
        onSpeakingChange?.(speaking);
      };

      participant.on('isSpeakingChanged', handleSpeakingChange);

      return () => {
        participant.off('isSpeakingChanged', handleSpeakingChange);
      };
    }
  }, [tracks, onSpeakingChange]);

  if (tracks.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-800 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neutral-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-sm">Esperando al avatar...</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={(ref) => {
        videoRef.current = ref;
        if (ref && tracks[0]?.publication?.track) {
          tracks[0].publication.track.attach(ref);
        }
      }}
      className="w-full h-full object-cover rounded-lg"
      autoPlay
      playsInline
    />
  );
}

/**
 * AvatarSession - Pantalla principal con máquina de estados
 *
 * Estados (según plan.md):
 * A) PRE_LLAMADA: Listo para iniciar, sin conexión LiveKit
 * B) EN_SESION: Conectado a LiveKit, conversación activa
 * C) PROCESANDO: Procesando transcripción con IA
 * D) REVISION: Revisión rápida de datos + generación de documento
 */
export default function AvatarSession() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const sessionState = useSessionState();
  const isInitializingRef = useRef(false);

  // Estados del componente
  const [casoId, setCasoId] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isAvatarConnected, setIsAvatarConnected] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [conversacion, setConversacion] = useState([]);
  const videoContainerRef = useRef(null);

  // Inicializar: NO crear caso aún, solo mostrar pantalla Pre-llamada
  useEffect(() => {
    // El caso se creará cuando el usuario presione "Iniciar Sesión"
    sessionState.goToPreLlamada();
  }, []);

  // Contador de tiempo de sesión (solo cuando está en sesión)
  useEffect(() => {
    if (!sessionState.isEnSesion || !isAvatarConnected) return;

    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState.isEnSesion, isAvatarConnected]);

  // Desmutear automáticamente cuando el avatar se conecta
  useEffect(() => {
    if (isAvatarConnected && isMuted) {
      setIsMuted(false);
    }
  }, [isAvatarConnected]);

  // Formatear tiempo de sesión
  const formatSessionTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handler: Iniciar sesión (crear caso + conectar a LiveKit)
  const handleIniciarSesion = async () => {
    try {
      console.log('🚀 Paso 1: Creando caso...');
      const casoData = await livekitService.iniciarSesion();
      const nuevoCasoId = casoData.caso_id;
      setCasoId(nuevoCasoId);
      console.log('✅ Caso creado:', nuevoCasoId);

      console.log('🔌 Paso 2: Conectando a LiveKit...');
      const tokenData = await livekitService.conectarSesion(nuevoCasoId);
      console.log('✅ Token obtenido');

      sessionState.goToEnSesion(tokenData);
    } catch (err) {
      console.error('❌ Error iniciando sesión:', err);
      sessionState.setStateError('Error al iniciar sesión. Por favor intenta de nuevo.');
    }
  };

  // Handler: Finalizar sesión
  const handleFinalizarSesion = async () => {
    if (!casoId) return;

    try {
      sessionState.goToProcesando();

      console.log('🔚 Finalizando sesión...');
      await livekitService.finalizarSesion(casoId);

      console.log('🤖 Procesando transcripción con IA...');
      const casoActualizado = await casoService.procesarTranscripcion(casoId);

      console.log('📥 Cargando conversación...');
      const mensajes = await casoService.obtenerMensajes(casoId);
      setConversacion(mensajes);

      console.log('✅ Pasando a revisión');
      sessionState.goToRevision(casoActualizado);
    } catch (err) {
      console.error('❌ Error finalizando sesión:', err);
      sessionState.setStateError('Error procesando la conversación.');
    }
  };

  // Handler: Abandonar llamada (eliminar caso y salir)
  const handleAbandonarLlamada = async () => {
    try {
      console.log('🚪 Abandonando llamada...');

      // Eliminar caso si existe
      if (casoId) {
        console.log('🗑️ Eliminando caso:', casoId);
        await casoService.eliminarCaso(casoId);
      }

      // Volver al dashboard
      navigate('/app/casos');
    } catch (err) {
      console.error('❌ Error abandonando llamada:', err);
      // Aún así, intentar volver al dashboard
      navigate('/app/casos');
    }
  };

  // Handler: Actualizar caso después de edición
  const handleCasoUpdated = (casoActualizado) => {
    sessionState.updateCasoData(casoActualizado);
  };

  // Handler: Documento generado
  const handleDocumentoGenerado = (casoConDocumento) => {
    sessionState.updateCasoData(casoConDocumento);
    console.log('✅ Documento generado exitosamente');
  };

  // Toggle mute
  const toggleMute = () => {
    if (!isAvatarConnected) return;
    setIsMuted(!isMuted);
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === ' ' && isAvatarConnected) {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted, isAvatarConnected]);

  // Error state
  if (sessionState.error) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="p-8 rounded-lg max-w-md" style={{ backgroundColor: 'var(--color-error-dark)', color: 'white' }}>
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-4">{sessionState.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full text-white py-2 px-4 rounded"
            style={{ backgroundColor: 'var(--color-error)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error)'}
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--neutral-200)' }}>
      {/* Header */}
      <div
        className="border-b px-6 py-4"
        style={{
          backgroundColor: 'white',
          borderColor: 'var(--neutral-300)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--neutral-800)' }}
            >
              Asistente Legal
            </h1>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--neutral-600)' }}
            >
              {sessionState.isPreLlamada && 'Listo para iniciar tu sesión'}
              {sessionState.isEnSesion && 'Sesión activa'}
              {sessionState.isProcesando && 'Procesando tu conversación...'}
              {sessionState.isRevision && 'Revisión y generación de documento'}
            </p>
          </div>

          {/* Estado indicator */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--neutral-200)' }}
          >
            {sessionState.isPreLlamada && (
              <>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--neutral-400)' }}
                ></div>
                <span
                  className="text-sm"
                  style={{ color: 'var(--neutral-700)' }}
                >
                  Pre-llamada
                </span>
              </>
            )}
            {sessionState.isEnSesion && (
              <>
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--color-success)' }}
                ></div>
                <span
                  className="font-mono text-sm"
                  style={{ color: 'var(--neutral-800)' }}
                >
                  {formatSessionTime(sessionTime)}
                </span>
              </>
            )}
            {sessionState.isProcesando && (
              <>
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--color-warning)' }}
                ></div>
                <span
                  className="text-sm"
                  style={{ color: 'var(--neutral-800)' }}
                >
                  Procesando
                </span>
              </>
            )}
            {sessionState.isRevision && (
              <>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                ></div>
                <span
                  className="text-sm"
                  style={{ color: 'var(--neutral-800)' }}
                >
                  Revisión
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal según estado */}
      <div className="flex-1 overflow-hidden">
        {/* ESTADO A: PRE-LLAMADA */}
        {sessionState.isPreLlamada && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-2xl text-center">
              <div
                className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  boxShadow: '0 8px 32px rgba(11, 109, 255, 0.3)'
                }}
              >
                <svg className="w-16 h-16" style={{ color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--neutral-800)' }}>
                Hola {user?.nombre}, bienvenido
              </h2>
              <p className="mb-8 text-lg" style={{ color: 'var(--neutral-600)' }}>
                Estoy lista para ayudarte a crear tu tutela o derecho de petición.
                <br />
                Presiona el botón para iniciar la conversación.
              </p>

              <button
                onClick={handleIniciarSesion}
                className="font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(11, 109, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
                }}
              >
                Iniciar Sesión
              </button>

              <div className="mt-12 grid grid-cols-3 gap-6 text-sm" style={{ color: 'var(--neutral-600)' }}>
                <div>
                  <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Conversación con avatar</p>
                </div>
                <div>
                  <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-info)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Revisión de datos</p>
                </div>
                <div>
                  <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p>Documento generado</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ESTADO B: EN SESIÓN */}
        {sessionState.isEnSesion && sessionState.livekitToken && (
          <LiveKitRoom
            token={sessionState.livekitToken}
            serverUrl={sessionState.livekitUrl}
            connect={true}
            audio={true}
            video={false}
            className="h-full flex flex-col overflow-hidden"
          >
            <AvatarDetector onAvatarConnected={setIsAvatarConnected} />
            <AudioControls
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onMicActivity={setIsSpeaking}
              isEnabled={isAvatarConnected}
            />

            <div className="flex-1 flex gap-4 overflow-hidden p-6" ref={videoContainerRef}>
              {/* Panel de Videos (65%) */}
              <div className="w-[65%] flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {/* Avatar */}
                  <div
                    className={`relative bg-neutral-800 rounded-lg overflow-hidden transition-all duration-300 ${
                      isAvatarSpeaking ? 'ring-4 ring-primary shadow-lg' : 'ring-2 ring-neutral-700'
                    }`}
                    style={isAvatarSpeaking ? { boxShadow: '0 0 20px rgba(11, 109, 255, 0.5)' } : {}}
                  >
                    <VideoComponent onSpeakingChange={setIsAvatarSpeaking} isSpeaking={isAvatarSpeaking} />
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}>
                      Sofía - Asistente Legal
                    </div>
                  </div>

                  {/* Usuario */}
                  <div
                    className={`relative bg-gradient-to-br rounded-lg overflow-hidden transition-all duration-300 flex items-center justify-center ${
                      isSpeaking ? 'ring-4 shadow-lg' : 'ring-2 ring-neutral-700'
                    }`}
                    style={{
                      background: isSpeaking
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.15) 100%)'
                        : 'linear-gradient(135deg, rgba(11, 109, 255, 0.05) 0%, rgba(8, 77, 182, 0.1) 100%)',
                      borderColor: isSpeaking ? 'var(--color-success)' : 'var(--neutral-700)',
                      boxShadow: isSpeaking ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none'
                    }}
                  >
                    <div className="text-center py-8">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-2xl">
                        <span className="text-5xl font-bold text-white">
                          {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <p className="text-lg font-semibold mb-1" style={{ color: 'var(--neutral-800)' }}>{user?.nombre || 'Usuario'}</p>
                      {isSpeaking && (
                        <div className="mt-3 flex justify-center gap-1">
                          <span className="w-2 h-8 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }}></span>
                          <span className="w-2 h-12 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)', animationDelay: '150ms' }}></span>
                          <span className="w-2 h-10 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)', animationDelay: '300ms' }}></span>
                          <span className="w-2 h-8 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)', animationDelay: '450ms' }}></span>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}>
                      {user?.nombre || 'Tú'}
                    </div>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex justify-center items-center gap-3 py-2">
                  <button
                    onClick={toggleMute}
                    disabled={!isAvatarConnected}
                    className="text-white p-4 rounded-full transition-all duration-200 shadow-lg"
                    style={{
                      backgroundColor: !isAvatarConnected
                        ? 'var(--neutral-400)'
                        : isMuted
                        ? 'var(--color-error)'
                        : 'var(--color-primary)',
                      cursor: !isAvatarConnected ? 'not-allowed' : 'pointer',
                      opacity: !isAvatarConnected ? '0.5' : '1',
                      transform: !isAvatarConnected ? 'none' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (isAvatarConnected) {
                        e.currentTarget.style.backgroundColor = isMuted ? 'var(--color-error-dark)' : 'var(--color-primary-dark)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isAvatarConnected) {
                        e.currentTarget.style.backgroundColor = isMuted ? 'var(--color-error)' : 'var(--color-primary)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    title={!isAvatarConnected ? "Esperando..." : isMuted ? "Activar micrófono (Space)" : "Silenciar micrófono (Space)"}
                  >
                    {isMuted || !isAvatarConnected ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={handleAbandonarLlamada}
                    className="text-white px-4 py-3 rounded-lg transition-all duration-200 text-sm font-semibold shadow-lg flex items-center gap-2"
                    style={{ backgroundColor: 'var(--neutral-600)', border: '2px solid var(--neutral-500)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--neutral-700)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--neutral-600)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Cancelar sesión y eliminar caso"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Abandonar Llamada
                  </button>

                  <button
                    onClick={handleFinalizarSesion}
                    className="text-white px-6 py-3 rounded-lg transition-all duration-200 text-sm font-semibold shadow-lg flex items-center gap-2"
                    style={{ backgroundColor: 'var(--color-error)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-error-dark)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-error)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Finalizar Sesión
                  </button>

                  <div className="text-xs ml-4" style={{ color: 'var(--neutral-600)' }}>
                    Atajo: <kbd className="px-2 py-1 rounded font-mono" style={{ backgroundColor: 'var(--neutral-200)', color: 'var(--neutral-700)', border: '1px solid var(--neutral-300)' }}>Space</kbd> Mutear
                  </div>
                </div>
              </div>

              {/* Panel de Transcripciones (35%) */}
              <div className="w-[35%] flex-shrink-0" style={{ height: 'calc(100vh - 160px)' }}>
                <div className="h-full rounded-lg overflow-hidden shadow-xl" style={{ border: '1px solid var(--neutral-300)', backgroundColor: 'white' }}>
                  <TranscriptPanel />
                </div>
              </div>
            </div>

            <RoomAudioRenderer />
          </LiveKitRoom>
        )}

        {/* ESTADO C: PROCESANDO */}
        {sessionState.isProcesando && (
          <div className="h-full flex items-center justify-center">
            <div className="rounded-lg p-8 max-w-md w-full mx-4 text-center" style={{ backgroundColor: 'white', border: '1px solid var(--neutral-300)' }}>
              <div className="mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--neutral-800)' }}>Procesando Conversación</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--neutral-600)' }}>
                  Estamos analizando tu conversación con IA para auto-llenar los campos...
                </p>
                <div className="space-y-2 text-left text-sm" style={{ color: 'var(--neutral-700)' }}>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Sesión finalizada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    </div>
                    <span>Extrayendo información con IA...</span>
                  </div>
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                Esto puede tomar unos segundos. No cierres esta ventana.
              </p>
            </div>
          </div>
        )}

        {/* ESTADO D: REVISIÓN */}
        {sessionState.isRevision && sessionState.casoData && (
          <div className="h-full p-4">
            <RevisionRapida
              caso={sessionState.casoData}
              conversacion={conversacion}
              onCasoUpdated={handleCasoUpdated}
              onDocumentoGenerado={handleDocumentoGenerado}
            />
          </div>
        )}
      </div>
    </div>
  );
}
