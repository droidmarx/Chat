// Função para inverter uma string
function reverseString(str) {
 return str.split(' ').map(word => word.split('').reverse().join('')).join(' ');
}

// Recuperar dados do localStorage
const username = localStorage.getItem('username');
const usercity = localStorage.getItem('usercity');

// Verificar se há nome de usuário no localStorage
if (!username) {
 // Redirecionar de volta ao index se não houver nome de usuário
 window.location.href = 'index.html';
}

// Exibir nome e cidade na página
document.getElementById('username').textContent = username || 'Anônimo';
document.getElementById('usercity').textContent = usercity || 'Desconhecida';

// Conectar ao Ably com a chave de API e o clientId (token aleatório)
const clientId = localStorage.getItem('clientId') || generateRandomToken(32);
localStorage.setItem('clientId', clientId); // Armazenar clientId no localStorage
const ably = new Ably.Realtime({
 key: 'ynrGug.SXDJOg:aoStJmyUcLlpwgEzYsJt8CFDsTBCq-yMjqNn6_DkgvM',
 clientId: clientId
});
const channel = ably.channels.get('chat');

// Função para atualizar a contagem de usuários online
function updateOnlineCount() {
 channel.presence.get((err, members) => {
  if (err) {
   console.error('Erro ao obter a contagem de usuários online:', err);
   return;
  }
  document.getElementById('onlineCount').textContent = members.length;
 });
}

// Entrar no canal de presença com o clientId (token aleatório)
function enterPresence() {
 channel.presence.enter({ name: username, city: usercity }, (err) => {
  if (err) {
   console.error('Erro ao entrar no canal de presença:', err);
   return;
  }
  updateOnlineCount();
 });
}

// Atualizar a contagem de usuários online quando alguém entra ou sai
channel.presence.subscribe('enter', member => {
 updateOnlineCount();
 displayNewUserAlert(member);
});
channel.presence.subscribe('leave', updateOnlineCount);
channel.presence.subscribe('update', updateOnlineCount);

channel.subscribe('message', function(message) {
 const data = message.data;
 const item = document.createElement('li');
 const messageTime = new Date(message.timestamp);
 const timeString = `${formatTime(messageTime.getHours())}:${formatTime(messageTime.getMinutes())}`;

 // Inverte apenas as palavras da mensagem antes de exibir
 const reversedMessage = reverseString(data.message);

 item.innerHTML = `
  <span class="min">${timeString}</span>
  <span class="city">${data.city}</span>
  <span class="name">${data.name} :</span>
  <span class="message">${wrapText(reversedMessage, 32)}</span>`;

 document.getElementById('messages').appendChild(item);
 document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight; // Scroll para o final

 // Tocar som de mensagem
 document.getElementById('messageSound').play();
});

// Variável para controlar o estado do chat
let chatStarted = false;

// Função para exibir alerta de novo usuário
function displayNewUserAlert(member) {
 const newUserAlert = document.getElementById('newUserAlert');
 const newUserSound = document.getElementById('newUserSound');

 newUserAlert.innerHTML = `<div class="new-user">${member.data.name} de ${member.data.city}</div>Entrou na sala`;
 newUserSound.play();

 // Adiciona a classe para iniciar a animação
 newUserAlert.classList.add('animate');

 setTimeout(() => {
  // Remove o conteúdo e a classe após 5 segundos
  newUserAlert.innerHTML = '';
  newUserAlert.classList.remove('animate');
 }, 5000); // Remove o alerta após 5 segundos
}

// Função para dividir o texto em várias linhas com um comprimento máximo especificado
function wrapText(text, maxLineLength) {
 const words = text.split(' ');
 let line = '';
 let result = '';

 for (const word of words) {
  if (line.length + word.length + 1 > maxLineLength) {
   result += line + '<br>';
   line = word;
  } else {
   line += (line ? ' ' : '') + word;
  }
 }

 return result + line;
}

