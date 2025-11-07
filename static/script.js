document.addEventListener('DOMContentLoaded', () => {
    let chatStage = 'askName';
    let userName = '';
    let userMood = '';
    let userLanguage = '';

    const messagesContainer = document.getElementById('messages');
    const moodForm = document.getElementById('mood-form');
    const moodInput = document.getElementById('mood-input');

    appendMessage("Hello! What's your name?", 'bot-message');

    moodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = moodInput.value.trim();
        if (!message) return;

        appendMessage(message, 'user-message');
        moodInput.value = '';

        try {
            if (chatStage === 'askName') {
                let response = await fetch('/set_name', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: message })
                });
                let data = await response.json();
                if (response.ok) {
                    userName = message;
                    appendMessage(data.message, 'bot-message');
                    // appendMessage(`Hi ${userName}, how are you feeling today?`, 'bot-message');
                    chatStage = 'askMood';
                } else {
                    appendMessage(data.error || "Please enter your name.", 'bot-message');
                }
            } else if (chatStage === 'askMood') {
                userMood = message;
                appendMessage(`Great, ${userName}! What language do you prefer for your music?`, 'bot-message');
                chatStage = 'askLanguage';
            } else if (chatStage === 'askLanguage') {
                userLanguage = message;
                appendMessage('Looking for songs...', 'bot-message');

                let response = await fetch('/get_playlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mood: userMood, language: userLanguage })
                });
                let data = await response.json();
                if (response.ok) {
                    appendMessage('Here is your playlist:', 'bot-message');
                    data.tracks.forEach(trackId => appendSpotifyPlayer(trackId));
                } else {
                    appendMessage(data.error || 'Failed to get playlist.', 'bot-message');
                }
                chatStage = 'done';
            }
        } catch (error) {
            appendMessage('Server error. Please try again later.', 'bot-message');
        }
    });

    function appendMessage(text, className) {
        const div = document.createElement('div');
        div.className = `message ${className}`;
        div.textContent = text;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return div;
    }

    function appendSpotifyPlayer(trackId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://open.spotify.com/embed/track/${trackId}`;
        iframe.width = "100%";
        iframe.height = "80";
        iframe.frameBorder = "0";
        iframe.allowFullscreen = true;

        const container = document.createElement('div');
        container.className = 'message bot-message spotify-message';
        container.appendChild(iframe);
        messagesContainer.appendChild(container);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
