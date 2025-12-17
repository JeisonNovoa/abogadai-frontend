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
      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 text-white p-8 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-4">{sessionState.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Asistente Legal Abogadai</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {sessionState.isPreLlamada && 'Listo para iniciar tu sesión'}
              {sessionState.isEnSesion && `Sesión activa - ${formatSessionTime(sessionTime)}`}
              {sessionState.isProcesando && 'Procesando tu conversación...'}
              {sessionState.isRevision && 'Revisión y generación de documento'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Estado indicator */}
            <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
              {sessionState.isPreLlamada && (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-white text-sm">Pre-llamada</span>
                </>
              )}
              {sessionState.isEnSesion && (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-mono text-sm">{formatSessionTime(sessionTime)}</span>
                </>
              )}
              {sessionState.isProcesando && (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">Procesando</span>
                </>
              )}
              {sessionState.isRevision && (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-white text-sm">Revisión</span>
                </>
              )}
            </div>

            {/* Botones de navegación */}
            <button
              onClick={() => navigate('/app/casos')}
              className="text-gray-300 hover:text-white px-3 py-2 text-sm transition"
            >
              Mis Casos
            </button>
            <button
              onClick={() => navigate('/app/perfil')}
              className="text-gray-300 hover:text-white px-3 py-2 text-sm transition"
            >
              Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal según estado */}
      <div className="flex-1 overflow-hidden">
        {/* ESTADO A: PRE-LLAMADA */}
        {sessionState.isPreLlamada && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-2xl text-center">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                Hola {user?.nombre}, bienvenido
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Estoy lista para ayudarte a crear tu tutela o derecho de petición.
                <br />
                Presiona el botón para iniciar la conversación.
              </p>

              <button
                onClick={handleIniciarSesion}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition transform hover:scale-105"
              >
                Iniciar Sesión
              </button>

              <div className="mt-12 grid grid-cols-3 gap-6 text-sm text-gray-400">
                <div>
                  <svg className="w-8 h-8 mx-auto mb-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Conversación con avatar</p>
                </div>
                <div>
                  <svg className="w-8 h-8 mx-auto mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Revisión de datos</p>
                </div>
                <div>
                  <svg className="w-8 h-8 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div className="flex-1 flex gap-3 overflow-hidden p-4" ref={videoContainerRef}>
              {/* Panel de Videos (60%) */}
              <div className="w-[60%] flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {/* Avatar */}
                  <div
                    className={`relative bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 ${
                      isAvatarSpeaking ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/50' : 'ring-2 ring-gray-700'
                    }`}
                  >
                    <VideoComponent onSpeakingChange={setIsAvatarSpeaking} isSpeaking={isAvatarSpeaking} />
                    <div className="absolute bottom-3 left-3 bg-gray-900 bg-opacity-80 px-3 py-1 rounded text-white text-xs">
                      Sofía - Asistente Legal
                    </div>
                  </div>

                  {/* Usuario */}
                  <div
                    className={`relative bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 flex items-center justify-center ${
                      isSpeaking ? 'ring-4 ring-green-500 shadow-lg shadow-green-500/50' : 'ring-2 ring-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl">
                        <span className="text-4xl font-bold text-white">
                          {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-base">{user?.nombre || 'Usuario'}</p>
                      {isSpeaking && (
                        <div className="mt-2 flex justify-center gap-1">
                          <span className="w-1.5 h-6 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="w-1.5 h-8 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-6 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-gray-900 bg-opacity-80 px-3 py-1 rounded text-white text-xs">
                      {user?.nombre || 'Tú'}
                    </div>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex justify-center items-center gap-3 py-2">
                  <button
                    onClick={toggleMute}
                    disabled={!isAvatarConnected}
                    className={`${
                      !isAvatarConnected
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : isMuted
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    } text-white p-3 rounded-full transition shadow-lg`}
                    title={!isAvatarConnected ? "Esperando..." : isMuted ? "Activar micrófono (Space)" : "Silenciar micrófono (Space)"}
                  >
                    {isMuted || !isAvatarConnected ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={handleFinalizarSesion}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition text-sm font-semibold"
                  >
                    Finalizar Sesión
                  </button>

                  <div className="text-gray-500 text-xs ml-4">
                    Atajo: <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">Space</kbd> Mutear
                  </div>
                </div>
              </div>

              {/* Panel de Transcripciones (40%) */}
              <div className="w-[40%] flex-shrink-0" style={{ height: 'calc(100vh - 140px)' }}>
                <div className="h-full rounded-lg overflow-hidden border border-gray-700 shadow-lg">
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
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center border border-gray-700">
              <div className="mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-white mb-2">Procesando Conversación</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Estamos analizando tu conversación con IA para auto-llenar los campos...
                </p>
                <div className="space-y-2 text-left text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Sesión finalizada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <span>Extrayendo información con IA...</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
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
