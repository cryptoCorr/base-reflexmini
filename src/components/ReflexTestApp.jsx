import React, { useState, useEffect, useCallback } from 'react';

// Ortalama insan reaksiyon süresi (milisecond)
const AVERAGE_TIME = 250;
const INITIAL_STATE = 'waiting'; // waiting, ready, testing, done

function ReflexTestApp() {
  const [status, setStatus] = useState(INITIAL_STATE);
  const [delay, setDelay] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);

  // KRİTİK ADIM: Uygulama yüklendiğinde Farcaster'a hazır sinyali gönderir.
  // Bu, Splash Screen'de takılmayı önleyen "is frame ready" adımıdır.
  useEffect(() => {
    if (window.SDK && window.SDK.Actions) {
      // SDK.Actions.ready() çağrısı ile uygulama hazır sinyali gönderilir.
      window.SDK.Actions.ready();
      console.log("Farcaster: Mini App Ready signal sent.");
    }
  }, []);

  const startTest = useCallback(() => {
    setStatus('waiting');
    setReactionTime(null);

    // 1-5 saniye arasında rastgele bekleme süresi
    const randomDelay = Math.floor(Math.random() * 4000) + 1000;
    setDelay(randomDelay);

    setTimeout(() => {
      setStatus('ready');
      setStartTime(Date.now()); // Zamanı başlat
    }, randomDelay);
  }, []);

  const handleInteraction = useCallback(() => {
    if (status === 'waiting') {
      // Çok erken tıklandı (Kırmızı ekrandan önce)
      setStatus('done');
      setReactionTime('too_early');
    } else if (status === 'ready') {
      // Doğru zamanda tıklandı (Yeşil ekranda)
      const timeTaken = Date.now() - startTime;
      setReactionTime(timeTaken);
      setStatus('done');
    } else if (status === 'done' || status === INITIAL_STATE) {
      // Testi yeniden başlat
      startTest();
    }
  }, [status, startTime, startTest]);

  const getStyle = () => {
    switch (status) {
      case 'waiting':
        return { backgroundColor: '#f94144', cursor: 'wait' }; // Kırmızı (Bekle)
      case 'ready':
        return { backgroundColor: '#90be6d', cursor: 'pointer' }; // Yeşil (Tıkla)
      default:
        return { backgroundColor: '#4361ee', cursor: 'pointer' }; // Mavi (Başlat/Sonuç)
    }
  };
  
  const getMessage = () => {
    if (reactionTime === 'too_early') {
      return "Too Early! Click to restart.";
    }
    if (reactionTime !== null && reactionTime !== 'too_early') {
      const performance = reactionTime < AVERAGE_TIME ? 
        `Above average! (${AVERAGE_TIME}ms)` : 
        `Below average! (${AVERAGE_TIME}ms)`;
        
      // TODO: Mini Kit SDK ile skoru Farcaster'da paylaşma özelliği buraya eklenebilir.
      return `Your time: ${reactionTime}ms. ${performance}. Click to restart.`;
    }
    
    switch (status) {
      case 'waiting':
        return `Wait for Green... (Delay: ${Math.round(delay/1000)}s)`;
      case 'ready':
        return "CLICK NOW!";
      case INITIAL_STATE:
      default:
        return "Click to start Reflex Test";
    }
  };

  return (
    <div 
      onClick={handleInteraction} 
      style={{
        ...getStyle(),
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        userSelect: 'none',
        transition: 'background-color 0.3s ease',
      }}
    >
      {getMessage()}
    </div>
  );
}

export default ReflexTestApp;
