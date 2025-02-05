// Create a container for the voice recognition component
const container = document.createElement('div');
container.id = 'cookie-voice-assistant';
document.body.appendChild(container);

// Create and inject the React component
const script = document.createElement('script');
script.src = 'http://localhost:5003/voice-recognition.js';
document.head.appendChild(script);