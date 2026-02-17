import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFire,
  faTrophy,
  faBolt,
  faHeart,
  faStar,
  faRocket,
  faMedal
} from '@fortawesome/free-solid-svg-icons';

const MOTIVATIONAL_MESSAGES = {
  setComplete: [
    { text: '¡Excelente serie!', icon: faTrophy, color: 'from-yellow-400 to-orange-500' },
    { text: '¡Sigue así!', icon: faFire, color: 'from-red-400 to-pink-500' },
    { text: '¡Imparable!', icon: faBolt, color: 'from-blue-400 to-cyan-500' },
    { text: '¡Lo estás haciendo genial!', icon: faStar, color: 'from-purple-400 to-pink-500' },
    { text: '¡Eres increíble!', icon: faRocket, color: 'from-green-400 to-emerald-500' },
    { text: '¡Una serie más!', icon: faMedal, color: 'from-yellow-400 to-amber-500' },
  ],
  exerciseComplete: [
    { text: '¡Ejercicio completado!', icon: faTrophy, color: 'from-yellow-400 to-orange-500' },
    { text: '¡Brutal!', icon: faFire, color: 'from-red-400 to-pink-500' },
    { text: '¡Un ejercicio menos!', icon: faBolt, color: 'from-blue-400 to-cyan-500' },
    { text: '¡Lo lograste!', icon: faStar, color: 'from-purple-400 to-pink-500' },
    { text: '¡Increíble trabajo!', icon: faRocket, color: 'from-green-400 to-emerald-500' },
  ],
  rest: [
    { text: '¡Respira profundo!', icon: faHeart, color: 'from-blue-400 to-indigo-500' },
    { text: '¡Recupérate bien!', icon: faHeart, color: 'from-green-400 to-teal-500' },
    { text: '¡Hidrátate!', icon: faHeart, color: 'from-cyan-400 to-blue-500' },
    { text: '¡Prepárate para la siguiente!', icon: faBolt, color: 'from-purple-400 to-violet-500' },
  ],
  halfway: [
    { text: '¡Mitad del camino!', icon: faTrophy, color: 'from-yellow-400 to-orange-500' },
    { text: '¡Ya llevas el 50%!', icon: faStar, color: 'from-purple-400 to-pink-500' },
    { text: '¡No pares ahora!', icon: faFire, color: 'from-red-400 to-pink-500' },
  ],
  almostDone: [
    { text: '¡Ya casi terminas!', icon: faTrophy, color: 'from-yellow-400 to-orange-500' },
    { text: '¡Un último esfuerzo!', icon: faFire, color: 'from-red-400 to-pink-500' },
    { text: '¡Último ejercicio!', icon: faBolt, color: 'from-blue-400 to-cyan-500' },
  ],
};

type MessageType = keyof typeof MOTIVATIONAL_MESSAGES;

interface MotivationalMessageProps {
  type: MessageType;
  show: boolean;
  onClose?: () => void;
  autoCloseDelay?: number;
}

export function MotivationalMessage({
  type,
  show,
  onClose,
  autoCloseDelay = 1500,
}: MotivationalMessageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(
    MOTIVATIONAL_MESSAGES[type][0]
  );

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  useEffect(() => {
    if (show) {
      // Pick random message
      const messages = MOTIVATIONAL_MESSAGES[type];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(randomMessage);
      setIsVisible(true);

      // Auto close after delay
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, type, autoCloseDelay]);

  if (!show && !isVisible) return null;

  return (
    <>
      {/* Backdrop - clickeable para cerrar */}
      <div
        className="fixed inset-0 bg-black/10 z-[60] cursor-pointer"
        onClick={handleClose}
      />

      {/* Message */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[61] transition-all duration-200 ${
          isVisible
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-90 pointer-events-none'
        }`}
        onClick={handleClose}
      >
        <div
          className={`bg-gradient-to-br ${currentMessage.color} rounded-2xl shadow-2xl p-6 text-center cursor-pointer`}
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <FontAwesomeIcon
              icon={currentMessage.icon}
              className="text-4xl text-white"
            />
          </div>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            {currentMessage.text}
          </h2>
        </div>
      </div>
    </>
  );
}