// Função para enviar mensagens
function sendMessage() {
 const input = document.getElementById('input');
 if (input.value.trim() === '') return; // Evitar mensagens vazias

 channel.publish('message', {
  name: username || 'Anônimo',
  city: usercity || 'Desconhecida',
  message: input.value.trim()
 });

 input.value = '';
}

// Função para iniciar o chat
function startChat() {
 enterPresence();
 chatStarted = true;

 // Envia a mensagem digitada ao entrar
 sendMessage();

 // Muda o texto do botão para "Enviar"
 const submitButton = document.getElementById('submitButton');
 // Adiciona a classe 'showbutton'
 input.classList.add('showbutton');
 submitButton.textContent = 'Enviar';

 // Muda o evento de submit do formulário para apenas enviar mensagem
 document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  sendMessage();
 });
}

// Função para logoff (limpar localStorage e redirecionar para a página inicial)
function logoff() {
 localStorage.clear();
 window.location.href = 'index.html';
}

// Adicionar evento de clique ao botão de envio
document.getElementById('form').addEventListener('submit', function(e) {
 e.preventDefault();
 if (!chatStarted) {
  startChat();
 } else {
  sendMessage();
 }
});

// Sair do canal de presença ao fechar a janela
window.addEventListener('beforeunload', () => {
 channel.presence.leave({ name: username, city: usercity });
});

// Função para gerar token aleatório
function generateRandomToken(length) {
 let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 let token = '';
 let values = new Uint32Array(length);
 window.crypto.getRandomValues(values);
 for (let i = 0; i < length; i++) {
  token += charset[values[i] % charset.length];
 }
 return token;
}

// Função para formatar o tempo (adicionar zero à esquerda se for menor que 10)
function formatTime(time) {
 return time < 10 ? `0${time}` : time;
}

// Função para mostrar a sobreposição de usuários online
function showOnlineUsers() {
 const overlay = document.getElementById('onlineUsersOverlay');
 const userList = document.getElementById('onlineUsersList');
 userList.innerHTML = ''; // Limpar a lista

 // Obter membros da presença e exibi-los na lista
 channel.presence.get((err, members) => {
  if (err) {
   console.error('Erro ao obter usuários online:', err);
   return;
  }

  members.forEach(member => {
   const listItem = document.createElement('li');
   listItem.textContent = `${member.data.name} de ${member.data.city}`;
   userList.appendChild(listItem);
  });

  overlay.style.display = 'flex';
 });
}

// Função para ocultar a sobreposição de usuários online
function closeOverlay() {
 const overlay = document.getElementById('onlineUsersOverlay');
 overlay.style.display = 'none';
}

// Adicionar eventos aos botões
document.getElementById('showOnlineUsersButton').addEventListener('click', showOnlineUsers);
document.getElementById('closeOverlayButton').addEventListener('click', closeOverlay);

// Função para carregar mensagens do histórico da Ably
function loadMessagesFromAblyHistory() {
 channel.history({ limit: 100 }, function(err, resultPage) {
  if (err) {
   console.error('Erro ao carregar histórico de mensagens:', err);
   return;
  }

  resultPage.items.forEach(message => {
   const data = message.data;
   const item = document.createElement('li');
   const messageTime = new Date(message.timestamp);
   const timeString = `${formatTime(messageTime.getHours())}:${formatTime(messageTime.getMinutes())}`;

   const reversedMessage = reverseString(data.message);

   item.innerHTML = `
      <span class="min">${timeString}</span>
      <span class="city">${data.city}</span>
      <span class="name">${data.name} :</span>
      <span class="message">${wrapText(reversedMessage, 32)}</span>`;

   document.getElementById('messages').appendChild(item);
  });

  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight; // Scroll para o final
 });
}

// Carregar mensagens do histórico ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
// Outras inicializações
loadMessagesFromAblyHistory();
});