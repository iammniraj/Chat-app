/* eslint-disable no-undef */
// eslint-disable-next-line node/no-unsupported-features/es-syntax

const socket = io();

const clientTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const messageTone = new Audio();
messageTone.src = '/MessageTone.mp3';

const formDate = data => {
  const d = data.toString().split(' ');
  const formatDate = `${d[2]} ${d[1]} ${d[4]}`;
  return formatDate;
};

const scrollToBottom = () => {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
};

const clearTypingFeedback = () => {
  document.querySelectorAll('li.message-feedback').forEach(element => {
    element.parentNode.removeChild(element);
  });
};
const addMessageToUi = (isOwnMessage, data) => {
  clearTypingFeedback();
  const element = `<li class="${
    isOwnMessage ? 'message-right' : 'message-left'
  }">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${data.date}</span>
          </p>
        </li>`;
  messageContainer.innerHTML += element;
  scrollToBottom();
};

const sendMessage = () => {
  if (messageInput.value === ' ') return;
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    date: formDate(new Date(0))
  };
  socket.emit('message', data);
  addMessageToUi(true, data);
  messageInput.value = '';
};

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  sendMessage();
});

socket.on('client-total', data => {
  clientTotal.innerHTML = `User Connected ${data}`;
});

messageInput.addEventListener('focus', e => {
  e.preventDefault();
  socket.emit('feedack', {
    feedback: `${nameInput.value} is typing..`
  });
});

messageInput.addEventListener('keypress', () => {
  socket.emit('feedack', {
    feedback: `${nameInput.value} is typing..`
  });
});

messageInput.addEventListener('blur', e => {
  e.preventDefault();
  socket.emit('feedack', {
    feedback: ''
  });
});

socket.on('chat-message', data => {
  let audio = new Audio();
  audio.src = '/MessageTone.mp3';
  // when the sound has been loaded, execute your code
  audio.oncanplaythrough = () => {
    const playedPromise = audio.play();
    if (playedPromise) {
      playedPromise
        .catch(e => {
          if (e.name === 'NotAllowedError' || e.name === 'NotSupportedError') {
            console.log(e.name);
          }
        })
        .then(() => {});
    }
  };
  addMessageToUi(false, data);
});

socket.on('typing', data => {
  clearTypingFeedback();
  const element = `<li class="message-feedback">
          <p class="feedback" id="feedback">✍️ ${data.feedback}</p>
        </li> `;
  messageContainer.innerHTML += element;
});
